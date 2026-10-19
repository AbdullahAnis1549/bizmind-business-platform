import nodemailer from 'nodemailer';

// Create transporter using Gmail SMTP (or any SMTP)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD, // Gmail App Password
    },
  });
};

/**
 * Send OTP verification email to owner
 * @param {string} email - Recipient email address
 * @param {string} name - User's name
 * @param {string} otp - 6-digit OTP code
 */
export const sendOTPEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#312e81 100%);padding:32px 40px;text-align:center;">
                <div style="display:inline-flex;align-items:center;gap:10px;">
                  <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#818cf8);display:inline-block;text-align:center;line-height:40px;">
                    <span style="color:#fff;font-size:18px;">✦</span>
                  </div>
                  <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">BizMind AI</span>
                </div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;font-weight:700;">Security Verification</h2>
                <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
                  Hello <strong style="color:#0f172a;">${name}</strong>, we detected a login attempt to your owner account. Use the code below to verify your identity.
                </p>

                <!-- OTP Box -->
                <div style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:2px dashed #cbd5e1;border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;">
                  <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Verification Code</p>
                  <div style="font-size:36px;font-weight:800;letter-spacing:12px;color:#4f46e5;font-family:'Courier New',monospace;">
                    ${otp}
                  </div>
                </div>

                <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:24px;">
                  <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                    ⏳ This code expires in <strong>5 minutes</strong>. Do not share this code with anyone. BizMind AI will never ask for your verification code.
                  </p>
                </div>

                <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
                  If you did not attempt to log in, please ignore this email or contact support immediately.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                <p style="margin:0;color:#94a3b8;font-size:11px;">
                  © ${new Date().getFullYear()} BizMind AI · Secure Multi-Tenant Platform
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const mailOptions = {
    from: `"BizMind AI Security" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: `🔐 ${otp} — Your BizMind AI Verification Code`,
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] OTP sent to ${email} — MessageID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send OTP to ${email}:`, error.message);
    throw new Error('Failed to send verification email. Please try again.');
  }
};
