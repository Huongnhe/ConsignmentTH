const db = require("../config/db");

const updateConsignment = async (productId, consignmentId, productData) => {
    const {
        Product_name,
        Brand_id,
        Product_type_id,
        Original_price,
        Consignment_price,
        Quantity,
    } = productData;

    // Kiểm tra thông tin đầu vào
    if (
        !Product_name || !Brand_id || !Product_type_id ||
        Original_price == null || Consignment_price == null ||
        Quantity == null
    ) {
        throw new Error("Thiếu thông tin cần thiết để cập nhật");
    }

    const query = `
        UPDATE TH_Product p
        JOIN TH_Consignment_Ticket_Product_Detail d ON d.Product_id = p.ID
        JOIN TH_Consignment_Ticket c ON d.Ticket_id = c.ID
        SET 
            p.Product_name = ?,
            p.Brand_id = ?,
            p.Product_type_id = ?,
            p.Original_price = ?,
            d.Price = ?,
            d.Quantity = ?
        WHERE 
            p.ID = ? AND c.ID = ?;
    `;

    const [results] = await db.execute(query, [
        Product_name,
        Brand_id,
        Product_type_id,
        Original_price,
        Consignment_price,
        Quantity,
        productId,
        consignmentId
    ]);

    return results;
};

module.exports = { updateConsignment };
