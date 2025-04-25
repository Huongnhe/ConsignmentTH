const { deleteProductFromConsignment } = require("../models/deleteConsignModel");
const { getConsignmentDetail } = require("../models/detailConsignModel");

const deleteProductInConsignment = async (req, res) => {
    const { consignmentId, productId } = req.params;

    if (!consignmentId || !productId) {
        return res.status(400).json({ error: "Thiếu ID đơn ký gửi hoặc ID sản phẩm" });
    }

    try {
        // Kiểm tra xem đơn ký gửi có tồn tại không
        const consignment = await getConsignmentDetail(consignmentId);
        if (!consignment) {
            return res.status(404).json({ message: "Không tìm thấy đơn ký gửi" });
        }

        // Kiểm tra xem sản phẩm có tồn tại trong đơn ký gửi không
        const productExistsInConsignment = consignment.Products.some(product => product.Product_ID === parseInt(productId));
        if (!productExistsInConsignment) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm trong đơn ký gửi này" });
        }

        // Thực hiện xóa sản phẩm khỏi đơn ký gửi
        const { success, ticketDeleted, productDeleted, errorMessage } = await deleteProductFromConsignment(consignmentId, productId);

        if (!success) {
            return res.status(500).json({ message: `Không thể xóa sản phẩm: ${errorMessage || "lỗi xảy ra trong quá trình xóa"}` });
        }

        // Trả về thông báo thành công cùng với số lượng sản phẩm còn lại trong đơn
        const updatedConsignment = await getConsignmentDetail(consignmentId);

        if (updatedConsignment.Products.length === 1) {
            // Khi chỉ còn 1 sản phẩm, cảnh báo rằng việc xóa sẽ xóa luôn đơn ký gửi
            return res.json({
                success: true,
                message: "Lưu ý: Việc xóa sản phẩm cuối cùng sẽ làm xóa luôn đơn ký gửi của bạn.",
                remainingProducts: updatedConsignment.Products.length,
                ticketDeleted,
                productDeleted
            });
        }

        if (updatedConsignment.Products.length < 0 && ticketDeleted) {
            return res.json({
                success: true,
                message: "Đơn ký gửi đã bị xóa vì không còn sản phẩm.",
                ticketDeleted, 
                productDeleted,
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