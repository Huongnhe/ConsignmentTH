const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    console.log("Token nhận được từ request:", req.header("Authorization"));
    console.log("Tất cả headers từ request:", req.headers);
    console.log("Authorization header:", req.headers.authorization);

    if (!token) return res.status(401).json({ error: "Không có token" });

    try {
        const decoded = jwt.verify(token, process.env["SECRET_KEY"]);
        console.log("SECRET_KEY:", process.env["SECRET_KEY"]);
        console.log("Token nhận được từ request:", req.header("Authorization"));
        req.user = decoded;

        next();
    } catch (error) {
        res.status(401).json({ error: "Token không hợp lệ" });
    }
};



const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Không có token xác thực" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "SECRET_KEY"); // Thay SECRET_KEY bằng key của bạn
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(403).json({ error: "Token không hợp lệ" });
    }


};


module.exports = verifyToken, authenticateUser;