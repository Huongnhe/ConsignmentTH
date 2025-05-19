const saleModel = require("../models/orderConsignModel");

const saleController = {
    searchProducts: async (req, res) => {
        try {
            const { keyword } = req.query;
            if (!keyword || keyword.trim() === '') {
                return res.status(400).json({ error: "Please enter a search keyword" });
            }

            const products = await saleModel.searchProducts(keyword.trim());
            res.json(products);
        } catch (error) {
            console.error("Error searching products:", error);
            res.status(500).json({ error: "Server error while searching products" });
        }
    },

    createOrder: async (req, res) => {
        const { products, customerInfo } = req.body; // Only take necessary fields

        // Validate input
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid product list" });
        }

        if (!customerInfo || (!customerInfo.name && !customerInfo.phone)) {
            return res.status(400).json({ error: "Customer information is required" });
        }

        try {
            const orderData = {
                products: products.map(item => ({
                    productId: item.productId // Only pass productId
                })),
                customerInfo
            };

            const orderId = await saleModel.createOrder(orderData);
            const invoice = await saleModel.getInvoice(orderId);

            res.status(201).json({
                success: true,
                orderId,
                invoice
            });
        } catch (error) {
            console.error("Error creating order:", error);
            res.status(500).json({
                error: "Server error while creating order",
                message: error.message
            });
        }
    },

    getInvoice: async (req, res) => {
        try {
            const orderId = parseInt(req.params.orderId);
            if (!orderId || isNaN(orderId)) {
                return res.status(400).json({ error: "Invalid order ID" });
            }

            const invoice = await saleModel.getInvoice(orderId);
            res.json(invoice);
        } catch (error) {
            console.error("Error fetching invoice:", error);
            res.status(500).json({
                error: "Server error while retrieving invoice",
                message: error.message
            });
        }
    }
};

module.exports = saleController;