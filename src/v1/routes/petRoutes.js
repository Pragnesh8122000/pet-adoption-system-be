import { Router } from "express";
import {
    authenticateToken,
    authorizeUser,
} from "../../middlewares/authUser.js";
import { createPets, deletePet, getAllPets, getPetDetails, updatePets } from "../controllers/petController.js";
import { USER_ROLES } from "../../common/constants.js";
const petRoutes = Router();

petRoutes.get("/getAllPets", getAllPets);
petRoutes.get("/getPetDetails", getPetDetails);
petRoutes.post("/createPets", authenticateToken, authorizeUser(USER_ROLES.ADMIN), createPets);
petRoutes.put("/updatePets", authenticateToken, authorizeUser(USER_ROLES.ADMIN), updatePets);
petRoutes.delete("/deletePet", authenticateToken, authorizeUser(USER_ROLES.ADMIN), deletePet);

export default petRoutes;