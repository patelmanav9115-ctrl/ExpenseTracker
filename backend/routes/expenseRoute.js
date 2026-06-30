import express from 'express'
import authMiddleware from '../middleware/auth.js';
import { addExpense, downloadExpenseExcel, downloadExpensePDF, getAllExpense, getExpenseOverview, updateExpense, deleteExpense } from '../controllers/expenseController.js';

const expenseRouter = express.Router();

expenseRouter.post("/add", authMiddleware, addExpense);
expenseRouter.get("/get", authMiddleware, getAllExpense);

expenseRouter.put("/update/:id", authMiddleware, updateExpense);
expenseRouter.get("/download", authMiddleware, downloadExpenseExcel);
expenseRouter.get("/download-pdf", authMiddleware, downloadExpensePDF);

expenseRouter.delete("/delete/:id", authMiddleware, deleteExpense);
expenseRouter.get("/overview", authMiddleware, getExpenseOverview);

export default expenseRouter;
