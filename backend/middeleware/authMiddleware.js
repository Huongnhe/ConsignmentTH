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
    console.log("Token received from request:", req.header("Authorization"));
    console.log("All headers from request:", req.headers);
    console.log("Authorization header:", req.headers.authorization);

    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env["SECRET_KEY"]);
        console.log("SECRET_KEY:", process.env["SECRET_KEY"]);
        console.log("Token received from request:", req.header("Authorization"));
        req.user = decoded;

        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No authentication token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env["SECRET_KEY"]); 
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
};

module.exports = verifyToken, authenticateUser;
