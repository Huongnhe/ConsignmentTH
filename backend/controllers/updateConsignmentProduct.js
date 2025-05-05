const { updateConsignment } = require("../models/updateConsignModel");

const updateConsignmentProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const consignmentId = req.params.consignmentId;

        const {
            Product_name,
            Brand_name,
            Product_type_name,
            Original_price,
            Consignment_price,
            Sale_price,
            Quantity
        } = req.body;

        // Kiểm tra các trường bắt buộc
        if (
            !Product_name || !Brand_name || !Product_type_name ||
            Original_price == null || Consignment_price == null || Sale_price == null ||
            Quantity == null
        ) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin sản phẩm ký gửi" });
        }

        const updatedData = {
            Product_name,
            Brand_name,
            Product_type_name,
            Original_price,
            Consignment_price,
            Sale_price,
            Quantity
        };

        const result = await updateConsignment(productId, consignmentId, updatedData);

        if (result.success) {
            return res.status(200).json({ message: "Cập nhật sản phẩm ký gửi thành công" });
        } else {
            return res.status(500).json({ error: "Cập nhật thất bại, không rõ nguyên nhân" });
        }

    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm ký gửi:", error.message || error);
        res.status(500).json({ error: error.message || "Lỗi server khi cập nhật sản phẩm ký gửi" });
    }
};

module.exports = { updateConsignmentProduct };
