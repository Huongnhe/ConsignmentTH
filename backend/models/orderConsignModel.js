const db = require("../config/db");

const saleModel = {
    searchProducts: async (keyword) => {
        try {
            const [rows] = await db.query(
                `SELECT 
                    p.*, 
                    b.Brand_name, 
                    pt.Product_type_name,
                    ctp.Price AS consignment_price,
                    ctp.Quantity AS consignment_quantity
                FROM TH_Product p
                JOIN TH_Brand b ON p.Brand_id = b.ID
                JOIN TH_Product_Type pt ON p.Product_type_id = pt.ID
                LEFT JOIN TH_Consignment_Ticket_Product_Detail ctp ON p.ID = ctp.Product_id
                WHERE (p.Product_name LIKE ? OR b.Brand_name LIKE ? OR pt.Product_type_name LIKE ?)
                AND p.Status IN ('Received', 'Sold','Consigned')
                ORDER BY 
                    CASE WHEN p.Status = 'Received' THEN 0 ELSE 1 END,
                    p.Product_name ASC`,
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

            // Calculate total order value
            let totalValue = 0;
            const productIds = orderData.products.map(p => p.productId);
            
            // Check products and get price information
            const [products] = await connection.query(
                `SELECT 
                    p.ID, 
                    p.Sale_price, 
                    ctp.Price as Consignment_price,
                    ctp.Quantity as Consignment_quantity
                FROM TH_Product p
                LEFT JOIN TH_Consignment_Ticket_Product_Detail ctp ON p.ID = ctp.Product_id
                WHERE p.ID IN (?) AND p.Status = 'Received'`,
                [productIds]
            );

            if (products.length !== productIds.length) {
                throw new Error('Some products do not exist or are not available');
            }

            // Check inventory quantity
            for (const product of products) {
                if (product.Consignment_quantity !== null && product.Consignment_quantity <= 0) {
                    throw new Error(`Product ID ${product.ID} is out of stock`);
                }
            }

            // Calculate total value
            products.forEach(product => {
                totalValue += parseFloat(product.Consignment_price || product.Sale_price);
            });

            // 1. Create order
            const [orderResult] = await connection.query(
                `INSERT INTO TH_Order 
                (Total_value, Quantity, Order_status) 
                VALUES (?, ?, 'Processing')`,
                [totalValue, orderData.products.length]
            );
            const orderId = orderResult.insertId;

            // 2. Add customer information
            if (!orderData.customerInfo || (!orderData.customerInfo.name && !orderData.customerInfo.phone)) {
                throw new Error('Customer information is required');
            }

            await connection.query(
                `INSERT INTO TH_Customer_Info 
                (Order_id, Full_name, Phone, Address, Age) 
                VALUES (?, ?, ?, ?, ?)`,
                [
                    orderId,
                    orderData.customerInfo.name,
                    orderData.customerInfo.phone,
                    orderData.customerInfo.address || null,
                    orderData.customerInfo.age || null
                ]
            );

            // 3. Add order details and update quantity
            for (const product of products) {
                await connection.query(
                    `INSERT INTO TH_Order_Detail 
                    (Order_id, Product_id, Unit_price) 
                    VALUES (?, ?, ?)`,
                    [orderId, product.ID, product.Consignment_price || product.Sale_price]
                );

                // Update product status
                await connection.query(
                    `UPDATE TH_Product SET Status = 'Sold' WHERE ID = ?`,
                    [product.ID]
                );

                // If consignment product, update quantity
                if (product.Consignment_quantity !== null) {
                    await connection.query(
                        `UPDATE TH_Consignment_Ticket_Product_Detail 
                        SET Quantity = Quantity - 1 
                        WHERE Product_id = ? AND Quantity > 0`,
                        [product.ID]
                    );
                }
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
            // Get order and customer information
            const [orderRows] = await db.query(
                `SELECT o.*, 
                ci.Full_name, ci.Phone, ci.Address, ci.Age
                FROM TH_Order o
                JOIN TH_Customer_Info ci ON o.ID = ci.Order_id
                WHERE o.ID = ?`,
                [orderId]
            );
            
            if (orderRows.length === 0) throw new Error('Order not found');
            
            const order = orderRows[0];

            // Get product details with consignment information
            const [detailRows] = await db.query(
                `SELECT 
                    od.*, 
                    p.Product_name, 
                    b.Brand_name, 
                    p.Image,
                    p.Sale_price, 
                    ctp.Price as Consignment_price,
                    ctp.Quantity as Consignment_quantity
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
                    customer_age: order.Age
                },
                products: detailRows.map(item => ({
                    ...item,
                    final_price: item.Consignment_price || item.Sale_price,
                    quantity: item.Consignment_quantity
                }))
            };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = saleModel;