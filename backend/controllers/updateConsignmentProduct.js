const { updateConsignment } = require("../models/updateConsignModel");

const updateConsignmentProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const {
            Product_name,
            Brand_id,
            Product_type_id,
            Original_price,
            Consignment_price,
            Quantity,
            Product_status,
            Consignment_status
        } = req.body;

        // Kiểm tra giá trị bắt buộc
        if (
            !Product_name || !Brand_id || !Product_type_id ||
            Original_price == null || Consignment_price == null ||
            Quantity == null || !Product_status || !Consignment_status
        ) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin sản phẩm ký gửi" });
        }

        // Ràng buộc giá trị enum
        const validProductStatuses = ["Consigned", "Received", "Sold"];
        const validConsignmentStatuses = ["Pending", "Approved", "Rejected"];

        if (!validProductStatuses.includes(Product_status)) {
            return res.status(400).json({ error: "Tình trạng sản phẩm không hợp lệ" });
        }

        if (!validConsignmentStatuses.includes(Consignment_status)) {
            return res.status(400).json({ error: "Tình trạng đơn không hợp lệ" });
        }

        const productData = {
            Product_name,
            Brand_id,
            Product_type_id,
            Original_price,
            Consignment_price,
            Quantity,
            Product_status,
            Consignment_status
        };

        const result = await updateConsignment(productId, productData);

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
