const db = require("../config/db");

// Lấy tất cả phiếu ký gửi với thông tin sản phẩm
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
            pt.Product_type_name  
        FROM th_consignment_ticket_product_detail d
        JOIN th_consignment_ticket t ON t.ID = d.Ticket_id
        JOIN th_product p ON p.ID = d.Product_id 
        JOIN th_brand b ON p.Brand_id = b.ID
        JOIN th_product_type pt ON p.Product_type_id = pt.ID
        JOIN th_user u ON t.User_id = u.ID;
    `;

    // Thực hiện truy vấn và lấy kết quả
    const [rows] = await db.execute(query);

    // Nhóm theo TicketID
    const result = [];
    const ticketMap = {};

    rows.forEach(row => {
        const ticketId = row.TicketID;

        // Nếu chưa có ticketID này trong ticketMap, thêm nó vào
        if (!ticketMap[ticketId]) {
            ticketMap[ticketId] = {
                TicketID: row.TicketID,
                Status: row.Status,
                User_name: row.User_name,
                Email: row.Email,
                products: [] // Khởi tạo mảng sản phẩm cho mỗi ticket
            };
            result.push(ticketMap[ticketId]);
        }

        // Thêm sản phẩm vào ticket tương ứng
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

module.exports = { getAllTicketsWithProducts };
