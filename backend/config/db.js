require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Kết nối MySQL thành công!");
        connection.release();
    } catch (err) {
        console.error("Lỗi kết nối MySQL:", err);
        process.exit(1);
    }
})();

module.exports = pool;
