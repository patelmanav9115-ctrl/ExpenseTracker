import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    limit: {
        type: Number,
        required: true,
    },
    period: {
        type: String,
        enum: ['monthly', 'weekly'],
        default: 'monthly',
    }
}, {
    timestamps: true
});

// Ensure a user can only have one budget per category per period type
budgetSchema.index({ userId: 1, category: 1, period: 1 }, { unique: true });

const budgetModel = mongoose.models.budget || mongoose.model("budget", budgetSchema);
export default budgetModel;
