const { deleteProductFromConsignment } = require("../models/deleteConsignModel");
const { getConsignmentDetail } = require("../models/detailConsignModel");

const deleteProductInConsignment = async (req, res) => {
    const { consignmentId, productId } = req.params;

    if (!consignmentId || !productId) {
        return res.status(400).json({ error: "Thiếu ID đơn ký gửi hoặc ID sản phẩm" });
    }

    try {
        const consignment = await getConsignmentDetail(consignmentId);
        if (!consignment) {
            return res.status(404).json({ message: "Không tìm thấy đơn ký gửi" });
        }

        const productExistsInConsignment = consignment.Products?.some(
            product => product.Product_ID === parseInt(productId)
        );

        if (!productExistsInConsignment) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm trong đơn ký gửi này" });
        }

        const { success, ticketDeleted, productDeleted } = await deleteProductFromConsignment(consignmentId, productId);

        if (!success) {
            return res.status(500).json({ message: "Không thể xóa sản phẩm" });
        }

        // ⚠️ Lấy lại đơn ký gửi để xem còn sản phẩm hay không
        const updatedConsignment = await getConsignmentDetail(consignmentId);

        // ✅ Nếu đơn ký gửi đã bị xóa
        if (!updatedConsignment || !updatedConsignment.Products || updatedConsignment.Products.length === 0) {
            return res.json({
                success: true,
                message: "Đơn ký gửi đã bị xóa vì không còn sản phẩm.",
                ticketDeleted,
                productDeleted
            });
        }

        // ✅ Nếu chỉ còn 1 sản phẩm
        if (updatedConsignment.Products.length === 1 && !ticketDeleted) {
            return res.json({
                success: true,
                message: "Lưu ý: Việc xóa sản phẩm cuối cùng sẽ làm xóa luôn đơn ký gửi của bạn.",
                remainingProducts: 1,
                ticketDeleted,
                productDeleted
            });
        }


        return res.json({
            success: true,
            message: "Xóa sản phẩm thành công",
            remainingProducts: updatedConsignment.Products.length,
            ticketDeleted,
            productDeleted
        });

    } catch (err) {
        console.error("Lỗi khi xóa sản phẩm:", err);
        return res.status(500).json({
            error: "Lỗi server khi xóa sản phẩm",
            detail: err.message
        });
    }
};

module.exports = {
    deleteProductInConsignment
};
