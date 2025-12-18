import mongoose from 'mongoose';
import { PET_ADOPTION_STATUS } from '../common/constants.js';
const { Schema } = mongoose;

const adoptionApplicationSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true
    },
    petId: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: PET_ADOPTION_STATUS,
        default: PET_ADOPTION_STATUS.PENDING,
        required: true
    }
}, { timestamps: true, versionKey: false });

const AdoptionApplication = mongoose.model('AdoptionApplication', adoptionApplicationSchema);
export default AdoptionApplication;