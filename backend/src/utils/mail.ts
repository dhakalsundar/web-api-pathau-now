
import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM } from '../config/index';

// Create transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

/**
 * Send OTP email for password reset
 * @param to - Recipient email address
 * @param otp - 6-digit OTP
 */
export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject: ' Password Reset OTP - Pathau Now',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f97316; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background-color: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px; }
              .otp-box { background-color: white; border: 2px solid #f97316; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
              .otp-text { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #f97316; font-family: monospace; }
              .info { color: #666; line-height: 1.6; margin: 15px 0; }
              .warning { color: #e74c3c; font-size: 14px; margin-top: 10px; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1> Password Reset</h1>
              </div>
              <div class="content">
                <p>Hi,</p>
                <p>You requested a password reset for your Pathau Now account. Use the OTP below to proceed:</p>
                
                <div class="otp-box">
                  <div class="otp-text">${otp}</div>
                </div>
                
                <div class="info">
                  <strong> This OTP expires in 10 minutes.</strong>
                  <p>Don't share this OTP with anyone. Pathau Now support will never ask for your OTP.</p>
                </div>
                
                <div class="warning">
                   If you didn't request this, please ignore this email or contact support.
                </div>
                
                <div class="footer">
                  <p>&copy; 2026 Pathau Now. All rights reserved.</p>
                  <p>This is an automated email. Please do not reply.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(` [MAIL] OTP sent successfully to ${to}`);
  } catch (error) {
    console.error(' [MAIL] Failed to send OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Send password reset confirmation email
 * @param to - Recipient email address
 */
export const sendPasswordResetConfirmation = async (to: string): Promise<void> => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject: ' Password Reset Successful - Pathau Now',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #22c55e; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background-color: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px; }
              .info { color: #666; line-height: 1.6; margin: 15px 0; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1> Password Reset Successful</h1>
              </div>
              <div class="content">
                <p>Hi,</p>
                <p>Your password has been successfully reset. You can now log in with your new password.</p>
                
                <div class="info">
                  <p>If you didn't make this change, please contact our support team immediately.</p>
                </div>
                
                <div class="footer">
                  <p>&copy; 2026 Pathau Now. All rights reserved.</p>
                  <p>This is an automated email. Please do not reply.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(` [MAIL] Password reset confirmation sent to ${to}`);
  } catch (error) {
    console.error(' [MAIL] Failed to send confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
};
