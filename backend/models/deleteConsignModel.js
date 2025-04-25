const db = require("../config/db");

const deleteProductFromConsignment = async (consignmentId, productId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Xóa chi tiết sản phẩm trong phiếu ký gửi
        const deleteConsignmentDetailQuery = `
            DELETE FROM TH_Consignment_Ticket_Product_Detail
            WHERE Ticket_id = ? AND Product_id = ?
        `;
        await connection.execute(deleteConsignmentDetailQuery, [consignmentId, productId]);

        // Nếu phiếu ký gửi không còn sản phẩm nào thì xóa luôn phiếu ký gửi
        const [remaining] = await connection.execute(
            `SELECT COUNT(*) as count FROM TH_Consignment_Ticket_Product_Detail WHERE Ticket_id = ?`,
            [consignmentId]
        );

        if (remaining[0].count === 0) {
            const deleteConsignmentQuery = `
                DELETE FROM TH_Consignment_Ticket
                WHERE ID = ?
            `;
            await connection.execute(deleteConsignmentQuery, [consignmentId]);
        }

        // Xóa chi tiết sản phẩm trong đơn hàng
        const deleteOrderDetailQuery = `
            DELETE FROM TH_Order_Detail
            WHERE Product_id = ?
        `;
        await connection.execute(deleteOrderDetailQuery, [productId]);

        // Xóa sản phẩm nếu không còn tồn tại trong phiếu hay đơn hàng
        const deleteProductQuery = `
            DELETE FROM TH_Product
            WHERE ID = ?
            AND NOT EXISTS (
                SELECT 1 FROM TH_Consignment_Ticket_Product_Detail WHERE Product_id = ?
            )
            AND NOT EXISTS (
                SELECT 1 FROM TH_Order_Detail WHERE Product_id = ?
            )
        `;
        await connection.execute(deleteProductQuery, [productId, productId, productId]);

        await connection.commit();
        return true;

    } catch (error) {
        await connection.rollback();
        console.error("Error deleting product:", error);
        return false;
    } finally {
        connection.release();
    }
};

module.exports = {
    deleteProductFromConsignment
};

