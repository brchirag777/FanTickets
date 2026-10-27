const Customer = require('../models/customer.model');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

// Task 1: Register Customer
exports.registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: "All fields are mandatory" });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must contain at least 6 characters" });
        }

        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const customer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        // FIX APPLIED HERE: Generate token and set cookie so the user is instantly logged in
        const token = generateToken(customer._id);
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            token,
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Task 2: Login Customer
exports.loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(401).json({ success: false, message: "Invalid email or password" }); 
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(customer._id);

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({ 
            success: true, 
            message: "Login successful",
            token,
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Task 3: My Profile
exports.myProfile = async (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone
    });
};

// Task 4: Logout
exports.logoutCustomer = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production"
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Bonus Task: Change Password
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Both old and new passwords are required" });
        }

        const customer = await Customer.findById(req.user._id);
        const isMatch = await bcrypt.compare(oldPassword, customer.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect old password" });
        }

        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(newPassword, salt);
        await customer.save();

        res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};

// Bonus Task: Update Profile (Full Name & Phone)
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, phone } = req.body;
        if (!fullName || !phone) {
            return res.status(400).json({ success: false, message: "Full Name and Phone are required" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        customer.fullName = fullName.trim();
        customer.phone = phone.trim();
        await customer.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

