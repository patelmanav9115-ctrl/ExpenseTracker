import User from "../model/userModel.js";
import jwt from "jsonwebtoken";

export default async function authMiddleware(req, res, next) {
    // grab the token from cookies
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized or token missing"
        });
    }

    // to verify the token
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }
        req.user = user;
        next();
    }
    catch (err) {
        console.error("JWT verification failed:", err.message);
        const isExpired = err.name === 'TokenExpiredError';
        return res.status(401).json({
            success: false,
            message: isExpired ? "Token expired" : "Token invalid",
            code: isExpired ? "TOKEN_EXPIRED" : "TOKEN_INVALID"
        });
    }
}
    
    