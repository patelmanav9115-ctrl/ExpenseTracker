import express from "express";
import { loginUser, registerUser, getCurrentUser, updateProfile, updatePassword, refreshToken, logoutUser, updateCategories } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/refresh", refreshToken);
userRouter.post("/logout", logoutUser);

// protected Routes
userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.put("/me", authMiddleware, updateProfile);
userRouter.put("/password", authMiddleware, updatePassword);
userRouter.put("/categories", authMiddleware, updateCategories);

export default userRouter;
