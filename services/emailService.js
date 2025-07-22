const nodemailer = require("nodemailer");
const config = require("../config");

/** Create and reuse a single transporter instance */
const transporter = nodemailer.createTransport({
  host: config.SMTP.host,
  port: config.SMTP.port,
  auth: {
    user: config.SMTP.user,
    pass: config.SMTP.pass,
  },
});

/**
 * Generic email sender
 * @param {Object} options - nodemailer sendMail options
 */
const sendEmail = async (options) => {
  return transporter.sendMail(options);
};

/**
 * OTP Email HTML template
 */
const otpEmailHtml = (otp) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; padding: 32px; border-radius: 12px; max-width: 420px; margin: auto;">
    <h2 style="color: #1976d2; text-align: center; margin-bottom: 8px;">Your One-Time Passcode (OTP)</h2>
    <p style="font-size: 16px; color: #333; text-align: center; margin-bottom: 24px;">
      Use the code below to verify your email address. This code is valid for 10 minutes.
    </p>
    <div style="background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #e3e3e3; padding: 24px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 2.5rem; letter-spacing: 12px; color: #1976d2; font-weight: bold;">${otp}</span>
    </div>
    <p style="font-size: 15px; color: #666; text-align: center; margin-bottom: 0;">
      If you did not request this code, you can safely ignore this email.
    </p>
    <p style="font-size: 13px; color: #aaa; text-align: center; margin-top: 24px;">
      &copy; ${new Date().getFullYear()} ForSynse. All rights reserved.
    </p>
  </div>
`;

/**
 * Signup Alert Email HTML template
 */
const signupAlertHtml = (user) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; padding: 32px; border-radius: 12px; max-width: 420px; margin: auto;">
    <h2 style="color: #1976d2; text-align: center; margin-bottom: 8px;">New User Signup Alert</h2>
    <p style="font-size: 16px; color: #333; text-align: center; margin-bottom: 24px;">
      A new user has signed up for <b>${user.domain}</b>.
    </p>
    <div style="background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #e3e3e3; padding: 24px; text-align: left; margin-bottom: 24px;">
      <b>First Name:</b> ${user.first_name}<br/>
      <b>Last Name:</b> ${user.last_name}<br/>
      <b>Email:</b> ${user.email}<br/>
      <b>Signup Time:</b> ${user.created_at}
    </div>
    <p style="font-size: 13px; color: #aaa; text-align: center; margin-top: 24px;">
      &copy; ${new Date().getFullYear()} ForSynse. All rights reserved.
    </p>
  </div>
`;

/** Send OTP Email */
exports.sendOTPEmail = async (to, otp) => {
  await sendEmail({
    from: config.SMTP.user,
    to,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
    html: otpEmailHtml(otp),
  });
};

/** Send Signup Alert Email */
exports.sendSignupAlert = async (user) => {
  await sendEmail({
    from: config.SMTP.user,
    to: config.SMTP.signup_alert || config.SMTP.user,
    subject: `New Sign up For - ${user.domain}`,
    html: signupAlertHtml(user),
  });
};
