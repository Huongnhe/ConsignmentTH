const { getUserProducts } = require("../models/ConsignModel");

const fetchUserProducts = async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log("UserID:", userId);

        if (!userId) {
            return res.status(401).json({ error: "User not logged in" });
        }

        const products = await getUserProducts(userId);
        console.log("Product data retrieved from DB:", products);
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: "Server error while fetching products" });
    }
};

module.exports = { fetchUserProducts };