
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug: Log request trước khi xử lý
app.use("/auth", (req, res, next) => {
    console.log(`Request nhận được: ${req.method} ${req.url}`);
    console.log("Raw Authorization header:", req.headers["authorization"]);
    console.log("SECRET_KEY:", process.env["SECRET_KEY"]);
    console.log("Full headers:", req.headers);
    next();
});

// Thêm lại router
app.use("/auth", authRoutes);

app.listen(8000, () => console.log("Server chạy trên cổng 8000"));
