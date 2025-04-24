const db = require("../config/db");

const deleteProductFromConsignment = async (consignmentId, productId) => {
    let connection;
    try {
        // Bắt đầu transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Xóa từ bảng chi tiết sản phẩm trong đơn
        const deleteDetailQuery = `
            DELETE FROM TH_Consignment_Ticket_Product_Detail
            WHERE Ticket_id = ? AND Product_id = ?
        `;
        await connection.execute(deleteDetailQuery, [consignmentId, productId]);

        // 2. Kiểm tra nếu đơn hàng không còn sản phẩm nào thì xóa luôn đơn hàng
        const checkTicketQuery = `
            SELECT COUNT(*) AS productCount 
            FROM TH_Consignment_Ticket_Product_Detail
            WHERE Ticket_id = ?
        `;
        const [ticketResults] = await connection.execute(checkTicketQuery, [consignmentId]);
        
        if (ticketResults[0].productCount === 0) {
            const deleteTicketQuery = `
                DELETE FROM TH_Consignment_Ticket
                WHERE ID = ?
            `;
            await connection.execute(deleteTicketQuery, [consignmentId]);
        }

        // 3. Xóa sản phẩm từ bảng sản phẩm chính
        const deleteProductQuery = `
            DELETE FROM TH_Product
            WHERE ID = ?
        `;
        await connection.execute(deleteProductQuery, [productId]);

        // Commit transaction nếu mọi thứ thành công
        await connection.commit();
        return true;
    } catch (error) {
        // Rollback nếu có lỗi xảy ra
        if (connection) await connection.rollback();
        console.error("Error deleting product from consignment:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    deleteProductFromConsignment
};