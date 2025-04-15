const { getConsignmentDetail } = require("../models/detailConsignModel");

const fetchConsignmentDetail = (req, res) => {
    const consignmentId = req.params.id;
    console.log("ID được truyền vào:", consignmentId);

    if (!consignmentId) {
        return res.status(400).json({ error: "Thiếu ID đơn ký gửi" });
    }

    getConsignmentDetail(consignmentId, (err, consignment) => {
        if (err) {
            return res.status(500).json({ error: "Lỗi server khi lấy chi tiết đơn ký gửi" });
        }
        if (!consignment) {
            return res.status(404).json({ message: "Không tìm thấy đơn ký gửi" });
        }
        res.json(consignment);
    });
};

module.exports = { fetchConsignmentDetail };