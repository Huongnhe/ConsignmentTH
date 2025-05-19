const db = require("../config/db");

const updateConsignment = async (productId, consignmentId, updatedData) => {
    let {
        Product_name = null,
        Brand_name = null,
        Product_Type_Name = null,
        Original_price = null,
        Sale_price = null,
        Quantity = null,
        Product_Image = null
    } = updatedData || {};

    console.log("Original received Product_Image:", Product_Image);
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
        throw new Error(`Required fields missing or invalid data: ${missingFields.join(', ')}`);
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [productCheck] = await connection.execute(
            "SELECT ID, Image FROM TH_Product WHERE ID = ?",
            [productId]
        );

        const [consignmentCheck] = await connection.execute(
            "SELECT ID FROM TH_Consignment_Ticket WHERE ID = ?",
            [consignmentId]
        );

        if (productCheck.length === 0 || consignmentCheck.length === 0) {
            throw new Error("Product or consignment ticket does not exist");
        }

        if (!Product_Image || Product_Image === null || Product_Image.trim() === '') {
            Product_Image = '../Images/default.png';
            console.log("Using default Product_Image:", Product_Image);
        }

        const [brandResults] = await connection.execute(
            "SELECT ID FROM TH_Brand WHERE Brand_name = ?", 
            [Brand_name]
        );
        const [typeResults] = await connection.execute(
            "SELECT ID FROM TH_Product_Type WHERE Product_type_name = ?", 
            [Product_Type_Name]
        );

        if (brandResults.length === 0 || typeResults.length === 0) {
            throw new Error("Brand or product type does not exist");
        }

        const brandId = brandResults[0].ID;
        const productTypeId = typeResults[0].ID;

        const calculatedConsignmentPrice = Original_price * 1.3;
        const calculatedSalePrice = Sale_price || calculatedConsignmentPrice * 1.2;

        await connection.execute(
            `UPDATE TH_Product SET
                Product_name = ?,
                Brand_id = ?,
                Product_type_id = ?,
                Original_price = ?,
                Sale_price = ?,
                Image = ?
             WHERE ID = ?`,
            [
                Product_name,
                brandId,
                productTypeId,
                Original_price,
                calculatedSalePrice,
                Product_Image,
                productId
            ]
        );

        await connection.execute(
            `UPDATE TH_Consignment_Ticket_Product_Detail SET
                Price = ?,
                Quantity = ?
             WHERE Product_id = ? AND Ticket_id = ?`,
            [calculatedConsignmentPrice, Quantity, productId, consignmentId]
        );

        await connection.commit();
        connection.release();

        return {
            success: true,
            message: "Successfully updated product and consignment information",
            updatedFields: {
                Product_name,
                Brand_name,
                Product_Type_Name,
                Original_price,
                Consignment_price: calculatedConsignmentPrice,
                Sale_price: calculatedSalePrice,
                Quantity,
                Product_Image
            }
        };

    } catch (error) {
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

        throw new Error("Update failed: " + error.message);
    }
};

module.exports = { updateConsignment };