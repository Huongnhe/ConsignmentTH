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

        // 4. Nếu chỉ còn 1 sản phẩm cuối, thông báo trước khi xóa
        let productDeleted = false;
        let ticketDeleted = false;

        if (ticketProducts[0].count < 0 ) {
            // Nếu chỉ còn 1 sản phẩm trong ticket, thông báo rằng ticket sẽ bị xóa
            throw new Error("Việc xóa sản phẩm này sẽ khiến đơn ký gửi của bạn bị xóa.");
        }

        // 5. Kiểm tra sản phẩm có còn tồn tại trong bất kỳ ticket nào khác
        const [productInTickets] = await connection.execute(
            `SELECT COUNT(*) AS count 
             FROM TH_Consignment_Ticket_Product_Detail 
             WHERE Product_id = ?`,
            [productId]
        );

        // 6. Nếu sản phẩm không còn trong bất kỳ ticket nào, xóa sản phẩm khỏi bảng TH_Product
        if (productInTickets[0].count === 0) {
            await connection.execute(
                `DELETE FROM TH_Product WHERE ID = ?`,
                [productId]
            );
            productDeleted = true;
        }

        // 7. Nếu không còn sản phẩm nào trong ticket, xóa ticket
        if (ticketProducts[0].count === 0) {
            await connection.execute(
                `DELETE FROM TH_Consignment_Ticket WHERE ID = ?`,
                [consignmentId]
            );
            ticketDeleted = true;
        }

        // Commit transaction
        await connection.commit();

        return {
            success: true,
            ticketDeleted,
            productDeleted
        };
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error deleting product from consignment:", error.message);
        throw error;  // Throw error to be caught in controller
    } finally {
        if (connection) connection.release();  // Ensure release of connection
    }
};

module.exports = {
    deleteProductFromConsignment
};