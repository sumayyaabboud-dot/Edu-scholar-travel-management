const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

async function sendStatusEmail(toEmail, studentName, decision, universityName) {
  const subject = decision === 'Granted'
    ? 'Congratulations! Your scholarship application has been granted'
    : 'Update on your scholarship application';

  const body = decision === 'Granted'
    ? `Dear ${studentName},\n\nGreat news! Your scholarship application to ${universityName} has been GRANTED.\n\nOur team will be in touch with next steps shortly.\n\n— Edu-Scholar Team`
    : `Dear ${studentName},\n\nYour scholarship application to ${universityName} has been placed on the WAITLIST.\n\nWe will notify you if a seat becomes available.\n\n— Edu-Scholar Team`;

  await transporter.sendMail({
    from: '"Edu-Scholar" <no-reply@eduscholar.com>',
    to: toEmail,
    subject,
    text: body
  });
}

async function sendInviteEmail(toEmail, name, setupLink) {
  await transporter.sendMail({
    from: '"Edu-Scholar" <no-reply@eduscholar.com>',
    to: toEmail,
    subject: 'You\'ve been invited to Edu-Scholar',
    text: `Dear ${name},\n\nA Super Admin has added you as a donor on Edu-Scholar. Set up your password to activate your account:\n\n${setupLink}\n\nThis link expires in 48 hours.\n\n— Edu-Scholar Team`
  });
}

module.exports = { sendStatusEmail, sendInviteEmail };