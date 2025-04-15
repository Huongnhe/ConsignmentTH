const { createConsignment } = require("../models/createConsignModel");

const createConsignController = async (req, res) => {
    const userId = req.user.id; // Lấy User_id từ token
    const productData = req.body;

    try {
        const result = await createConsignment(productData, userId);
        res.status(201).json({
            message: "Tạo đơn ký gửi thành công!",
            ticketId: result.ticketId,
            productId: result.productId,
        });
    } catch (error) {
        console.error("Lỗi khi tạo đơn ký gửi:", error);
        res.status(500).json({ error: "Lỗi server khi tạo đơn ký gửi" });
    }
};

module.exports = { createConsignController };