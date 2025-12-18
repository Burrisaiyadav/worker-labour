const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
    // If no email credentials, log to console
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('---------------------------------------------------');
        console.log(`[Mock Email] To: ${email}`);
        console.log(`[Mock Email] Subject: ${subject}`);
        console.log(`[Mock Email] Message: ${message}`);
        console.log('---------------------------------------------------');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // or your preferred service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: message,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Nodemailer failed, falling back to console log:', error);
        console.log('---------------------------------------------------');
        console.log(`[Mock Email - Fallback] To: ${email}`);
        console.log(`[Mock Email - Fallback] Subject: ${subject}`);
        console.log(`[Mock Email - Fallback] Message: ${message}`);
        console.log('---------------------------------------------------');
    }
};

module.exports = sendEmail;
