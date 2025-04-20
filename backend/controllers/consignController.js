const { getUserProducts } = require("../models/consignModel");

const fetchUserProducts = async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log("UserID:", userId);

        if (!userId) {
            return res.status(401).json({ error: "Người dùng chưa đăng nhập" });
        }

        const products = await getUserProducts(userId);
        console.log("Dữ liệu sản phẩm lấy từ DB:", products);
        res.json(products);
    } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
        res.status(500).json({ error: "Lỗi server khi lấy sản phẩm" });
    }
};

module.exports = { fetchUserProducts };
