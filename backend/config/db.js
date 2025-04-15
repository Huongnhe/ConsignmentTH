const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

});

// const pool = mysql.createPool({
//     host: "localhost",
//     user: "root", 
//     password: "huongne",
//     database: "ConsignmentTH",
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

pool.getConnection((err, connection) => {

    if (err) {
        console.error("Lỗi kết nối MySQL:", err);
        process.exit(1);
    }
    console.log("Kết nối MySQL thành công!");
    connection.release();
});

const promisePool = pool.promise();

module.exports = promisePool;