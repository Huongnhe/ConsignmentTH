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

    // Tạo đơn hàng mới
    createOrder: async (orderData, userId) => {
        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            // Tạo thông tin khách hàng (nếu có)
            let customerInfoId = null;
            if (orderData.customerInfo && (orderData.customerInfo.name || orderData.customerInfo.phone)) {
                const [customerResult] = await connection.query(
                    `INSERT INTO TH_Customer_Info 
                    (Name, Address, Phone, Age) 
                    VALUES (?, ?, ?, ?)`,
                    [
                        orderData.customerInfo.name,
                        orderData.customerInfo.address,
                        orderData.customerInfo.phone,
                        orderData.customerInfo.age
                    ]
                );
                customerInfoId = customerResult.insertId;
            }

            // Tạo đơn hàng
            const [orderResult] = await connection.query(
                `INSERT INTO TH_Order 
                (Customer_id, Total_value, Quantity, Order_status, Customer_info_id) 
                VALUES (?, ?, ?, 'Processing', ?)`,
                [
                    orderData.customerId || null, // Có thể là null nếu khách vãng lai
                    orderData.totalValue,
                    orderData.totalQuantity,
                    customerInfoId
                ]
            );
            const orderId = orderResult.insertId;

            // Thêm chi tiết đơn hàng
            for (const item of orderData.products) {
                await connection.query(
                    `INSERT INTO TH_Order_Detail 
                    (Order_id, Product_id, Unit_price) 
                    VALUES (?, ?, ?)`,
                    [orderId, item.productId, item.price]
                );

                // Cập nhật trạng thái sản phẩm thành 'Sold'
                await connection.query(
                    `UPDATE TH_Product SET Status = 'Sold' WHERE ID = ?`,
                    [item.productId]
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

    // Lấy thông tin hóa đơn
    getInvoice: async (orderId) => {
        try {
            // Lấy thông tin chính đơn hàng
            const [orderRows] = await db.query(
                `SELECT o.*, 
                u.User_name as customer_name, u.Email as customer_email,
                ci.Name as guest_name, ci.Phone as guest_phone, ci.Address as guest_address
                FROM TH_Order o
                LEFT JOIN TH_User u ON o.Customer_id = u.ID
                LEFT JOIN TH_Customer_Info ci ON o.Customer_info_id = ci.ID
                WHERE o.ID = ?`,
                [orderId]
            );
            
            if (orderRows.length === 0) throw new Error('Order not found');
            
            const order = orderRows[0];

            // Lấy chi tiết sản phẩm
            const [detailRows] = await db.query(
                `SELECT od.*, p.Product_name, b.Brand_name, p.Image
                FROM TH_Order_Detail od
                JOIN TH_Product p ON od.Product_id = p.ID
                JOIN TH_Brand b ON p.Brand_id = b.ID
                WHERE od.Order_id = ?`,
                [orderId]
            );

            return {
                order,
                products: detailRows
            };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = saleModel;