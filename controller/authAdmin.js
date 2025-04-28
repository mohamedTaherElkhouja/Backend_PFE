const Admin = require("../model/adminModel");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

// LOGIN
module.exports.Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ message: "Email not found" });
        }

        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = JWT.sign(
            { adminId: admin._id }, // No need to send more data unless needed
            process.env.TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            success: true,
            token,
            admin: { _id: admin._id, email: admin.email }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// VERIFY TOKEN
module.exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization; // 💥 Correction: "authorization" not "authorisation"
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const tokenWithoutBearer = token.split(' ')[1];
    JWT.verify(tokenWithoutBearer, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token verification failed" });
        }
        req.admin = decoded;
        next();
    });
};

// FORGET PASSWORD

