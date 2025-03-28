const jwt = require("jsonwebtoken");

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

module.exports = verifyToken;
