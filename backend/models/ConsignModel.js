const db = require("../config/db");

const getUserProducts = async (userId) => {
    const query = `
        SELECT 
            th_consignment_ticket.ID as TicketID,
            Quantity,
            Product_name,
            Sale_price,
            Original_price,
            th_consignment_ticket.Status,
            Brand_name,
            Product_type_name  
        FROM th_consignment_ticket_product_detail 
        JOIN th_consignment_ticket ON th_consignment_ticket.ID = th_consignment_ticket_product_detail.Ticket_id
        JOIN th_product ON th_product.ID = th_consignment_ticket_product_detail.Product_id 
        JOIN th_brand b ON th_product.Brand_id = b.ID
        JOIN th_product_type t ON th_product.Product_type_id = t.ID
        WHERE th_consignment_ticket.User_id = ?
        ORDER BY TicketID DESC;
    `;

    const [rows] = await db.execute(query, [userId]);

    // Nhóm theo TicketID
    const result = [];
    const ticketMap = {};

    rows.forEach(row => {
        const ticketId = row.TicketID;

        if (!ticketMap[ticketId]) {
            ticketMap[ticketId] = {
                TicketID: row.TicketID,
                Status: row.Status,
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

module.exports = { getUserProducts };
