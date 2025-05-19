const jwt = require("jsonwebtoken");
const { 
    getUserByEmail, 
    createUser, 
    registerWithOTP, 
    getLatestOTPRecord,
    verifyOTPRecord
} = require("../models/userModel");
require("dotenv").config();

// Function to generate JWT token
function generateToken(user) {
    return jwt.sign(
        { id: user.ID, email: user.Email }, 
        process.env.SECRET_KEY, 
        { expiresIn: "1h" }
    );
}

// Regular registration (without OTP)
async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please fill in all information." });
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        await createUser(username, email, password);
        return res.status(201).json({ message: "Registration successful!" });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
}

// OTP registration - Step 1: Send OTP
async function registerWithOTPStep1(req, res) {
    try {
        const { username, email, password } = req.body;

        const result = await registerWithOTP(username, email, password);
        return res.status(200).json(result);

    } catch (error) {
        console.error("OTP sending error:", error);
        return res.status(400).json({ 
            message: error.message || "Error sending OTP" 
        });
    }
}

// OTP registration - Step 2: Verify OTP
async function registerWithOTPStep2(req, res) {
    try {
        const { username, email, password, otp } = req.body;

        // Verify OTP first
        const otpRecord = await getLatestOTPRecord(email);
        if (!otpRecord || otpRecord.OTP !== otp || new Date(otpRecord.Expires_At) < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP code" });
        }

        // Check if email already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists in the system" });
        }

        // Create new user
        const user = await createUser(username, email, password);
        
        // Mark email as verified
        await verifyOTPRecord(email);
        
        // Generate token
        const token = generateToken(user);

        return res.status(201).json({ 
            message: "Registration successful!",
            token,
            user: {
                id: user.ID,
                username: user.User_name,
                email: user.Email,
                account: user.Account
            }
        });

    } catch (error) {
        console.error("OTP verification error:", error);
        return res.status(400).json({ 
            message: error.message || "Error verifying OTP" 
        });
    }
}

// Login
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "Email does not exist" });
        }

        // Check password
        if (user.Password_User !== password) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Generate token
        const token = generateToken(user);

        return res.json({
            message: "Login successful",
            token,
            user
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ 
            message: "Server error",
            error: error.message 
        });
    }
}

module.exports = {
    register,
    registerWithOTPStep1,
    registerWithOTPStep2,
    login
};