const jwt = require("jsonwebtoken");
const { 
    getUserByEmail, 
    createUser, 
    registerWithOTP, 
    getLatestOTPRecord,
    verifyOTPRecord
} = require("../models/userModel");
require("dotenv").config();

// Hàm tạo token JWT
function generateToken(user) {
    return jwt.sign(
        { id: user.ID, email: user.Email }, 
        process.env.SECRET_KEY, 
        { expiresIn: "1h" }
    );
}

// Đăng ký thông thường (không OTP)
async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại!" });
        }

        await createUser(username, email, password);
        return res.status(201).json({ message: "Đăng ký thành công!" });

    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        return res.status(500).json({ 
            message: "Lỗi server", 
            error: error.message 
        });
    }
}

// Đăng ký với OTP - Bước 1: Gửi OTP
async function registerWithOTPStep1(req, res) {
    try {
        const { username, email, password } = req.body;

        const result = await registerWithOTP(username, email, password);
        return res.status(200).json(result);

    } catch (error) {
        console.error("Lỗi gửi OTP:", error);
        return res.status(400).json({ 
            message: error.message || "Lỗi khi gửi OTP" 
        });
    }
}

// Đăng ký với OTP - Bước 2: Xác thực OTP
async function registerWithOTPStep2(req, res) {
    try {
        const { username, email, password, otp } = req.body;

        // Xác thực OTP trước
        const otpRecord = await getLatestOTPRecord(email);
        if (!otpRecord || otpRecord.OTP !== otp || new Date(otpRecord.Expires_At) < new Date()) {
            return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
        }

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại trong hệ thống" });
        }

        // Tạo user mới
        const user = await createUser(username, email, password);
        
        // Đánh dấu email đã xác thực
        await verifyOTPRecord(email);
        
        // Tạo token
        const token = generateToken(user);

        return res.status(201).json({ 
            message: "Đăng ký thành công!",
            token,
            user: {
                id: user.ID,
                username: user.User_name,
                email: user.Email,
                account: user.Account
            }
        });

    } catch (error) {
        console.error("Lỗi xác thực OTP:", error);
        return res.status(400).json({ 
            message: error.message || "Lỗi khi xác thực OTP" 
        });
    }
}

// Đăng nhập
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Kiểm tra user tồn tại
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "Email không tồn tại" });
        }

        // Kiểm tra mật khẩu
        if (user.Password_User !== password) {
            return res.status(401).json({ message: "Sai mật khẩu" });
        }

        // Tạo token
        const token = generateToken(user);

        return res.json({
            message: "Đăng nhập thành công",
            token,
            user
        });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        return res.status(500).json({ 
            message: "Lỗi server",
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