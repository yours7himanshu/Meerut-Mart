import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from '../models/adminModel.js';
import Seller from '../models/sellerModel.js';
import validator from "validator"; 
import User from '../models/userModel.js'; 


const createToken = (id, role, name) => {
    return jwt.sign({ id, role, name }, process.env.JWT_SECRET, {
        expiresIn: '1d' 
    });
};

// Route for user login
const loginUser = async (req, res) => {
    const { email } = req.body;

    try {
       
        let user = await User.findOne({ email });

        if (user) {
           
            const token = createToken(user._id, 'user', user.name);

            return res.status(200).json({
                success: true,
                token,
                role: 'user',
                name: user.name 
            });
        } else {
           
            let seller = await Seller.findOne({ email });

            if (seller) {
                const token = createToken(seller._id, 'seller', seller.name); 

                return res.status(200).json({
                    success: true,
                    token,
                    role: 'seller',
                    name: seller.name 
                });
            }
        }

   
        res.status(401).json({ success: false, message: 'Invalid credentials' });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Route for user registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists with the same email." });
        }

        // Validate email and password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please use a strong password of at least 8 characters" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save new user
        const newUser = new userModel({ name, email, password: hashedPassword });
        const user = await newUser.save();

        // Create token with name
        const token = createToken(user._id, 'user', user.name);
        res.json({ success: true, token, name: user.name }); // Send name with token
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Route for super admin login
const superAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

       
        if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
            const token = jwt.sign(
                { email, role: 'superadmin', name: 'Super Admin' }, // Set name to 'Super Admin'
                process.env.JWT_SECRET
            );
            res.json({ success: true, token, name: 'Super Admin' }); // Send name with token
        } else {
            res.json({ success: false, message: "Invalid Credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Promote a user to admin
const promoteToAdmin = async (req, res) => {
    try {
        const { userId } = req.body;
        const seller = await Seller.findById(userId);
        if (!seller) {
            return res.json({ success: false, message: "Seller not found" });
        }

        // Check if the user is already an admin
        const existingAdmin = await Admin.findOne({ email: seller.email });
        if (existingAdmin) {
            return res.json({ success: false, message: "Seller is already an admin" });
        }

        // Promote the seller to admin by creating an entry in the Admin collection
        const hashedPassword = seller.password;
        const newAdmin = new Admin({ email: seller.email, password: hashedPassword });
        await newAdmin.save();

        res.json({ success: true, message: "User promoted to admin" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Demote an admin to a regular user
const demoteToUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Remove admin entry from Admin collection
        await Admin.findOneAndDelete({ email: user.email });

        res.json({ success: true, message: "Admin demoted to user" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { loginUser, registerUser, superAdminLogin, promoteToAdmin, demoteToUser };

