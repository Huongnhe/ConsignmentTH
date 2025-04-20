const pool = require("../config/db");

// Lấy thông tin user theo email
async function getUserByEmail(email) {
    const sql = "SELECT * FROM th_user WHERE email = ?";
    const [rows] = await pool.execute(sql, [email]);
    if (rows.length === 0) return null;
    return rows[0]; // Trả về user đầu tiên
}

// Tạo user mới
async function createUser(username, email, hashedPassword) {
    const sql = "INSERT INTO th_user (User_name, Email, Password_User, Account) VALUES (?, ?, ?, 'Customer')";
    const [result] = await pool.execute(sql, [username, email, hashedPassword]);
    return result;
}

module.exports = {
    getUserByEmail,
    createUser
};
