import mongoose from 'mongoose';
import { USER_ROLES } from '../common/constants.js';
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: USER_ROLES,
        default: USER_ROLES.USER
    },
    status: {
        type: Boolean,
        default: true
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true, versionKey: false });

const User = mongoose.model('User', userSchema);
export default User;