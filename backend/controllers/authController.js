const jwt = require("jsonwebtoken");
const { createUser, getUserByEmail } = require("../models/userModel");
require("dotenv").config();

// Đăng ký user
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
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
}

// Đăng nhập
async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User không tồn tại" });
        }

        if (user.Password_User !== password) {
            return res.status(401).json({ message: "Sai mật khẩu" });
        }

        const token = jwt.sign({ id: user.ID, email: user.Email }, process.env.SECRET_KEY, { expiresIn: "1h" });

        return res.json({ message: "Đăng nhập thành công!", token, user });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
}

module.exports = { register, login };
