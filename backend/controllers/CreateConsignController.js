const { createConsignment } = require("../models/CreateConsignModel");

const createConsignController = async (req, res) => {
    const userId = req.user?.id;
    const productList = req.body; // <-- Chấp nhận mảng sản phẩm

    if (!userId) {
        return res.status(401).json({ error: "Bạn phải đăng nhập để thực hiện thao tác này" });
    }

    // Kiểm tra đầu vào là mảng và có ít nhất một sản phẩm
    if (!Array.isArray(productList) || productList.length === 0) {
        return res.status(400).json({ error: "Danh sách sản phẩm không hợp lệ hoặc trống" });
    }

    // Kiểm tra từng sản phẩm trong danh sách có đủ thông tin
    const invalidItem = productList.find(p => !p.Brand_name || !p.Product_name || !p.Product_type_name);
    if (invalidItem) {
        return res.status(400).json({ error: "Một hoặc nhiều sản phẩm thiếu thông tin bắt buộc" });
    }

    try {
        const result = await createConsignment(productList, userId);
        res.status(201).json({
            message: result.message,
            ticketId: result.ticketId
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
