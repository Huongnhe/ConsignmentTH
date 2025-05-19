const {
    getAllTicketsWithProducts,
    getPendingTickets,
    getReviewedTickets,
    updateStatus
} = require("../models/adminConsignModel");

// Get Pending consignment tickets (not yet reviewed)
async function fetchPendingConsignmentTickets(req, res) {
    try {
        const tickets = await getPendingTickets();

        if (tickets.length === 0) {
            return res.status(404).json({ message: "No pending consignment tickets found." });
        }

        return res.status(200).json({ message: "Successfully retrieved pending consignment tickets!", data: tickets });
    } catch (error) {
        console.error("Error fetching pending tickets:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Get reviewed consignment tickets (Approved, Rejected)
async function fetchReviewedConsignmentTickets(req, res) {
    try {
        const tickets = await getReviewedTickets();

        if (tickets.length === 0) {
            return res.status(404).json({ message: "No reviewed consignment tickets found." });
        }

        return res.status(200).json({ message: "Successfully retrieved reviewed consignment tickets!", data: tickets });
    } catch (error) {
        console.error("Error fetching reviewed tickets:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Original function kept in case you need to get all tickets
async function fetchAllConsignmentTickets(req, res) {
    try {
        const tickets = await getAllTicketsWithProducts();

        if (tickets.length === 0) {
            return res.status(404).json({ message: "No consignment tickets found." });
        }

        return res.status(200).json({ message: "Successfully retrieved all consignment tickets!", data: tickets });
    } catch (error) {
        console.error("Error fetching consignment tickets:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Approve ticket (Pending → Approved)
async function approveConsignmentTicket(req, res) {
    const { ticketID } = req.params;

    try {
        const updateResult = await updateStatus(ticketID, 'Approved');
        
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Consignment ticket not found or ticket is not in Pending status" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Ticket approved successfully",
            data: updateResult 
        });
    } catch (error) {
        console.error('Error approving consignment ticket:', error);
        return res.status(500).json({ 
            success: false, 
            message: "System error",
            error: error.message 
        });
    }
}

// ✅ Reject ticket (Pending → Rejected)
async function rejectConsignmentTicket(req, res) {
    const { ticketID } = req.params;

    try {
        const updateResult = await updateStatus(ticketID, 'Rejected');
        
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Consignment ticket not found or ticket is not in Pending status" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Ticket rejected successfully",
            data: updateResult 
        });
    } catch (error) {
        console.error('Error rejecting consignment ticket:', error);
        return res.status(500).json({ 
            success: false, 
            message: "System error",
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