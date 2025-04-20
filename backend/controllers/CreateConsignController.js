const { createConsignment } = require("../models/CreateConsignModel");

const createConsignController = async (req, res) => {
    const userId = req.user?.id;
    const productData = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!productData.Brand_name || !productData.Product_name) {
        return res.status(400).json({ error: "Dữ liệu sản phẩm không đầy đủ" });
    }

    if (!userId) {
        return res.status(401).json({ error: "Bạn phải đăng nhập để thực hiện thao tác này" });
    }

    try {
        const result = await createConsignment(productData, userId);
        res.status(201).json({
            message: "Tạo đơn ký gửi thành công!",
            ticketId: result.ticketId,
            productId: result.productId,
            // Nếu cần có thể thêm thông tin khác như tên sản phẩm, trạng thái...
        });
    } catch (error) {
        console.error("Lỗi khi tạo đơn ký gửi:", error);
        res.status(500).json({
            error: "Lỗi server khi tạo đơn ký gửi",
            message: error.message || "Không có thông tin chi tiết"
        });
    }
};

module.exports = { createConsignController };
