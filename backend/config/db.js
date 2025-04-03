const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "root", 
    password: "huongne",
    database: "ConsignmentTH",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error("Lỗi kết nối MySQL:", err);
        process.exit(1);
    }
    console.log("Kết nối MySQL thành công!");
    connection.release();
});

module.exports = pool;
