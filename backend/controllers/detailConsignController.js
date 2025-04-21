const { getConsignmentDetail } = require("../models/detailConsignModel");

const fetchConsignmentDetail = async (req, res) => {
    const consignmentId = req.params.id;
    console.log("ID được truyền vào:", consignmentId);

    if (!consignmentId) {
        return res.status(400).json({ error: "Thiếu ID đơn ký gửi" });
    }

    try {
        const consignment = await getConsignmentDetail(consignmentId);

        if (!consignment) {
            return res.status(404).json({ message: "Không tìm thấy đơn ký gửi" });
        }

        // Kiểm tra nếu có sản phẩm nào không
        if (!consignment.Products || consignment.Products.length === 0) {
            return res.status(404).json({ message: "Đơn hàng không có sản phẩm nào" });
        }

        res.json(consignment);  // Trả về toàn bộ đối tượng đơn hàng
    } catch (err) {
        console.error("Lỗi chi tiết:", {
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({
            error: "Lỗi server khi lấy chi tiết đơn ký gửi",
            detail: err.message
        });
    }
};

module.exports = { fetchConsignmentDetail };