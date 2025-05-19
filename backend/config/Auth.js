require("dotenv").config();
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send OTP email
async function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: `"Goods Consignment System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verification Code (OTP) for your account',
        text: `
            Hello,

            You have requested account verification on the Goods Consignment System.

            Your OTP code is: ${otp}

            Note: This code will expire in 5 minutes. Please do not share this code with anyone.

            Best regards,
            Goods Consignment System
        `,
        html: `
            <p>Hello,</p>
            <p>You have requested account verification on the <strong>Goods Consignment System</strong>.</p>
            <p><strong>Your OTP code is: <span style="font-size: 18px;">${otp}</span></strong></p>
            <p><em>Note: This code will expire in 5 minutes. Please do not share it with anyone.</em></p>
            <br/>
            <p>Best regards,<br/>Goods Consignment System</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

module.exports = {
    sendOTPEmail
};