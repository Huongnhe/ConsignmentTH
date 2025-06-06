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

// Test the connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Successfully connected to MySQL!");
        connection.release();
    } catch (err) {
        console.error("MySQL connection error:", err);
        process.exit(1);
    }
})();

module.exports = pool;