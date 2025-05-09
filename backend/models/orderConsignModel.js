const db = require("../config/db");

const saleModel = {
    // Tìm kiếm sản phẩm
    searchProducts: async (keyword) => {
        try {
            const [rows] = await db.query(
                `SELECT p.*, b.Brand_name, pt.Product_type_name 
                FROM TH_Product p
                JOIN TH_Brand b ON p.Brand_id = b.ID
                JOIN TH_Product_Type pt ON p.Product_type_id = pt.ID
                WHERE p.Product_name LIKE ? OR b.Brand_name LIKE ? 
                OR pt.Product_type_name LIKE ? AND p.Status = 'Received'`,
                [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

     createOrder: async (orderData) => {
        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            // Tính tổng giá trị đơn hàng
            let totalValue = 0;
            const productIds = orderData.products.map(p => p.productId);
            
            // Kiểm tra sản phẩm
            const [products] = await connection.query(
                `SELECT p.ID, p.Sale_price, ctp.Price as Consignment_price
                FROM TH_Product p
                LEFT JOIN TH_Consignment_Ticket_Product_Detail ctp ON p.ID = ctp.Product_id
                WHERE p.ID IN (?) AND p.Status = 'Received'`,
                [productIds]
            );

            if (products.length !== productIds.length) {
                throw new Error('Một số sản phẩm không tồn tại hoặc không có sẵn');
            }

            // Tính tổng giá trị
            products.forEach(product => {
                totalValue += parseFloat(product.Consignment_price || product.Sale_price);
            });

            // 1. Tạo đơn hàng (không còn customer_id)
            const [orderResult] = await connection.query(
                `INSERT INTO TH_Order 
                (Total_value, Quantity, Order_status) 
                VALUES (?, ?, 'Processing')`,
                [
                    totalValue,
                    orderData.products.length
                ]
            );
            const orderId = orderResult.insertId;

            // 2. Thêm thông tin khách hàng (bắt buộc phải có)
            if (!orderData.customerInfo || (!orderData.customerInfo.name && !orderData.customerInfo.phone)) {
                throw new Error('Thông tin khách hàng là bắt buộc');
            }

            await connection.query(
                `INSERT INTO TH_Customer_Info 
                (Order_id, Full_name, Phone, Address,Age) 
                VALUES (?, ?, ?, ?, ?)`,
                [
                    orderId,
                    orderData.customerInfo.name,
                    orderData.customerInfo.phone,
                    orderData.customerInfo.address || null,
                    orderData.customerInfo.Age || null
                ]
            );

            // 3. Thêm chi tiết đơn hàng
            for (const product of products) {
                await connection.query(
                    `INSERT INTO TH_Order_Detail 
                    (Order_id, Product_id, Unit_price) 
                    VALUES (?, ?, ?)`,
                    [
                        orderId,
                        product.ID,
                        product.Consignment_price || product.Sale_price
                    ]
                );

                await connection.query(
                    `UPDATE TH_Product SET Status = 'Sold' WHERE ID = ?`,
                    [product.ID]
                );
            }

            await connection.commit();
            return orderId;
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    getInvoice: async (orderId) => {
        try {
            // Lấy thông tin đơn hàng và khách hàng
            const [orderRows] = await db.query(
                `SELECT o.*, 
                ci.Full_name, ci.Phone, ci.Address, ci.Age
                FROM TH_Order o
                JOIN TH_Customer_Info ci ON o.ID = ci.Order_id
                WHERE o.ID = ?`,
                [orderId]
            );
            
            if (orderRows.length === 0) throw new Error('Không tìm thấy đơn hàng');
            
            const order = orderRows[0];

            // Lấy chi tiết sản phẩm
            const [detailRows] = await db.query(
                `SELECT od.*, p.Product_name, b.Brand_name, p.Image,
                p.Sale_price, ctp.Price as Consignment_price
                FROM TH_Order_Detail od
                JOIN TH_Product p ON od.Product_id = p.ID
                JOIN TH_Brand b ON p.Brand_id = b.ID
                LEFT JOIN TH_Consignment_Ticket_Product_Detail ctp ON p.ID = ctp.Product_id
                WHERE od.Order_id = ?`,
                [orderId]
            );

            return {
                order: {
                    ...order,
                    customer_name: order.Full_name,
                    customer_phone: order.Phone,
                    customer_address: order.Address,
                    customer_Age: order.Age,
                },
                products: detailRows.map(item => ({
                    ...item,
                    final_price: item.Consignment_price || item.Sale_price
                }))
            };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = saleModel;