const { deleteProductFromConsignment } = require("../models/deleteConsignModel");
const { getConsignmentDetail } = require("../models/detailConsignModel");

const deleteProductInConsignment = async (req, res) => {
    const { consignmentId, productId } = req.params;

    if (!consignmentId || !productId) {
        return res.status(400).json({ error: "Thiếu ID đơn ký gửi hoặc ID sản phẩm" });
    }

    try {
        // Kiểm tra đơn có tồn tại không
        const consignment = await getConsignmentDetail(consignmentId);
        if (!consignment) {
            return res.status(404).json({ message: "Không tìm thấy đơn ký gửi" });
        }

        // Thực hiện xóa sản phẩm
        const isDeleted = await deleteProductFromConsignment(consignmentId, productId);
        
        if (!isDeleted) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm trong đơn" });
        }

        res.json({ 
            success: true, 
            message: "Xóa sản phẩm thành công",
            remainingProducts: (await getConsignmentDetail(consignmentId)).Products.length
        });

    } catch (err) {
        console.error("Lỗi khi xóa sản phẩm:", {
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({
            error: "Lỗi server khi xóa sản phẩm",
            detail: err.message
        });
    }
};

module.exports = { 
    deleteProductInConsignment
};