const db = require("../config/db");

const getUserProducts = async (userId) => {
    const query = `
        SELECT 
            th_consignment_ticket.ID,
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
        WHERE th_consignment_ticket.User_id = ?;
    `;

    const [rows] = await db.execute(query, [userId]);
    console.log(rows);
    return rows;
};

module.exports = { getUserProducts };
