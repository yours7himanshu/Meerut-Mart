import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = (env = {}) => {
  const user = env.EMAIL_USER || (typeof process !== "undefined" ? process.env.EMAIL_USER : undefined);
  const pass = env.EMAIL_PASS || (typeof process !== "undefined" ? process.env.EMAIL_PASS : undefined);

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }
  return transporter;
};

// Function to send email
const sendEmail = (emails, message, options = {}) => {
  const env = options.env || (typeof process !== "undefined" ? process.env : {});
  const user = env.EMAIL_USER || (typeof process !== "undefined" ? process.env.EMAIL_USER : undefined);

  const mailOptions = {
    from: user,
    to: emails,
    subject: 'Thank You for Your Order at MeerutMart.com',
    text: message || "Your Order has been successfully placed", 
  };

  const currentTransporter = getTransporter(env);

  return new Promise((resolve, reject) => {
    currentTransporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      resolve(info);
    });
  });
};

export default sendEmail;
