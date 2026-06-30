import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrenceInterval: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  lastRecurrenceDate: {
    type: Date,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  }, //for a particular user
  type: {
    type: String,
    default: "income",
  },
}, {
  timestamps: true
});

const incomeModel = mongoose.models.income || mongoose.model("income", incomeSchema);
export default incomeModel;