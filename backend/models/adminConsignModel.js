const db = require("../config/db");

// Common function to group products by Ticket
const groupTickets = (rows) => {
    const result = [];
    const ticketMap = {};

    rows.forEach(row => {
        const ticketId = row.TicketID;

        if (!ticketMap[ticketId]) {
            ticketMap[ticketId] = {
                TicketID: row.TicketID,
                Status: row.Status,
                User_name: row.User_name,
                Email: row.Email,
                Create_date: row.Create_date,
                products: []
            };
            result.push(ticketMap[ticketId]);
        }

        ticketMap[ticketId].products.push({
            Product_name: row.Product_name,
            Quantity: row.Quantity,
            Sale_price: row.Sale_price,
            Original_price: row.Original_price,
            Brand_name: row.Brand_name,
            Product_type_name: row.Product_type_name
        });
    });

    return result;
};

// Get all consignment tickets with products
const getAllTicketsWithProducts = async () => {
    const query = `
        SELECT 
            t.ID as TicketID,
            u.User_name,
            u.Email,
            d.Quantity,
            p.Product_name,
            p.Sale_price,
            p.Original_price,
            t.Status,
            b.Brand_name,
            pt.Product_type_name,
            t.Create_date
        FROM th_consignment_ticket_product_detail d
        JOIN th_consignment_ticket t ON t.ID = d.Ticket_id
        JOIN th_product p ON p.ID = d.Product_id 
        JOIN th_brand b ON p.Brand_id = b.ID
        JOIN th_product_type pt ON p.Product_type_id = pt.ID
        JOIN th_user u ON t.User_id = u.ID
        ORDER BY t.ID ASC;
    `;
    const [rows] = await db.execute(query);
    return groupTickets(rows);
};

// Get pending consignment tickets
const getPendingTickets = async () => {
    const query = `
        SELECT 
            t.ID as TicketID,
            u.User_name,
            u.Email,
            d.Quantity,
            p.Product_name,
            p.Sale_price,
            p.Original_price,
            t.Status,
            b.Brand_name,
            pt.Product_type_name,
            t.Create_date
        FROM th_consignment_ticket_product_detail d
        JOIN th_consignment_ticket t ON t.ID = d.Ticket_id
        JOIN th_product p ON p.ID = d.Product_id 
        JOIN th_brand b ON p.Brand_id = b.ID
        JOIN th_product_type pt ON p.Product_type_id = pt.ID
        JOIN th_user u ON t.User_id = u.ID
        WHERE t.Status = 'Pending'
        ORDER BY t.ID ASC;
    `;
    const [rows] = await db.execute(query);
    return groupTickets(rows);
};

// Get reviewed tickets (Approved or Rejected)
const getReviewedTickets = async () => {
    const query = `
        SELECT 
            t.ID as TicketID,
            u.User_name,
            u.Email,
            d.Quantity,
            p.Product_name,
            p.Sale_price,
            p.Original_price,
            t.Status,
            b.Brand_name,
            pt.Product_type_name,
            t.Create_date
        FROM th_consignment_ticket_product_detail d
        JOIN th_consignment_ticket t ON t.ID = d.Ticket_id
        JOIN th_product p ON p.ID = d.Product_id 
        JOIN th_brand b ON p.Brand_id = b.ID
        JOIN th_product_type pt ON p.Product_type_id = pt.ID
        JOIN th_user u ON t.User_id = u.ID
        WHERE t.Status IN ('Approved', 'Rejected')
        ORDER BY t.ID ASC;
    `;
    const [rows] = await db.execute(query);
    return groupTickets(rows);
};

// Update consignment ticket status
const updateStatus = async (ticketID, newStatus) => {
    const query = `
        UPDATE th_consignment_ticket
        SET Status = ?
        WHERE ID = ?;
    `;
    try {
        const [result] = await db.execute(query, [newStatus, ticketID]);

        if (result.affectedRows > 0) {
            return { success: true, message: 'Consignment ticket status updated successfully.' };
        } else {
            return { success: false, message: 'No consignment ticket found with this ID.' };
        }
    } catch (error) {
        console.error('Error updating consignment ticket status:', error);
        throw error;
    }
};

module.exports = {
    getAllTicketsWithProducts,
    getPendingTickets,
    getReviewedTickets,
    updateStatus
};