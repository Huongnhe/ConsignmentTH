const { getUserProducts } = require("../models/consignModel.js");
const authenticateUser = require("../middeleware/authMiddleware.js");

const fetchUserProducts = (req, res) => {
    const userId = req.user?.id; 
    console.log("UserID",userId)
    if (!userId) {
        return res.status(401).json({ error: "Người dùng chưa đăng nhập" });
    }
    getUserProducts(userId, (err, products) => {
        if (err) {
            return res.status(500).json({ error: "Lỗi server khi lấy sản phẩm" });
        }
        res.json(products);
    });
};

module.exports = { fetchUserProducts };
