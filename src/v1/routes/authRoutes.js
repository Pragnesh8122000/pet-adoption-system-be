import { Router } from "express";
import {
    loginUser,
    registerUser,
    fetchUserDetails,
} from "../controllers/authController.js";
import { authenticateToken } from "../../middlewares/authUser.js";

const authRoutes = Router();

authRoutes.post("/login", loginUser);
authRoutes.post("/register", registerUser);
authRoutes.get("/fetchUserDetails", authenticateToken, fetchUserDetails);

export default authRoutes;
