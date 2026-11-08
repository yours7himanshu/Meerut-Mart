import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
    try {
        const rawToken = req.headers['token'] || req.headers['authorization'];
        if (!rawToken) {
            return res.json({ success: false, message: "Not Authorized, Token Missing" });
        }

        const token = rawToken.startsWith('Bearer ') ? rawToken.split(' ')[1] : rawToken;

        // Decode token to extract email
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by email instead of ID
        const user = await userModel.findOne({ email: token_decode.email });
        if (!user) {
            return res.json({ success: false, message: "User Not Found" });
        }

        req.admin = user;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default adminAuth;
