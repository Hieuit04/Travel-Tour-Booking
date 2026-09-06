const nodemailer = require('nodemailer');

module.exports.sendMail = (email, subject, content) => {
  const transporter = nodemailer.createTransport({
    host: `smtp.gmail.com`,
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const mailOptions = {
    from: `hieu15904@gmail.com`,
    to: email,
    subject: subject,
    html : content
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(`Error`, error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}