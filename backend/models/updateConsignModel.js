const db = require("../config/db");

const updateConsignment = async (productId, consignmentId, updatedData) => {
    const {
        Product_name,
        Brand_name,
        Product_type_name,
        Original_price,
        Consignment_price,
        Sale_price,
        Quantity,
    } = updatedData;

    // Kiểm tra thông tin đầu vào
    if (
        !Product_name || !Brand_name || !Product_type_name ||
        Original_price == null || Consignment_price == null || Sale_price == null ||
        Quantity == null
    ) {
        throw new Error("Thiếu thông tin cần thiết để cập nhật");
    }

    // Bắt đầu transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
    
        const [brandResults] = await connection.execute(
            "SELECT ID FROM TH_Brand WHERE Brand_name = ?", 
            [Brand_name]
        );
        const [typeResults] = await connection.execute(
            "SELECT ID FROM TH_Product_Type WHERE Product_type_name = ?", 
            [Product_type_name]
        );

        if (brandResults.length === 0 || typeResults.length === 0) {
            throw new Error("Brand hoặc Product Type không tồn tại");
        }

        const brandId = brandResults[0].ID;
        const productTypeId = typeResults[0].ID;

        // 2. Cập nhật bảng TH_Product
        await connection.execute(
            `UPDATE TH_Product SET
                Product_name = ?,
                Brand_id = ?,
                Product_type_id = ?,
                Original_price = ?,
                Sale_price = ?
             WHERE ID = ?`,
            [Product_name, brandId, productTypeId, Original_price, Sale_price, productId]
        );

        // 3. Cập nhật bảng TH_Consignment_Ticket_Product_Detail
        await connection.execute(
            `UPDATE TH_Consignment_Ticket_Product_Detail SET
                Price = ?,
                Quantity = ?
             WHERE Product_id = ? AND Ticket_id = ?`,
            [Consignment_price, Quantity, productId, consignmentId]
        );

        // Commit transaction nếu thành công
        await connection.commit();
        connection.release();

        return { success: true, message: "Cập nhật thành công" };

    } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
    }
};

module.exports = { updateConsignment };