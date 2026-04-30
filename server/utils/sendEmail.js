const nodemailer = require('nodemailer');

/**
 * Utility to send emails via SMTP (e.g. Gmail, Outlook, etc.)
 * This replaces SendGrid to provide a more flexible free tier.
 */
const sendEmail = async (options) => {
  try {
    // 1. Create a transporter
    // For Gmail: Use Service: 'gmail', and Auth: { user: 'email', pass: 'App Password' }
    // For others: Use Host, Port, and Auth
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password or App Password
      }
    });

    // 2. Define email options
    const mailOptions = {
      from: `"EduNexus LMS" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error(`❌ Email failed for ${options.email}:`, error.message);
  }
};

module.exports = sendEmail;