const db = require("../config/db");

// Hàm cập nhật sản phẩm ký gửi
const updateProduct = (productId, productData, callback) => {
    const { Product_name, Sale_price, Original_price, Status, Brand_id, Product_type_id } = productData;

    const query = `
        UPDATE TH_Product
        SET 
            Product_name = ?, 
            Sale_price = ?, 
            Original_price = ?, 
            Status = ?, 
            Brand_id = ?, 
            Product_type_id = ?
        WHERE ID = ?;
    `;

    db.query(
        query,
        [Product_name, Sale_price, Original_price, Status, Brand_id, Product_type_id, productId],
        (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        }
    );
};

module.exports = { updateProduct };