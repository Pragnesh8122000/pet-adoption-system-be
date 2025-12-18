import mongoose from 'mongoose';
import { PET_ADOPTION_STATUS } from '../common/constants.js';
const { Schema } = mongoose;

const adoptionApplicationSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    petId: {
        type: String,
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

// adoptionApplicationSchema.index(
//     { userId: 1, petId: 1 },
// );

const AdoptionApplication = mongoose.model('AdoptionApplication', adoptionApplicationSchema);
export default AdoptionApplication;