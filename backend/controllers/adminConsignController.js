const { getAllTicketsWithProducts } = require("../models/adminConsignModel");

// Lấy tất cả phiếu ký gửi với sản phẩm (dành cho admin)
async function fetchAllConsignmentTickets(req, res) {
    try {
        const tickets = await getAllTicketsWithProducts(); // Gọi hàm từ model để lấy phiếu ký gửi với sản phẩm

        if (tickets.length === 0) {
            return res.status(404).json({ message: "Không có phiếu ký gửi nào." });
        }

        return res.status(200).json({ message: "Lấy tất cả phiếu ký gửi thành công!", data: tickets });
    } catch (error) {
        console.error("Lỗi lấy phiếu ký gửi:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
}

module.exports = { fetchAllConsignmentTickets };
