import express from "express";
import authMiddleware from "../middleware/auth.js";
import { addIncome, deleteIncome, downloadIncome, downloadIncomePDF, getIncome, getIncomeOverview, updateIncome } from "../controllers/incomeController.js"

const incomeRouter = express.Router();

incomeRouter.post("/add", authMiddleware, addIncome);
incomeRouter.get("/get", authMiddleware, getIncome);

incomeRouter.put("/update/:id", authMiddleware, updateIncome);
incomeRouter.get("/download", authMiddleware, downloadIncome);
incomeRouter.get("/download-pdf", authMiddleware, downloadIncomePDF);

incomeRouter.delete("/delete/:id", authMiddleware, deleteIncome);
incomeRouter.get("/overview", authMiddleware, getIncomeOverview);

export default incomeRouter;