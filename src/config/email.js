const nodemailer = require("nodemailer");
const { config } = require("./env");
const logger = require("../utils/logger");

/**
 * Create email transporter
 */
const createTransporter = () => {
  // Check if email is configured
  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    logger.warn("Email configuration incomplete. Email features will be disabled.");
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  return transporter;
};

let transporter = null;

/**
 * Get or create email transporter
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Verify email configuration
 */
const verifyEmailConfig = async () => {
  const transport = getTransporter();
  
  if (!transport) {
    logger.warn("Email transporter not configured");
    return false;
  }

  try {
    await transport.verify();
    logger.info("Email configuration verified successfully");
    return true;
  } catch (error) {
    logger.error("Email configuration verification failed:", error.message);
    return false;
  }
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transport = getTransporter();
  
  if (!transport) {
    logger.warn(`Email not sent to ${to}: Email not configured`);
    return { success: false, reason: "Email not configured" };
  }

  try {
    const info = await transport.sendMail({
      from: config.emailFrom,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    });

    logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error.message);
    return { success: false, reason: error.message };
  }
};

module.exports = {
  getTransporter,
  verifyEmailConfig,
  sendEmail,
};
