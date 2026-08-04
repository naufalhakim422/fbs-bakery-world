import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, name, type } = body || {};

    if (!email?.trim() || !otp?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP code are required.' },
        { status: 400 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'FBS Baker <admin@fbsbaker.store>';
    const isForgot = type === 'FORGOT_PASSWORD';
    const subject = isForgot ? 'Reset Your Password' : 'Verify Your Email';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFF8F0; margin: 0; padding: 20px; color: #2B1B1B; }
            .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 36px; border: 1px solid #EADBC8; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
            .header { text-align: center; border-bottom: 2px solid #800020; padding-bottom: 20px; margin-bottom: 28px; }
            .brand { color: #800020; font-size: 22px; font-weight: 800; letter-spacing: 1px; margin: 0; font-family: serif; }
            .subtitle { color: #78716C; font-size: 12px; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .content { text-align: center; }
            .greeting { font-size: 16px; font-weight: 700; color: #1C1917; margin-bottom: 12px; }
            .text { font-size: 13px; color: #44403C; line-height: 1.6; margin-bottom: 24px; }
            .otp-box { background: #800020; color: #FFFFFF; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 18px 24px; border-radius: 14px; display: inline-block; margin: 12px 0 24px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
            .expiry { font-size: 12px; color: #DC2626; font-weight: 700; background: #FEF2F2; padding: 8px 14px; border-radius: 10px; display: inline-block; border: 1px solid #FCA5A5; }
            .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #E7E5E4; font-size: 11px; color: #A8A29E; text-align: center; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="brand">FBS BAKERY WORLD</h1>
              <div class="subtitle">${isForgot ? 'Password Reset Verification' : 'Customer Account Email Verification'}</div>
            </div>

            <div class="content">
              <div class="greeting">Hello ${name ? name.trim() : 'Valued Customer'},</div>
              <p class="text">
                ${isForgot 
                  ? 'We received a request to reset your FBS Baker account password. Please use the 6-digit verification code below to proceed:' 
                  : 'Thank you for registering at FBS Baker! Please enter the 6-digit verification code below to verify your email address:'}
              </p>

              <div class="otp-box">${otp.trim()}</div>

              <br />
              <div class="expiry">⏰ This verification code expires in 10 minutes.</div>
            </div>

            <div class="footer">
              <p>If you did not request this email, please ignore it or contact our support team.</p>
              <p>© 2026 FBS Bakery World (fbsbaker.store). All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: fromEmail,
      to: [email.trim()],
      subject: subject,
      html: htmlContent,
    });

    if (data.error) {
      console.error('Resend Email Error:', data.error);
      return NextResponse.json(
        { success: false, error: data.error.message || 'Failed to send verification email.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Send OTP Route Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
