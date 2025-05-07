const saleModel = require("../models/orderConsignModel");

const saleController = {
    // Tìm kiếm sản phẩm
    searchProducts: async (req, res) => {
        try {
            const { keyword } = req.query;
            if (!keyword || keyword.trim() === '') {
                return res.status(400).json({ error: "Vui lòng nhập từ khóa tìm kiếm" });
            }
            
            const products = await saleModel.searchProducts(keyword);
            res.json(products);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm sản phẩm:", error);
            res.status(500).json({ error: "Lỗi server khi tìm kiếm sản phẩm" });
        }
    },

    // Tạo đơn hàng mới
    createOrder: async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Bạn phải đăng nhập để thực hiện thao tác này" });
        }

        const { products, customerInfo, customerId } = req.body;
        
        // Validate input
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Danh sách sản phẩm không hợp lệ" });
        }

        try {
            // Tính tổng tiền và tổng số lượng
            const totalValue = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);

            const orderData = {
                products: products.map(item => ({
                    productId: item.productId,
                    price: item.price,
                    quantity: item.quantity
                })),
                customerInfo,
                customerId,
                totalValue,
                totalQuantity
            };

            const orderId = await saleModel.createOrder(orderData, userId);
            
            // Lấy thông tin hóa đơn để trả về
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

    // Xem hóa đơn
    getInvoice: async (req, res) => {
        try {
            const { orderId } = req.params;
            if (!orderId) {
                return res.status(400).json({ error: "Thiếu ID đơn hàng" });
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