const jwt = require("jsonwebtoken");
const { createUser, getUserByEmail } = require("../models/userModel");
require("dotenv").config();

async function register(req, res) {
    console.log("Request received:", req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        console.log("Thiếu thông tin đăng ký!");
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    getUserByEmail(email, (err, result) => {
        if (err) {
            console.error("Lỗi getUserByEmail:", err);
            return res.status(500).json({ message: "Lỗi server", error: err.message });
        }

        console.log("Kết quả getUserByEmail:", result);

        if (result) {
            console.log("Email đã tồn tại!");
            return res.status(400).json({ message: "Email đã tồn tại!" });
        }

        createUser(username, email, password, (err) => {
            if (err) {
                console.error("Lỗi khi lưu vào database:", err);
                return res.status(500).json({ message: "Lỗi khi lưu vào database!" });
            }
            console.log("Đăng ký thành công!");
            res.status(201).json({ message: "Đăng ký thành công!" });
        });
    });
}

function login(req, res) {
    const { email, password } = req.body;
    getUserByEmail(email, (err, user) => {
        if (err) {
            console.error("Lỗi getUserByEmail:", err);
            return res.status(500).json({ message: "Lỗi server", error: err.message });
        }
        console.log("Kết quả getUserByEmail:", user);

        if (!user) {
            console.log("User không tồn tại!");
            return res.status(404).json({ message: "User không tồn tại" });
        }

        console.log("Mật khẩu trong DB:", user.Password_User);
        console.log("Mật khẩu người dùng nhập:", password);

        if (user.Password_User !== password) {
            console.log("Sai mật khẩu!");
            return res.status(401).json({ message: "Sai mật khẩu" });
        }
        const token = jwt.sign({ id: user.ID, email: user.Email }, process.env["SECRET_KEY"], { expiresIn: "1h" });
        console.log("Token được tạo:", token);
        console.log("SECRET_KEY:", process.env["SECRET_KEY"]);
        console.log("Full headers:", req.headers);
        console.log("Raw Authorization header:", req.headers["authorization"]);

        console.log("SECRET_KEY tại loginoooooooo:", process.env.SECRET_KEY);
        console.log("SECRET_KEY tại authMiddleware:", process.env.SECRET_KEY);


        console.log("Đăng nhập thành công!");
        return res.json({ message: "Đăng nhập thành công!", token, user });
        // return res.json({ token, user });
        // return res.json({ message: "Đăng nhập thành công", user });
    });
}

module.exports = { register, login };
