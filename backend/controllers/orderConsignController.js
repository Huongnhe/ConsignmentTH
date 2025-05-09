const saleModel = require("../models/orderConsignModel");

const saleController = {
    searchProducts: async (req, res) => {
        try {
            const { keyword } = req.query;
            if (!keyword || keyword.trim() === '') {
                return res.status(400).json({ error: "Vui lòng nhập từ khóa tìm kiếm" });
            }

            const products = await saleModel.searchProducts(keyword.trim());
            res.json(products);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm sản phẩm:", error);
            res.status(500).json({ error: "Lỗi server khi tìm kiếm sản phẩm" });
        }
    },

    createOrder: async (req, res) => {
        const { products, customerInfo } = req.body; // Chỉ lấy các field cần thiết

        // Validate input
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Danh sách sản phẩm không hợp lệ" });
        }

        if (!customerInfo || (!customerInfo.name && !customerInfo.phone)) {
            return res.status(400).json({ error: "Thông tin khách hàng là bắt buộc" });
        }

        try {
            const orderData = {
                products: products.map(item => ({
                    productId: item.productId // Chỉ truyền productId
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
            console.error("Lỗi khi tạo đơn hàng:", error);
            res.status(500).json({
                error: "Lỗi server khi tạo đơn hàng",
                message: error.message
            });
        }
    },

    getInvoice: async (req, res) => {
        try {
            const orderId = parseInt(req.params.orderId);
            if (!orderId || isNaN(orderId)) {
                return res.status(400).json({ error: "ID đơn hàng không hợp lệ" });
            }

            const invoice = await saleModel.getInvoice(orderId);
            res.json(invoice);
        } catch (error) {
            console.error("Lỗi khi lấy hóa đơn:", error);
            res.status(500).json({
                error: "Lỗi server khi lấy thông tin hóa đơn",
                message: error.message
            });
        }
    }
};

module.exports = saleController;
