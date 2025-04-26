const { updateConsignment } = require("../models/updateConsignModel");

const updateConsignmentProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const consignmentId = req.params.consignmentId;

        const {
            Product_name,
            Brand_id,
            Product_type_id,
            Original_price,
            Consignment_price,
            Quantity
        } = req.body;

        // Kiểm tra các trường bắt buộc
        if (
            !Product_name || !Brand_id || !Product_type_id ||
            Original_price == null || Consignment_price == null ||
            Quantity == null
        ) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin sản phẩm ký gửi" });
        }

        const productData = {
            Product_name,
            Brand_id,
            Product_type_id,
            Original_price,
            Consignment_price,
            Quantity
        };

        const result = await updateConsignment(productId, consignmentId, productData);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy sản phẩm ký gửi cần cập nhật" });
        }

        res.status(200).json({ message: "Cập nhật sản phẩm ký gửi thành công" });
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm ký gửi:", error);
        res.status(500).json({ error: "Lỗi server khi cập nhật sản phẩm ký gửi" });
    }
};

module.exports = { updateConsignmentProduct };
