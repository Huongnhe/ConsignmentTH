const db = require("../config/db");

const getUserProducts = (userId, callback) => {
    const query = `
        SELECT p.ID, p.Product_name, p.Sale_price, p.Original_price, 
               p.Status, b.Brand_name, t.Product_type_name
        FROM TH_Product p
        JOIN TH_Brand b ON p.Brand_id = b.ID
        JOIN TH_Product_Type t ON p.Product_type_id = t.ID
        JOIN TH_Consignment_Ticket c ON c.ID = p.ID
        WHERE c.User_id = ?;
    `;
    db.query(query, [userId], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

module.exports = { getUserProducts };
