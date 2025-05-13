const db = require("../config/db");

const getConsignmentDetail = async (consignmentId) => {
    const query = `
       SELECT  
            c.ID AS Consignment_ID,
            c.Status AS Consignment_Status,
            c.Create_date AS Consignment_Create_Date,

            u.User_name AS Customer_Name,
            u.Email AS Customer_Email,

            p.ID AS Product_ID,
            p.Product_name AS Product_Name,
            p.Sale_price AS Sale_Price,
            p.Original_price AS Original_Price,
            p.Status AS Product_Status,
            p.Image AS Product_Image,

            b.Brand_name AS Brand_Name,
            pt.Product_type_name AS Product_Type_Name,

            d.Quantity AS Quantity,
            d.Price AS Consignment_Price
        FROM TH_Consignment_Ticket c
        JOIN TH_User u ON c.User_id = u.ID
        LEFT JOIN TH_Consignment_Ticket_Product_Detail d ON d.Ticket_id = c.ID
        LEFT JOIN TH_Product p ON p.ID = d.Product_id
        LEFT JOIN TH_Brand b ON p.Brand_id = b.ID
        LEFT JOIN TH_Product_Type pt ON p.Product_type_id = pt.ID
        WHERE c.ID = ?
        ORDER BY p.ID DESC;
    `;

    const [rows] = await db.execute(query, [consignmentId]);

    if (!rows || rows.length === 0) {
        return null;
    }

    const result = {
        Consignment_ID: rows[0].Consignment_ID,
        Consignment_Status: rows[0].Consignment_Status,
        Consignment_Create_Date: rows[0].Consignment_Create_Date,
        Customer_Name: rows[0].Customer_Name,
        Customer_Email: rows[0].Customer_Email,
        Products: []
    };

    // Chỉ thêm sản phẩm nếu tồn tại Product_ID
    for (const row of rows) {
        if (row.Product_ID !== null) {
            result.Products.push({
                Product_ID: row.Product_ID,
                Product_Name: row.Product_Name,
                Sale_Price: row.Sale_Price,
                Original_Price: row.Original_Price,
                Sale_price : row.Sale_price,
                Product_Status: row.Product_Status,
                Product_Image: row.Product_Image,
                Brand_Name: row.Brand_Name,
                Product_Type_Name: row.Product_Type_Name,
                Quantity: row.Quantity,
                Consignment_Price: row.Consignment_Price
            });
        }
    }

    return result;
};

module.exports = {
    getConsignmentDetail
};