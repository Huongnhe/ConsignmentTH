// config/emailService.js
require("dotenv").config();
const nodemailer = require('nodemailer');

// Tạo transporter email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Hàm gửi email OTP
async function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: `"Hệ thống Ký gửi Hàng hóa" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Mã xác thực (OTP) cho tài khoản của bạn',
        text: `
            Xin chào,

            Bạn vừa yêu cầu xác thực tài khoản trên hệ thống Ký gửi Hàng hóa.

            Mã OTP của bạn là: ${otp}

            Lưu ý: Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.

            Trân trọng,
            Hệ thống Ký gửi Hàng hóa
        `,
        html: `
            <p>Xin chào,</p>
            <p>Bạn vừa yêu cầu xác thực tài khoản trên <strong>hệ thống Ký gửi Hàng hóa</strong>.</p>
            <p><strong>Mã OTP của bạn là: <span style="font-size: 18px;">${otp}</span></strong></p>
            <p><em>Lưu ý: Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ với bất kỳ ai.</em></p>
            <br/>
            <p>Trân trọng,<br/>Hệ thống Ký gửi Hàng hóa</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Lỗi gửi email:', error);
        return false;
    }
}

module.exports = {
    sendOTPEmail
};