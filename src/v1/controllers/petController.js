import mongoose, { isValidObjectId, Types } from "mongoose";
import bcrypt from "bcrypt";
import { HTTP_STATUS, PET_STATUS, RES_STATUS } from "../../common/constants.js";
import { createPetValidation, idValidation, updatePetValidation } from "../../common/validation.js";
import Pet from "../../models/petModel.js";

export const createPets = async (req, res) => {
    try {
        const isValid = createPetValidation.validate(req.body);
        if (isValid.error) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: isValid.error.details[0].message });
        }
        const { name, breed, age } = req.body;

        const isNameWithSameBreedExist = await Pet.countDocuments({ status: PET_STATUS.AVAILABLE, name, breed, deletedAt: null });

        if (isNameWithSameBreedExist) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Name with same breed already exist" });
        }
        await Pet.create({
            name,
            breed,
            age,
        });

        return res.status(HTTP_STATUS.OK).json({ status: RES_STATUS.SUCCESS, message: "Pet created successfully" });
    } catch (error) {
        return res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.FAILURE, message: "Internal Server Error" });
    }
}

export const updatePets = async (req, res) => {
    try {
        const isValid = updatePetValidation.validate(req.body);
        if (isValid.error) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: isValid.error.details[0].message });
        }
        const { id, name, breed, age } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Invalid id passed" });
        }

        const isIdExist = await Pet.countDocuments({ deletedAt: null, _id: id });
        if (!isIdExist) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Pet does not exist" });
        }

        const isNameWithSameBreedExist = await Pet.countDocuments({ status: PET_STATUS.AVAILABLE, name, breed, deletedAt: null, _id: { $ne: id } });
        if (isNameWithSameBreedExist) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Name with same breed already exist" });
        }
        await Pet.updateOne({ _id: id }, {
            name,
            breed,
            age,
        });

        return res.status(HTTP_STATUS.OK).json({ status: RES_STATUS.SUCCESS, message: "Pet updated successfully" });
    } catch (error) {
        return res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.FAILURE, message: "Internal Server Error" });
    }
}

export const deletePet = async (req, res) => {
    try {
        const isValid = idValidation.validate(req.query);
        if (isValid.error) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: isValid.error.details[0].message });
        }
        const { id } = req.query;

        if (!isValidObjectId(id)) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Invalid id passed" });
        }

        const isIdExist = await Pet.countDocuments({ deletedAt: null, _id: id });
        if (!isIdExist) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Pet does not exist" });
        }

        await Pet.updateOne({ _id: id }, {
            deletedAt: new Date()
        });

        return res.status(HTTP_STATUS.OK).json({ status: RES_STATUS.SUCCESS, message: "Pet deleted successfully" });
    } catch (error) {
        return res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.FAILURE, message: "Internal Server Error" });
    }
}

export const getAllPets = async (req, res) => {
    try {

        let {
            page = 1,
            limit = 10,
            search = "",
            breed = "",
            age = "",
        } = req.query;

        limit = Number(limit);
        page = Number(page);

        const skip = (Number(page) - 1) * Number(limit);

        const filter = { deletedAt: null };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { breed: { $regex: search, $options: "i" } },
            ];
        }

        if (breed) {
            filter.breed = { $regex: breed, $options: "i" };
        }

        if (age) {
            filter.age = Number(age);
        }

        const allPets = await Pet.aggregate([
            {
                $project: {
                    name: 1,
                    breed: 1,
                    age: 1,
                    status: 1,
                }
            },
            {
                "$match": filter
            },
        ]);

        const pets = await Pet.aggregate([
            {
                $project: {
                    name: 1,
                    breed: 1,
                    age: 1,
                    status: 1,
                }
            },
            {
                "$match": filter
            },
            { $skip: skip },
            { $limit: limit },
        ]);

        const totalCount = allPets.length;

        const remainingCount = totalCount - pets.length;
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(HTTP_STATUS.OK).json({
            status: RES_STATUS.SUCCESS, message: "Pets list fetched successfully", data: {
                pets,
                totalPages,
                currentPage: page,
                totalCount,
                remainingCount,
            }
        });
    } catch (error) {
        return res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.FAILURE, message: "Internal Server Error" });
    }
}

export const getPetDetails = async (req, res) => {
    try {

        const isValid = idValidation.validate(req.query);
        if (isValid.error) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: isValid.error.details[0].message });
        }
        const { id } = req.query;

        if (!isValidObjectId(id)) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Invalid id passed" });
        }

        const isIdExist = await Pet.countDocuments({ deletedAt: null, _id: id });
        if (!isIdExist) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Pet does not exist" });
        }

        const petId = Types.ObjectId.createFromHexString(id);

        const pets = await Pet.aggregate([
            {
                $project: {
                    name: 1,
                    breed: 1,
                    age: 1,
                    status: 1,
                }
            },
            {
                "$match": { _id: petId, deletedAt: null }
            },
            { $limit: 1 },
        ]);
        return res.status(HTTP_STATUS.OK).json({
            status: RES_STATUS.SUCCESS, message: "Pets details fetched successfully", data: {
                pet: pets[0],
            }
        });
    } catch (error) {
        return res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.FAILURE, message: "Internal Server Error" });
    }
}