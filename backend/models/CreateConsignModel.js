const db = require("../config/db");

const createConsignment = async (productList, userId) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Tạo đơn ký gửi
        const [ticketResult] = await connection.query(
            `INSERT INTO th_consignment_ticket 
             (User_id, Status, Create_date)
             VALUES (?, 'Pending', CURRENT_TIMESTAMP)`,
            [userId]
        );
        const ticketId = ticketResult.insertId;

        // 2. Duyệt từng sản phẩm để thêm
        for (const productData of productList) {
            // 2.1 Lấy hoặc thêm Brand
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

            // 2.2 Lấy hoặc thêm Product Type
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
                    productData.Image || '../Images/default.png' // Sử dụng ảnh mặc định nếu không có
                ]
            );
            
            const productId = productResult.insertId;

            if (productData.details) {
                const sellingPrice = productData.Sale_price + (productData.Sale_price * 1.5);
                
                await connection.query(
                    `INSERT INTO th_consignment_ticket_product_detail
                    (Ticket_id, Product_id, Quantity, Price)
                    VALUES (?, ?, ?, ?)`,
                    [ticketId, productId, productData.details.Quantity, sellingPrice]  // Sử dụng sellingPrice đã tính
                );
                
            }
            

        }

        // 3. Commit giao dịch
        await connection.commit();

        return {
            success: true,
            ticketId,
            productList,
            message: "Tạo đơn ký gửi thành công"
        };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Lỗi khi tạo đơn ký gửi:", error);
        throw {
            success: false,
            message: error.message || "Lỗi khi tạo đơn ký gửi",
            errorCode: error.code || "UNKNOWN"
        };
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { createConsignment };