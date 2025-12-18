import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "../config/database.js";
import authRoutes from "./v1/routes/authRoutes.js";
import petRoutes from "./v1/routes/petRoutes.js";
dotenv.config();
/**
 * Initializes and configures an Express application, setting up middleware for CORS, JSON parsing,
 * URL-encoded data, and custom response handling. Loads API routes for the specified versions
 *
 * @returns {Promise<Object>} Returns the configured Express application instance.
 */

async function server() {
    try {
        const app = express();
        app.use(
            cors({
                origin: process.env.CORS_URL,
            }),
        );
        app.use(express.json({ limit: "50mb" }));
        app.use(express.urlencoded({ limit: "50mb", extended: true }));

        // loading routes for v1
        app.use("/petAdoptionApis/v1", authRoutes);
        app.use("/petAdoptionApis/v1", petRoutes);
        
        return app;
    } catch (error) {
        console.log(error);
    }
}

export default server;
