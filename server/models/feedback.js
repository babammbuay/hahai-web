import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    feedback: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
