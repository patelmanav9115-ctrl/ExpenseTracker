import User from '../model/userModel.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { processUserRecurrences } from '../utils/recurrence.js';

const createAccessToken = (userId) => 
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '15m' });

const createRefreshToken = (userId) => 
    jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' });


// REGISTER A USER
export const registerUser = async (req, res) => {
     const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                 message: "All fields are required" 
            });
        
        }
        if(!validator.isEmail((email))) {
            return res.status(400).json({
               success: false,
               message: "Invalid email"
            });
        }
        if (password.length < 8) {
           return res.status(400).json({
               success: false,
               message: "Password must be at least 8 characters "
            });
        }

        try {
            if (await User.findOne({ email })) {
                return res.status(400).json({
                    success: false,
                    message: "User already present"
                });
            }

            const hashed = await bcrypt.hash(password, 10);
            const user = await User.create({name, email, password: hashed});
            const token = createAccessToken(user._id);
            const refreshToken = createRefreshToken(user._id);
            
            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
            
            res.status(201).json({
            success: true,
            user: {id: user._id, name: user.name, email: user.email}
        });
    }         
    
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

// to login a user
export async function loginUser(req,res){
    const {email, password} = req.body;
    if(!email || !password) { 
        return res.status(400).json({
            success: false,
            message: "Both field are requried"
        });
    }
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
            
        }

        const match = await bcrypt.compare(password, user.password);
        if(!match){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = createAccessToken(user._id);
        const refreshToken = createRefreshToken(user._id);

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

        // Fire-and-forget: process any pending recurring transactions
        processUserRecurrences(user._id).catch(console.error);

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                expenseCategories: user.expenseCategories,
                incomeCategories: user.incomeCategories
            }
        });
    }

    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

// to get login user details
export async function getCurrentUser(req, res){
  try{
    const user = await User.findById(req.user.id).select("name email expenseCategories incomeCategories")
    if (!user){
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    res.json({success: true, user});
   }

     catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }

}

// to update a user profile
export async function updateProfile(req, res){
    const {name , email } = req.body;
    if(!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Valid email and name are required."
        });
    }

    try {
    const exists = await User.findOne({ email, _id:{ $ne: req.user.id } });
    if (exists) {
        return res.status(409).json({
            success: false,
            message: "Email already in use."
        });
    }
    const user = await User.findByIdAndUpdate(
        req.user.id,
        {name, email},
        {new : true, runValidators: true, select: "name email"}
    );
    res.json({
        success: true,
        user
    });

    } 
    
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }

 }
   
 // to change user password
 export async function updatePassword(req, res){
    const { currentPassword, newPassword} = req.body;
    if(!currentPassword || !newPassword || newPassword.length < 8 ) {
        return res.status(400).json({
            success: false,
            message: "Password invalid or too short."
        });
    }
    try {
    const user = await User.findById(req.user.id).select("password");
    if(!user) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        });
    }
    const match = await bcrypt.compare(currentPassword,user.password);
    if(!match) {
        return res.status(401).json({
            success: false,
            message: "Current password is incorrect."
        });    

    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({
        success: true,
        message: "Password changed"
    });    

    }
    
     catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }

 }

 // to refresh token
 export async function refreshToken(req, res){
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) {
        return res.status(401).json({ success: false, message: "Refresh token required" });
    }
    try {
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(payload.id);
        if(!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        const newToken = createAccessToken(user._id);
        res.cookie('token', newToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
        res.json({
            success: true
        });
    } catch (err) {
        console.error("Refresh token error:", err);
        return res.status(401).json({ success: false, message: "Invalid or expired refresh token", code: "REFRESH_EXPIRED" });
    }
 }


export async function logoutUser(req, res) {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
}

export async function updateCategories(req, res) {
    const { expenseCategories, incomeCategories } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        if (expenseCategories && Array.isArray(expenseCategories)) {
            user.expenseCategories = expenseCategories;
        }
        if (incomeCategories && Array.isArray(incomeCategories)) {
            user.incomeCategories = incomeCategories;
        }
        
        await user.save();
        
        res.json({
            success: true,
            message: "Categories updated successfully",
            expenseCategories: user.expenseCategories,
            incomeCategories: user.incomeCategories
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}