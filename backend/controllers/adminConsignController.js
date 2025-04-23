const { getAllTicketsWithProducts, updateStatus } = require("../models/adminConsignModel");

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

// Duyệt phiếu ký gửi và cập nhật trạng thái từ pending thành approved
async function approveConsignmentTicket(req, res) {
    const { ticketID } = req.params; // ID phiếu ký gửi được truyền trong URL

    try {
        // Cập nhật trạng thái phiếu ký gửi
        const updateResult = await updateStatus(ticketID, 'approved');
        
        if (updateResult.success) {
            return res.status(200).json({ message: updateResult.message });
        } else {
            return res.status(404).json({ error: updateResult.message });
        }
    } catch (error) {
        console.error('Lỗi khi duyệt phiếu ký gửi:', error);
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function rejectConsignmentTicket(req, res) {
    const { ticketID } = req.params;

    try {
        const updateResult = await updateStatus(ticketID, 'rejected'); // ✅ Sửa ở đây
        
        if (updateResult.success) {
            return res.status(200).json({ success: true, message: updateResult.message }); // ✅ thêm success: true để frontend bắt được
        } else {
            return res.status(404).json({ success: false, message: updateResult.message });
        }
    } catch (error) {
        console.error('Lỗi khi từ chối phiếu ký gửi:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
}

module.exports = { fetchAllConsignmentTickets, approveConsignmentTicket ,rejectConsignmentTicket };
