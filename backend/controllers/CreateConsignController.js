const { createConsignment } = require("../models/CreateConsignModel");

const createConsignController = async (req, res) => {
    const userId = req.user?.id;
    const productList = req.body.productList;
    if (!userId) {
        return res.status(401).json({ error: "You must be logged in to perform this action" });
    }
    
    // Check if input is an array and has at least one product
    if (!Array.isArray(productList) || productList.length === 0) {
        return res.status(400).json({ error: "Invalid or empty product list" });
    }

    // Check if each product in the list has required information
    const invalidItem = productList.find(p => !p.Brand_name || !p.Product_name || !p.Product_type_name);
    if (invalidItem) {
        return res.status(400).json({ error: "One or more products are missing required information" });
    }

    try {
        const result = await createConsignment(productList, userId);
        res.status(201).json({
            message: result.message,
            ticketId: result.ticketId,
            productList: result.productList
        });
    } catch (error) {
        console.error("Error creating consignment:", error);
        res.status(500).json({
            error: "Server error while creating consignment",
            message: error.message || "No detailed information"
        });
    }
};

module.exports = { createConsignController };