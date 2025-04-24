const {
    getAllTicketsWithProducts,
    getPendingTickets,
    getReviewedTickets,
    updateStatus
} = require("../models/adminConsignModel");

// ✅ Lấy phiếu ký gửi trạng thái Pending (chưa duyệt)
async function fetchPendingConsignmentTickets(req, res) {
    try {
        const tickets = await getPendingTickets();

        if (tickets.length < 0) {
            return res.status(404).json({ message: "Không có phiếu ký gửi đang chờ duyệt." });
        }

        return res.status(200).json({ message: "Lấy phiếu ký gửi Pending thành công!", data: tickets });
    } catch (error) {
        console.error("Lỗi lấy phiếu Pending:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
}

// ✅ Lấy phiếu ký gửi đã được duyệt (Approved, Rejected)
async function fetchReviewedConsignmentTickets(req, res) {
    try {
        const tickets = await getReviewedTickets();

        if (tickets.length === 0) {
            return res.status(404).json({ message: "Không có phiếu ký gửi đã được duyệt." });
        }

        return res.status(200).json({ message: "Lấy phiếu ký gửi đã duyệt thành công!", data: tickets });
    } catch (error) {
        console.error("Lỗi lấy phiếu đã duyệt:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
}

// ⚙️ Hàm cũ vẫn giữ lại nếu bạn cần lấy tất cả
async function fetchAllConsignmentTickets(req, res) {
    try {
        const tickets = await getAllTicketsWithProducts();

        if (tickets.length === 0) {
            return res.status(404).json({ message: "Không có phiếu ký gửi nào." });
        }

        return res.status(200).json({ message: "Lấy tất cả phiếu ký gửi thành công!", data: tickets });
    } catch (error) {
        console.error("Lỗi lấy phiếu ký gửi:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
}

// ✅ Duyệt phiếu (Pending → Approved)
async function approveConsignmentTicket(req, res) {
    const { ticketID } = req.params;

    try {
        const updateResult = await updateStatus(ticketID, 'Approved');
        
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy phiếu ký gửi hoặc phiếu không ở trạng thái Pending" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Duyệt phiếu thành công",
            data: updateResult 
        });
    } catch (error) {
        console.error('Lỗi khi duyệt phiếu ký gửi:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi hệ thống",
            error: error.message 
        });
    }
}

// ✅ Từ chối phiếu (Pending → Rejected)
async function rejectConsignmentTicket(req, res) {
    const { ticketID } = req.params;

    try {
        const updateResult = await updateStatus(ticketID, 'Rejected');
        
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy phiếu ký gửi hoặc phiếu không ở trạng thái Pending" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Từ chối phiếu thành công",
            data: updateResult 
        });
    } catch (error) {
        console.error('Lỗi khi từ chối phiếu ký gửi:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi hệ thống",
            error: error.message 
        });
    }
}

module.exports = {
    fetchAllConsignmentTickets,
    fetchPendingConsignmentTickets,
    fetchReviewedConsignmentTickets,
    approveConsignmentTicket,
    rejectConsignmentTicket
};
