const db = require("../config/db");

const createConsignment = async (productData, userId) => {
    let connection;
    try {
        // Lấy connection từ pool
        connection = await db.getConnection();
        console.log("tt",connection);
        
        // Bắt đầu transaction
        await connection.beginTransaction();

        // 1. Tạo vé ký gửi
        const [ticketResult] = await connection.query(
            `INSERT INTO th_consignment_ticket 
             (User_id, Status, Create_date)
             VALUES (?, 'Pending', CURRENT_TIMESTAMP)`,
            [userId]
        );
        const ticketId = ticketResult.insertId;

        // 2. Thêm sản phẩm (sử dụng JOIN để lấy Brand_id và Product_type_id từ tên)
        const [productResult] = await connection.query(
            `INSERT INTO th_product 
             (Product_name, Sale_price, Original_price, Status, Brand_id, Product_type_id)
             SELECT ?, ?, ?, 'Consigned', b.ID, pt.ID
             FROM th_brand b, th_product_type pt
             WHERE b.Brand_name = ? AND pt.Product_type_name = ?`,
            [
                productData.Product_name,
                productData.Sale_price,
                productData.Original_price,
                productData.Brand_name,  // Nhận Brand_name thay vì Brand_id
                productData.Product_type_name // Nhận Product_type_name thay vì Product_type_id
            ]
        );
        const productId = productResult.insertId;

        // 3. Thêm vào bảng chi tiết (nếu có)
        if (productData.details) {
            await connection.query(
                `INSERT INTO th_consignment_ticket_product_detail
                 (Ticket_id, Product_id, Quantity, Price)
                 VALUES (?, ?, ?, ?)`,
                [ticketId, productId, productData.details.Quantity, productData.details.Price]
            );
        }

        // Commit transaction nếu thành công
        await connection.commit();

        return { 
            success: true,
            ticketId, 
            productId,
            message: "Tạo đơn ký gửi thành công"
        };

    } catch (error) {
        // Rollback nếu có lỗi
        if (connection) await connection.rollback();
        console.error("Lỗi khi tạo đơn ký gửi:", error);
        throw {
            success: false,
            message: error.message,
            errorCode: error.code
        };
    } finally {
        // Luôn release connection dù thành công hay thất bại
        if (connection) connection.release();
    }
};

module.exports = { createConsignment };