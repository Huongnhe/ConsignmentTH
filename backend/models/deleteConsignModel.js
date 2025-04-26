const db = require("../config/db");

const deleteProductFromConsignment = async (consignmentId, productId) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Xóa sản phẩm khỏi bảng chi tiết của đơn ký gửi
        await connection.execute(
            `DELETE FROM TH_Consignment_Ticket_Product_Detail 
             WHERE Ticket_id = ? AND Product_id = ?`,
            [consignmentId, productId]
        );

        // 2. Xóa sản phẩm khỏi bảng chi tiết đơn hàng nếu có
        await connection.execute(
            `DELETE FROM TH_Order_Detail 
             WHERE Product_id = ?`,
            [productId]
        );

        // 3. Kiểm tra xem còn bao nhiêu sản phẩm trong đơn ký gửi này
        const [ticketProducts] = await connection.execute(
            `SELECT COUNT(*) AS count 
             FROM TH_Consignment_Ticket_Product_Detail 
             WHERE Ticket_id = ?`,
            [consignmentId]
        );

        let productDeleted = false;
        let ticketDeleted = false;

        // 4. Kiểm tra sản phẩm có còn tồn tại trong bất kỳ ticket nào khác
        const [productInTickets] = await connection.execute(
            `SELECT COUNT(*) AS count 
             FROM TH_Consignment_Ticket_Product_Detail 
             WHERE Product_id = ?`,
            [productId]
        );

        if (productInTickets[0].count === 0) {
            await connection.execute(
                `DELETE FROM TH_Product WHERE ID = ?`,
                [productId]
            );
            productDeleted = true;
        }

        // 5. Nếu không còn sản phẩm nào trong ticket, xóa ticket
        if (ticketProducts[0].count === 0) {
            await connection.execute(
                `DELETE FROM TH_Consignment_Ticket WHERE ID = ?`,
                [consignmentId]
            );
            ticketDeleted = true;
        }

        await connection.commit();

        return {
            success: true,
            ticketDeleted,
            productDeleted
        };
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error deleting product from consignment:", error.message);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

const deleteConsignment = async (consignmentId) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        await connection.execute(
            `DELETE FROM TH_Consignment_Ticket_Product_Detail 
             WHERE Ticket_id = ?`,
            [consignmentId]
        );

        const [ticketProducts] = await connection.execute(
            `SELECT COUNT(*) AS count 
             FROM TH_Consignment_Ticket_Product_Detail 
             WHERE Ticket_id = ?`,
            [consignmentId]
        );

        if (ticketProducts[0].count === 0) {

            await connection.execute(
                `DELETE FROM TH_Consignment_Ticket 
                 WHERE ID = ?`,
                [consignmentId]
            );

            await connection.commit();

            return { success: true, message: "Đơn ký gửi đã được xóa." };
        } else {
            await connection.commit();
            return { success: false, message: "Đơn ký gửi vẫn còn sản phẩm." };
        }
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error deleting consignment:", error.message);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    deleteProductFromConsignment,
    deleteConsignment
};
