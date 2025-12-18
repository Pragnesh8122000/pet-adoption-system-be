import mongoose from 'mongoose';
import { PET_STATUS } from '../common/constants.js';
const { Schema } = mongoose;

const petSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    breed: {
        type: String,
        index: true,
        required: true
    },
    age: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: PET_STATUS,
        default: PET_STATUS.AVAILABLE,
        required: true
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true, versionKey: false });



const Pet = mongoose.model('Pet', petSchema);
export default Pet;