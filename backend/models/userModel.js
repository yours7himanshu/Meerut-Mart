import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    role: { type: String, default: 'user' }
}, { minimize: false });

const userModel = (mongoose.models && mongoose.models.User) || mongoose.model('User', userSchema);

export default userModel;
