const { updateConsignment } = require("../models/updateConsignModel");

const updateConsignmentProduct = async (req, res) => {
    try {
        console.log("Request body received:", req.body);
        
        const productId = parseInt(req.params.productId);
        const consignmentId = parseInt(req.params.consignmentId);

        if (isNaN(productId) || isNaN(consignmentId)) {
            return res.status(400).json({ error: "ID không hợp lệ" });
        }

        // Đảm bảo lấy đúng tên trường từ request body
        const {
            Product_name,
            Brand_name,
            Product_Type_Name,
            Original_price,
            Consignment_price,
            Sale_price,
            Quantity
        } = req.body;

        // Validate dữ liệu
        if (!Product_name || !Brand_name || !Product_Type_Name) {
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
        }

        const updatedData = {
            Product_name,
            Brand_name,
            Product_Type_Name,
            Original_price,
            Consignment_price,
            Sale_price,
            Quantity
        };

        const result = await updateConsignment(productId, consignmentId, updatedData);
        return res.status(200).json(result);

    } catch (error) {
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            receivedData: req.body
        });
        return res.status(500).json({ 
            error: error.message || "Lỗi server",
            receivedData: req.body // Gửi lại dữ liệu nhận được để debug
        });
    }
};

module.exports = { updateConsignmentProduct };
