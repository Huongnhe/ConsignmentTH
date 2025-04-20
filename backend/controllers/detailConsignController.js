const { getConsignmentDetail } = require("../models/detailConsignModel");

const fetchConsignmentDetail = async (req, res) => {
    const consignmentId = req.params.id; 
    console.log("ID được truyền vào:", consignmentId);

    if (!consignmentId) {
        return res.status(400).json({ error: "Thiếu ID đơn ký gửi" });
    }

    try {
        const consignment = await getConsignmentDetail(consignmentId);
        if (!consignment || consignment.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn ký gửi" });
        }
        res.json(consignment[0]);  // Trả về đối tượng đầu tiên trong mảng
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi server khi lấy chi tiết đơn ký gửi" });
    }
};

module.exports = { fetchConsignmentDetail };
