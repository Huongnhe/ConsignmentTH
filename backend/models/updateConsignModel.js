const db = require("../config/db");

const updateConsignment = async (productId, consignmentId, updatedData) => {
    // Destructure với giá trị mặc định
    const {
        Product_name = null,
        Brand_name = null,
        Product_Type_Name = null,
        Original_price = null,
        Consignment_price = null,
        Sale_price = null,
        Quantity = null
    } = updatedData || {};

    console.log("Received data:", {
        Product_name,
        Brand_name,
        Product_Type_Name,
        Original_price,
        Consignment_price,
        Sale_price,
        Quantity
    });

    // Kiểm tra bắt buộc chi tiết
    const requiredFields = {
        'Product_name': typeof Product_name === 'string',
        'Brand_name': typeof Brand_name === 'string',
        'Product_Type_Name': typeof Product_Type_Name === 'string',
        'Original_price': typeof Original_price === 'number' && !isNaN(Original_price),
        'Consignment_price': typeof Consignment_price === 'number' && !isNaN(Consignment_price),
        'Sale_price': typeof Sale_price === 'number' && !isNaN(Sale_price),
        'Quantity': typeof Quantity === 'number' && Quantity > 0
    };

    const missingFields = Object.entries(requiredFields)
        .filter(([_, isValid]) => !isValid)
        .map(([field]) => field);

    if (missingFields.length > 0) {
        console.error("Missing/invalid fields:", missingFields);
        throw new Error(`Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`);
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
            [Product_Type_Name]
        );
        
        if (typeResults.length === 0) {
            console.error(`Không tìm thấy Product Type: ${Product_Type_Name}`);
            throw new Error(`Loại sản phẩm "${Product_Type_Name}" không tồn tại`);
        }

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