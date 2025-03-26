const User = require("../model/userModel");
const JWT = require("jsonwebtoken");
require("dotenv").config();

module.exports.Login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).populate("roleId"); // Populate role

        if (!user) {
            return res.status(401).json({ message: "Email not found" });
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = JWT.sign(
            { userId: user._id, role: user.roleId?.nameRole }, // Include role name
            process.env.TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ 
            success: true, 
            token: token, 
            user: { _id: user._id, email: user.email, role: user.roleId?.nameRole } 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
