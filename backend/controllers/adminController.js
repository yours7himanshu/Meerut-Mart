import Admin from "../models/adminModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    
    console.log("Login attempt:", { email, password });

    console.log("Admin hashed password:", admin.password);
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default adminLogin;
