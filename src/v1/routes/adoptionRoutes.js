import { Router } from "express";
import {
    authenticateToken,
    authorizeUser,
} from "../../middlewares/authUser.js";
import { updateAdoptionStatus, adoptPet, getUsersAdoptionApplications, getAllAdoptionApplications } from "../controllers/adoptionController.js";
import { USER_ROLES } from "../../common/constants.js";
const adoptionRoutes = Router();

// Admin routes
adoptionRoutes.put("/updateAdoptionStatus", authenticateToken, authorizeUser([USER_ROLES.ADMIN]), updateAdoptionStatus);
adoptionRoutes.get("/getAllAdoptionApplications", authenticateToken, authorizeUser([USER_ROLES.ADMIN]), getAllAdoptionApplications);

// user routes
adoptionRoutes.put("/adoptPet", authenticateToken, authorizeUser([USER_ROLES.USER]), adoptPet);
adoptionRoutes.get("/getUsersAdoptionApplications", authenticateToken, authorizeUser([USER_ROLES.USER]), getUsersAdoptionApplications);

export default adoptionRoutes;