import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 1
    },
    savedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deadline: {
        type: Date,
        default: null
    },
    icon: {
        type: String,
        default: '🎯'
    },
    color: {
        type: String,
        default: '#8b5cf6'
    }
}, { timestamps: true });

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
