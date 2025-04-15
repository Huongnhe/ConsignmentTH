const { updateProduct } = require("../models/updateConsignModel");

const updateConsignmentProduct = (req, res) => {
    const productId = req.params.id; // Lấy ID sản phẩm từ URL
    const { Product_name, Sale_price, Original_price, Status, Brand_id, Product_type_id } = req.body; // Lấy dữ liệu từ body

    // Kiểm tra dữ liệu đầu vào
    if (!Product_name || !Sale_price || !Original_price || !Status || !Brand_id || !Product_type_id) {
        return res.status(400).json({ error: "Vui lòng cung cấp đầy đủ thông tin sản phẩm" });
    }

    const productData = { Product_name, Sale_price, Original_price, Status, Brand_id, Product_type_id };

    updateProduct(productId, productData, (err, results) => {
        if (err) {
            console.error("Lỗi khi cập nhật sản phẩm ký gửi:", err);
            return res.status(500).json({ error: "Lỗi server khi cập nhật sản phẩm ký gửi" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy sản phẩm ký gửi để cập nhật" });
        }

        res.status(200).json({ message: "Cập nhật sản phẩm ký gửi thành công" });
    });
};

module.exports = { updateConsignmentProduct };