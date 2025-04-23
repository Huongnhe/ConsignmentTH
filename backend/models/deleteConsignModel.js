const db = require("../config/db");

const deleteProductFromConsignment = async (consignmentId, productId) => {
    const query = `
        DELETE FROM TH_Consignment_Ticket_Product_Detail
        WHERE Ticket_id = ? AND Product_id = ?
    `;
    
    const [result] = await db.execute(query, [consignmentId, productId]);
    
    return result.affectedRows > 0;
};

module.exports = {
    deleteProductFromConsignment
};