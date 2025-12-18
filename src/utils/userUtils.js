import jwt from "jsonwebtoken";

export const getJWTToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRES_IN });
};