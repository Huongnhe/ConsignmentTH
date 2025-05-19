const pool = require("../config/db");
const { sendOTPEmail } = require("../config/Auth");

async function getUserByEmail(email) {
    const sql = "SELECT * FROM th_user WHERE email = ?";
    const [rows] = await pool.execute(sql, [email]);
    return rows.length ? rows[0] : null;
}

async function createUser(username, email, hashedPassword) {
    const sql = "INSERT INTO th_user (User_name, Email, Password_User, Account) VALUES (?, ?, ?, 'Customer')";
    const [result] = await pool.execute(sql, [username, email, hashedPassword]);
    
    // Retrieve the newly created user information
    const [rows] = await pool.execute("SELECT * FROM th_user WHERE ID = ?", [result.insertId]);
    return rows[0];
}

async function createOTPRecord(email, otp, expiresAt) {
    // Delete old OTP records before creating new one
    await deleteOldOTPRecords(email);
    
    const sql = "INSERT INTO TH_Email_Verification (Email, OTP, Expires_At) VALUES (?, ?, ?)";
    const [result] = await pool.execute(sql, [email, otp, expiresAt]);
    return result;
}

async function getLatestOTPRecord(email) {
    const sql = "SELECT * FROM TH_Email_Verification WHERE Email = ? ORDER BY Created_At DESC LIMIT 1";
    const [rows] = await pool.execute(sql, [email]);
    return rows.length ? rows[0] : null;
}

async function verifyOTPRecord(email) {
    const sql = "UPDATE TH_Email_Verification SET Is_Verified = TRUE WHERE Email = ?";
    const [result] = await pool.execute(sql, [email]);
    return result;
}

async function isEmailVerified(email) {
    const sql = "SELECT * FROM TH_Email_Verification WHERE Email = ? AND Is_Verified = TRUE LIMIT 1";
    const [rows] = await pool.execute(sql, [email]);
    return rows.length > 0;
}

async function deleteOldOTPRecords(email) {
    const sql = "DELETE FROM TH_Email_Verification WHERE Email = ?";
    await pool.execute(sql, [email]);
}

async function registerWithOTP(username, email, password) {
    // 1. Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new Error("Email already exists in the system");
    }

    // 2. Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    await createOTPRecord(email, otp, expiresAt);
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
        throw new Error("Failed to send OTP. Please try again.");
    }

    return { email, message: "The OTP code has been sent." };
}

async function verifyAndCreateUser(username, email, password, otp) {
    // 1. Verify OTP
    const otpRecord = await getLatestOTPRecord(email);
    if (!otpRecord || otpRecord.OTP !== otp || new Date(otpRecord.Expires_At) < new Date()) {
        throw new Error("The OTP code is invalid or has expired.");
    }

    // 2. Check if email already exists (additional check)
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new Error("Email already exists in the system");
    }

    // 3. Create new user
    const user = await createUser(username, email, password);
    
    // 4. Mark email as verified
    await verifyOTPRecord(email);
    
    return user;
}

module.exports = {
    // User functions
    getUserByEmail,
    createUser,
    
    // OTP functions
    createOTPRecord,
    getLatestOTPRecord,
    verifyOTPRecord,
    isEmailVerified,
    deleteOldOTPRecords,
    
    // Authentication functions
    registerWithOTP,
    verifyAndCreateUser,
    sendOTPEmail
};