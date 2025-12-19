import { HTTP_STATUS, RES_STATUS } from "../common/constants.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authenticateToken = async (req, res, next) => {
    try {
        const token = req.headers["token"];

        if (!token || typeof token !== "string") {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Invalid token passed" });
        }
        let decodedPayload;

        try {
            decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Please login again" });
        }

        if (!decodedPayload) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "Invalid token passed" });
        }

        const { id } = decodedPayload;
        const isUserExist = await User.findOne({ _id: id }, { _id: 1 })
        if (!isUserExist) {
            return res.status(HTTP_STATUS.ERROR).json({ status: RES_STATUS.FAILURE, message: "User not found" });
        }
        req.user = decodedPayload;
        next();

    } catch (error) {
        return res.status(HTTP_STATUS.SOMETHING_WENT_WRONG).json({ status: RES_STATUS.SERVER_ERROR, message: "Internal Server Error" });
    }
}

export const authorizeUser = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).json({
                    status: RES_STATUS.FAILURE,
                    message: "Unauthorized access"
                });
            }

            // Check role
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    status: RES_STATUS.FAILURE,
                    message: "You do not have permission to perform this action"
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                status: RES_STATUS.FAILURE,
                message: "Authorization failed"
            });
        }
    };
};