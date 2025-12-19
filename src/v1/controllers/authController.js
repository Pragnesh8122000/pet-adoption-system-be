import mongoose, { isValidObjectId, Types } from "mongoose";
import bcrypt from "bcrypt";
import { HTTP_STATUS, RES_STATUS } from "../../common/constants.js";
import User from "../../models/userModel.js";
import { idValidation, loginUserValidation, registerUserValidation } from "../../common/validation.js";
import jwt from "jsonwebtoken";
import { getJWTToken } from "../../utils/userUtils.js";

export const loginUser = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(HTTP_STATUS.ERROR).json({ status: 0, message: "All fields are required" });
        }
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Email and password are required" });
        }

        const isValid = loginUserValidation.validate(req.body);
        if (isValid.error) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: isValid.error.details[0].message });
        }

        const user = await User.findOne({ status: true, email: email }, { phone: 1, password: 1, name: 1, email: 1, role: 1 });

        if (!user) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "User not found" });
        }
        const { phone, password: dbPass, name, role } = user;

        const isPasswordValid = await bcrypt.compare(password, dbPass);

        if (!isPasswordValid) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Invalid email or password" });
        }

        const token = getJWTToken(user);

        res.status(HTTP_STATUS.OK).json({ status: RES_STATUS.SUCCESS, message: "Login successful", data: { user: { name: name, email: email, phone: phone, role }, token } });
    } catch (error) {
        res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.FAILURE, message: "Internal Server Error" });
    }
}

export const registerUser = async (req, res) => {
    try {
        const isValid = registerUserValidation.validate(req.body);
        if (isValid.error) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: isValid.error.details[0].message });
        }
        const { name, email, phoneNumber, password } = req.body;

        const isEmailExist = await User.countDocuments({ status: true, email });

        if (isEmailExist) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Email already exist" });
        }

        const isPhoneNumberExist = await User.countDocuments({ status: true, phone: phoneNumber });

        if (isPhoneNumberExist) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Phone already exist" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        await User.create({
            name,
            email,
            phone: phoneNumber,
            password: hashedPassword
        });

        return res.status(HTTP_STATUS.OK).json({ status: RES_STATUS.SUCCESS, message: "User registered successfully", data: { user: { name, email, phone: phoneNumber } } });
    } catch (error) {
        return res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.FAILURE, message: "Internal Server Error" });
    }
}

export const fetchUserDetails = async (req, res) => {
    try {
        const id = req.user.id;

        if (!isValidObjectId(id)) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Invalid id passed" });
        }

        const isIdExist = await User.countDocuments({ deletedAt: null, _id: id });
        if (!isIdExist) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "User does not exist" });
        }

        const userId = Types.ObjectId.createFromHexString(id);

        const user = await User.findOne({ _id: userId, deletedAt: null }, { name: 1, email: 1, phone: 1, role: 1, status: 1 });
        return res.status(HTTP_STATUS.OK).json({
            status: RES_STATUS.SUCCESS, message: "user details fetched successfully", data: {
                user,
            }
        });
    } catch (error) {
        return res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.FAILURE, message: "Internal Server Error" });
    }
}