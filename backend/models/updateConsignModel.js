const db = require("../config/db"); // Kết nối mysql2/promise

const updateConsignment = async (productId, productData) => {
    const {
        Product_name,
        Brand_id,
        Product_type_id,
        Original_price,
        Consignment_price,
        Quantity,
        Product_status,
        Consignment_status
    } = productData;

    // Validate bắt buộc
    if (
        !Product_name || !Brand_id || !Product_type_id ||
        Original_price == null || Consignment_price == null ||
        Quantity == null || !Product_status || !Consignment_status
    ) {
        throw new Error("Thiếu thông tin cần thiết để cập nhật");
    }

    const query = `
        UPDATE TH_Consignment_Ticket_Product_Detail
        SET 
            Product_Name = ?, 
            Brand_ID = ?, 
            Product_Type_ID = ?, 
            Original_Price = ?, 
            Consignment_Price = ?, 
            Quantity = ?, 
            Product_Status = ?, 
            Consignment_Status = ?
        WHERE ID = ?;
    `;

    const [results] = await db.execute(query, [
        Product_name,
        Brand_id,
        Product_type_id,
        Original_price,
        Consignment_price,
        Quantity,
        Product_status,
        Consignment_status,
        productId
    ]);

    return results;
};

module.exports = { updateConsignment };
