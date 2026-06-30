import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    expenseCategories: {
        type: [String],
        default: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Education', 'Rent', 'Travel', 'Personal Care', 'Other']
    },
    incomeCategories: {
        type: [String],
        default: ['Salary', 'Freelance', 'Business', 'Investments', 'Rental', 'Side Hustle', 'Other']
    }
});

const userModel = mongoose.models.User || mongoose.model('User', userSchema);
export default userModel;