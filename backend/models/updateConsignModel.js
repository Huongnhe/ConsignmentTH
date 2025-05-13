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
        Quantity = null,
        Image = null
    } = updatedData || {};

    console.log("Received data:", {
        Product_name,
        Brand_name,
        Product_Type_Name,
        Original_price,
        Consignment_price,
        Sale_price,
        Quantity,
        Image
    });

    // Kiểm tra bắt buộc chi tiết
    const requiredFields = {
        'Product_name': typeof Product_name === 'string' && Product_name.trim() !== '',
        'Brand_name': typeof Brand_name === 'string' && Brand_name.trim() !== '',
        'Product_Type_Name': typeof Product_Type_Name === 'string' && Product_Type_Name.trim() !== '',
        'Original_price': typeof Original_price === 'number' && Original_price > 0,
        'Quantity': typeof Quantity === 'number' && Quantity > 0
    };

    const missingFields = Object.entries(requiredFields)
        .filter(([_, isValid]) => !isValid)
        .map(([field]) => field);

    if (missingFields.length > 0) {
        console.error("Missing/invalid fields:", missingFields);
        throw new Error(`Thiếu thông tin bắt buộc hoặc dữ liệu không hợp lệ: ${missingFields.join(', ')}`);
    }

    // Bắt đầu transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Kiểm tra tồn tại sản phẩm và phiếu consignment
        const [productCheck] = await connection.execute(
            "SELECT ID FROM TH_Product WHERE ID = ?",
            [productId]
        );
        
        const [consignmentCheck] = await connection.execute(
            "SELECT ID FROM TH_Consignment_Ticket WHERE ID = ?",
            [consignmentId]
        );

        if (productCheck.length === 0 || consignmentCheck.length === 0) {
            throw new Error("Sản phẩm hoặc phiếu consignment không tồn tại");
        }

        // 2. Lấy Brand_id và Product_type_id
        const [brandResults] = await connection.execute(
            "SELECT ID FROM TH_Brand WHERE Brand_name = ?", 
            [Brand_name]
        );
        const [typeResults] = await connection.execute(
            "SELECT ID FROM TH_Product_Type WHERE Product_type_name = ?", 
            [Product_Type_Name]
        );

        console.log("Brand search results:", brandResults);
        console.log("Type search results:", typeResults);
                
        if (brandResults.length === 0 || typeResults.length === 0) {
            throw new Error("Thương hiệu hoặc loại sản phẩm không tồn tại");
        }

        const brandId = brandResults[0].ID;
        const productTypeId = typeResults[0].ID;

        // 3. Tính toán giá đồng bộ
        // Giá ký gửi = Giá gốc + 30% (nếu không được cung cấp)
        const calculatedConsignmentPrice = Consignment_price || Original_price * 1.3;
        // Giá bán = Giá ký gửi + 20% (nếu không được cung cấp)
        const calculatedSalePrice = Sale_price || calculatedConsignmentPrice * 1.2;

        // 4. Cập nhật bảng TH_Product
        await connection.execute(
            `UPDATE TH_Product SET
                Product_name = ?,
                Brand_id = ?,
                Product_type_id = ?,
                Original_price = ?,
                Sale_price = ?,
                Image = COALESCE(?, Image)
             WHERE ID = ?`,
            [
                Product_name, 
                brandId, 
                productTypeId, 
                Original_price, 
                calculatedSalePrice,
                Image,
                productId
            ]
        );

        // 5. Cập nhật bảng TH_Consignment_Ticket_Product_Detail
        await connection.execute(
            `UPDATE TH_Consignment_Ticket_Product_Detail SET
                Price = ?,
                Quantity = ?
             WHERE Product_id = ? AND Ticket_id = ?`,
            [calculatedConsignmentPrice, Quantity, productId, consignmentId]
        );

        // Commit transaction
        await connection.commit();
        connection.release();

        return { 
            success: true, 
            message: "Cập nhật sản phẩm và thông tin consignment thành công",
            updatedFields: {
                Product_name,
                Brand_name,
                Product_Type_Name,
                Original_price,
                Consignment_price: calculatedConsignmentPrice,
                Sale_price: calculatedSalePrice,
                Quantity,
                Image: Image || 'Giữ nguyên ảnh cũ'
            }
        };

    } catch (error) {
        // Rollback transaction trước khi throw error
        if (connection) {
            await connection.rollback();
            connection.release();
        }

        console.error("Error in updateConsignment:", {
            message: error.message,
            stack: error.stack,
            productId,
            consignmentId,
            updatedData
        });

        let errorMessage = "Cập nhật thất bại: " + error.message;
        throw new Error(errorMessage);
    }
};

module.exports = { updateConsignment };