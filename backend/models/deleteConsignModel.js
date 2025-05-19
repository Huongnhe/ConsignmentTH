const db = require("../config/db");

const deleteProductFromConsignment = async (consignmentId, productId) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Remove product from consignment ticket detail table
        await connection.execute(
            `DELETE FROM TH_Consignment_Ticket_Product_Detail 
             WHERE Ticket_id = ? AND Product_id = ?`,
            [consignmentId, productId]
        );

        // 2. Remove product from order detail table if exists
        await connection.execute(
            `DELETE FROM TH_Order_Detail 
             WHERE Product_id = ?`,
            [productId]
        );

        // 3. Check how many products remain in this consignment ticket
        const [ticketProducts] = await connection.execute(
            `SELECT COUNT(*) AS count 
             FROM TH_Consignment_Ticket_Product_Detail 
             WHERE Ticket_id = ?`,
            [consignmentId]
        );

        let productDeleted = false;
        let ticketDeleted = false;

        // 4. Check if product exists in any other tickets
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

        // 5. If no products remain in ticket, delete the ticket
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

            return { success: true, message: "Consignment ticket has been deleted." };
        } else {
            await connection.commit();
            return { success: false, message: "Consignment ticket still contains products." };
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