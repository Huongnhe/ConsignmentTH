const db = require("../config/db");

const createConsignment = async (productList, userId) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Create consignment ticket
        const [ticketResult] = await connection.query(
            `INSERT INTO th_consignment_ticket 
             (User_id, Status, Create_date)
             VALUES (?, 'Pending', CURRENT_TIMESTAMP)`,
            [userId]
        );
        const ticketId = ticketResult.insertId;

        // 2. Process each product to add
        for (const productData of productList) {
            // 2.1 Get or add Brand
            let [brandRows] = await connection.query(
                `SELECT ID FROM th_brand WHERE Brand_name = ?`,
                [productData.Brand_name]
            );
            let brandId;
            if (brandRows.length === 0) {
                const [brandInsert] = await connection.query(
                    `INSERT INTO th_brand (Brand_name) VALUES (?)`,
                    [productData.Brand_name]
                );
                brandId = brandInsert.insertId;
            } else {
                brandId = brandRows[0].ID;
            }

            // 2.2 Get or add Product Type
            let [typeRows] = await connection.query(
                `SELECT ID FROM th_product_type WHERE Product_type_name = ?`,
                [productData.Product_type_name]
            );
            let productTypeId;
            if (typeRows.length === 0) {
                const [typeInsert] = await connection.query(
                    `INSERT INTO th_product_type (Product_type_name) VALUES (?)`,
                    [productData.Product_type_name]
                );
                productTypeId = typeInsert.insertId;
            } else {
                productTypeId = typeRows[0].ID;
            }

            // 2.3 Create product
            const [productResult] = await connection.query(
                `INSERT INTO th_product 
                (Product_name, Original_price, Sale_price, Status, Brand_id, Product_type_id, Image)
                VALUES (?, ?, ?, 'Consigned', ?, ?, ?)`,
                [
                    productData.Product_name,
                    productData.Original_price,
                    productData.Sale_price,
                    brandId,
                    productTypeId,
                    productData.Image || '../Images/default.png' // Use default image if none provided
                ]
            );
            
            const productId = productResult.insertId;

            // 2.4 Add product details if they exist
            if (productData.details) {
                const sellingPrice = productData.Sale_price + (productData.Sale_price * 1.5);
                
                await connection.query(
                    `INSERT INTO th_consignment_ticket_product_detail
                    (Ticket_id, Product_id, Quantity, Price)
                    VALUES (?, ?, ?, ?)`,
                    [ticketId, productId, productData.details.Quantity, sellingPrice]  // Use calculated sellingPrice
                );
            }
        }

        // 3. Commit transaction
        await connection.commit();

        return {
            success: true,
            ticketId,
            productList,
            message: "Consignment created successfully"
        };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error creating consignment:", error);
        throw {
            success: false,
            message: error.message || "Error creating consignment",
            errorCode: error.code || "UNKNOWN"
        };
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { createConsignment };