import mongoose, { isValidObjectId, Types } from "mongoose";
import bcrypt from "bcrypt";
import { HTTP_STATUS, PET_ADOPTION_STATUS, PET_STATUS, RES_STATUS } from "../../common/constants.js";
import { idValidation, updateAdoptionStatusValidation } from "../../common/validation.js";
import Pet from "../../models/petModel.js";
import AdoptionApplication from "../../models/adoptionApplicationModel.js";


export const adoptPet = async (req, res) => {
    try {
        const isValid = idValidation.validate(req.body);
        if (isValid.error) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: isValid.error.details[0].message });
        }
        const { id } = req.body;

        const userId = req.user.id;

        if (!isValidObjectId(id)) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Invalid id passed" });
        }

        const isIdExist = await Pet.findOne({ deletedAt: null, _id: id }, { status: 1, id: 1 });
        if (!isIdExist) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Pet does not exist" });
        }
        if (isIdExist.status !== PET_STATUS.AVAILABLE) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Pet is not available to adopt" });
        }

        await Pet.updateOne({ _id: id }, {
            status: PET_STATUS.PENDING
        });

        await AdoptionApplication.create({
            userId: userId,
            petId: id,
        })

        res.status(HTTP_STATUS.OK).json({ status: RES_STATUS.SUCCESS, message: "Pet updated successfully" });
    } catch (error) {
        res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.FAILURE, message: "Internal Server Error" });
    }
}

export const updateAdoptionStatus = async (req, res) => {
    try {
        const isValid = updateAdoptionStatusValidation.validate(req.body);
        if (isValid.error) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: isValid.error.details[0].message });
        }
        const { id, status } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Invalid id passed" });
        }
        if (!Object.values(PET_ADOPTION_STATUS).includes(status)) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Invalid adoption status passed" });
        }

        const isIdExist = await AdoptionApplication.findOne({ deletedAt: null, _id: id }, { status: 1, id: 1, petId: 1 });
        if (!isIdExist) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Adoption application does not exist" });
        }
        if (isIdExist.status !== PET_ADOPTION_STATUS.PENDING) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "adoption application status should be pending to update" });
        }

        const isPetIdExist = await Pet.findOne({ deletedAt: null, _id: isIdExist.petId }, { status: 1, id: 1 });
        if (!isPetIdExist) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Pet does not exist" });
        }
        if (isPetIdExist.status !== PET_ADOPTION_STATUS.PENDING) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Pet status should be pending to update" });
        }

        await AdoptionApplication.updateOne({ _id: id }, {
            status: status
        });

        // if approved then make pet status addopted else make it available again
        const newPetStatus = status === PET_ADOPTION_STATUS.APPROVED ? PET_STATUS.ADOPTED : PET_STATUS.AVAILABLE

        await Pet.updateOne({ _id: isIdExist?.petId }, {
            status: newPetStatus
        });

        res.status(HTTP_STATUS.OK).json({ status: RES_STATUS.SUCCESS, message: "Pet status updated successfully" });
    } catch (error) {
        console.log(error)
        res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.FAILURE, message: "Internal Server Error" });
    }
}

export const getUsersAdoptionApplications = async (req, res) => {
    try {

        let {
            page = 1,
            limit = 10,
        } = req.body;

        const skip = (page - 1) * limit;

        const userId = req.user.id;

        const allAdoptionApplications = await AdoptionApplication.aggregate([

            {
                $project: {
                    userId: 1,
                    petId: 1,
                }
            },
            {
                "$match": { userId: new Types.ObjectId(userId) }
            },
        ]);

        const adoptionApplications = await AdoptionApplication.aggregate([
            {
                $lookup: {
                    from: 'pets',
                    localField: 'petId',
                    foreignField: '_id',
                    as: 'pet',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },

            },
            { $unwind: "$user" },
            { $unwind: "$pet" },
            {
                $project: {
                    userId: 1,
                    petId: 1,
                    status: 1,
                    userName: "$user.name",
                    petName: "$pet.name",
                }
            },
            {
                "$match": { userId: new Types.ObjectId(userId) }
            },
            { $skip: skip },
            { $limit: limit },
        ]);

        const totalCount = allAdoptionApplications.length;

        const remainingCount = totalCount - adoptionApplications.length;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(HTTP_STATUS.OK).json({
            status: RES_STATUS.SUCCESS, message: "Pets list fetched successfully", data: {
                adoptionApplications: adoptionApplications,
                totalPages,
                currentPage: page,
                totalCount,
                remainingCount,
            }
        });
    } catch (error) {
        console.log(error)
        res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.FAILURE, message: "Internal Server Error" });
    }
}

export const getAllAdoptionApplications = async (req, res) => {
    try {

        let {
            page = 1,
            limit = 10,
        } = req.body;

        const skip = (page - 1) * limit;

        const allAdoptionApplications = await AdoptionApplication.aggregate([
            {
                $project: {
                    userId: 1,
                    petId: 1,
                }
            },
        ]);

        const adoptionApplications = await AdoptionApplication.aggregate([
            {
                $lookup: {
                    from: 'pets',
                    localField: 'petId',
                    foreignField: '_id',
                    as: 'pet',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },

            },
            { $unwind: "$user" },
            { $unwind: "$pet" },
            {
                $project: {
                    userId: 1,
                    petId: 1,
                    status: 1,
                    userName: "$user.name",
                    petName: "$pet.name",
                }
            },
            { $skip: skip },
            { $limit: limit },
        ]);

        const totalCount = allAdoptionApplications.length;

        const remainingCount = totalCount - adoptionApplications.length;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(HTTP_STATUS.OK).json({
            status: RES_STATUS.SUCCESS, message: "Pets list fetched successfully", data: {
                adoptionApplications: adoptionApplications,
                totalPages,
                currentPage: page,
                totalCount,
                remainingCount,
            }
        });
    } catch (error) {
        console.log(error)
        res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.FAILURE, message: "Internal Server Error" });
    }
}