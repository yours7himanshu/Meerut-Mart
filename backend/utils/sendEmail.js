import nodemailer from 'nodemailer';

/**
 * Creates an edge-safe, request-scoped Gmail SMTP transporter.
 * Uses direct SSL/TLS on port 465 without connection pooling,
 * which is optimized for serverless edge workers.
 */
const createEmailTransporter = (env = {}) => {
  let user = env.EMAIL_USER || (typeof process !== "undefined" ? process.env.EMAIL_USER : undefined);
  let pass = env.EMAIL_PASS || (typeof process !== "undefined" ? process.env.EMAIL_PASS : undefined);

  if (typeof user === "string") user = user.trim().replace(/^["']|["']$/g, '');
  if (typeof pass === "string") pass = pass.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
      user,
      pass,
    },
    pool: false, // Prevents persistent socket leaks across requests in serverless isolates
  });
};

/**
 * Sends an email notification.
 *
 * @param {string|string[]} emails - Recipient email(s)
 * @param {string} message - Email body text
 * @param {Object} [options]
 * @param {Object} [options.env] - Cloudflare Worker environment bindings
 * @returns {Promise<Object>}
 */
const sendEmail = (emails, message, options = {}) => {
  const env = options.env || (typeof process !== "undefined" ? process.env : {});
  let user = env.EMAIL_USER || (typeof process !== "undefined" ? process.env.EMAIL_USER : undefined);
  if (typeof user === "string") user = user.trim().replace(/^["']|["']$/g, '');

  const recipients = Array.isArray(emails) ? emails.join(', ') : emails;

  const mailOptions = {
    from: `"Meerut Mart" <${user}>`,
    to: recipients,
    subject: 'Thank You for Your Order at MeerutMart.com',
    text: message || 'Your Order has been successfully placed',
  };

  const transporter = createEmailTransporter(env);

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      resolve(info);
    });
  });
};

export default sendEmail;
