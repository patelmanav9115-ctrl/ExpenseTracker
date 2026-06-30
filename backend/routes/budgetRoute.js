import express from "express";
import { getBudgets, addBudget, deleteBudget } from "../controllers/budgetController.js";
import authMiddleware from "../middleware/auth.js";

const budgetRouter = express.Router();

budgetRouter.use(authMiddleware);
budgetRouter.get("/", getBudgets);
budgetRouter.post("/", addBudget);
budgetRouter.delete("/:id", deleteBudget);

export default budgetRouter;
