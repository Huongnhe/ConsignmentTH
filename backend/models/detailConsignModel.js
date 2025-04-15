const db = require("../config/db");

const getConsignmentDetail = (consignmentId, callback) => {
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
            b.Brand_name AS Brand_Name,
            pt.Product_type_name AS Product_Type_Name
        FROM TH_Consignment_Ticket c
        JOIN TH_User u ON c.User_id = u.ID
        LEFT JOIN TH_Product p ON p.ID = c.ID -- Giả định mỗi đơn ký gửi liên kết với một sản phẩm
        LEFT JOIN TH_Brand b ON p.Brand_id = b.ID
        LEFT JOIN TH_Product_Type pt ON p.Product_type_id = pt.ID
        WHERE c.ID = ?;
    `;
    db.query(query, [consignmentId], (err, results) => {
        if (err) return callback(err, null);
        if (results.length === 0) return callback(null, null); 
        callback(null, results); 
    });
};

module.exports = { getConsignmentDetail };