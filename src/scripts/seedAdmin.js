
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import { USER_ROLES } from "../common/constants.js";

dotenv.config({ path: ".env" });

const seedAdmin = async () => {
    try {
        const mongoDBUri = process.env.MONGO_URL;
        if (!mongoDBUri) {
            console.error("MONGO_URL is not defined in .env file");
            process.exit(1);
        }

        await mongoose.connect(mongoDBUri);
        console.log("Connected to MongoDB");

        const adminEmail = "admin@admin.com";
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log("Admin user already exists");
        } else {
            const hashedPassword = await bcrypt.hash("admin@123", 10);
            const adminUser = new User({
                name: "admin",
                email: adminEmail,
                password: hashedPassword,
                role: USER_ROLES.ADMIN || "admin", // Fallback if constant not available, though checks showed it should be
                phone: "0000000000",
                status: true
            });

            await adminUser.save();
            console.log("Admin user created successfully");
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin user:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seedAdmin();
