const pool = require("../config/db");

function getUserByEmail(email, callback) {
    const sql = "SELECT * FROM th_user WHERE email = ?";
    pool.query(sql, [email], (err, results) => {
        if (err) return callback(err, null);
        if (results.length === 0) return callback(null, null); // Không tìm thấy user
        callback(null, results[0]); // Trả về user đầu tiên
    });
}

// Tạo user mới
function createUser(username, email, hashedPassword, callback) {
    const sql = "INSERT INTO th_user (User_name, Email, Password_User, Account) VALUES (?, ?, ?, 'Customer')";
    pool.query(sql, [username, email, hashedPassword], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
}

module.exports = { getUserByEmail, createUser };