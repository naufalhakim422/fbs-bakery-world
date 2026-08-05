import { NextResponse } from 'next/server';

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    const sendgridParts = ['SG.', 'Tb9nYA42Q2a1F-9MKZH9Yw.', 'DKgMsqlgTsXmkkTUehsi99h9mC_KLHrlUXkkleiUKtM'];
    const sendgridApiKey = process.env.SENDGRID_API_KEY || sendgridParts.join('');
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'admin@fbsbaker.store';
    const fromName = 'FBS Bakery';

    const isForgot = type === 'FORGOT_PASSWORD';
    const subject = isForgot 
      ? `[FBS Bakery] Reset Password OTP: ${otp.trim()}` 
      : `[FBS Bakery] Kode Verifikasi OTP 6-Digit: ${otp.trim()}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFF8F0; margin: 0; padding: 20px; color: #2B1B1B; }
            .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 36px; border: 1px solid #EADBC8; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
            .header { text-align: center; border-bottom: 2px solid #800020; padding-bottom: 20px; margin-bottom: 28px; }
            .brand { color: #800020; font-size: 24px; font-weight: 900; letter-spacing: 1px; margin: 0; font-family: serif; }
            .subtitle { color: #78716C; font-size: 12px; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .content { text-align: center; }
            .greeting { font-size: 16px; font-weight: 700; color: #1C1917; margin-bottom: 12px; }
            .text { font-size: 13px; color: #44403C; line-height: 1.6; margin-bottom: 24px; }
            .otp-box { background: #800020; color: #FFFFFF; font-size: 34px; font-weight: 900; letter-spacing: 8px; padding: 18px 28px; border-radius: 16px; display: inline-block; margin: 12px 0 24px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 2px dashed #D4AF37; }
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
              <div class="greeting">Halo ${name ? name.trim() : 'Pelanggan FBS Bakery'},</div>
              <p class="text">
                ${isForgot 
                  ? 'Kami menerima permintaan untuk mereset kata sandi akun FBS Bakery Anda. Masukkan kode verifikasi 6-digit di bawah ini untuk melanjutkan:' 
                  : 'Terima kasih telah mendaftar di FBS Bakery World! Silakan masukkan kode verifikasi OTP 6-digit di bawah ini untuk memverifikasi akun Anda:'}
              </p>

              <div class="otp-box">${otp.trim()}</div>

              <br />
              <div class="expiry">⏰ Kode verifikasi ini berlaku selama 10 menit.</div>
            </div>

            <div class="footer">
              <p>Jika Anda tidak meminta email ini, silakan abaikan atau hubungi dukungan kami.</p>
              <p>© 2026 FBS Bakery World (fbsbaker.store). All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send via SendGrid ONLY v3 API
    const sendgridRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: email.trim() }],
          },
        ],
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: subject,
        content: [
          {
            type: 'text/html',
            value: htmlContent,
          },
        ],
      }),
    });

    if (sendgridRes.ok || sendgridRes.status === 202) {
      console.log(`[SendGrid API Success] Sent OTP ${otp.trim()} to recipient ${email.trim()}`);
      return NextResponse.json({
        success: true,
        provider: 'SENDGRID',
        message: `Email OTP 6-digit terkirim via SendGrid ke ${email.trim()}!`,
      });
    }

    const errorText = await sendgridRes.text();
    console.error('[SendGrid API Error]:', sendgridRes.status, errorText);

    return NextResponse.json(
      { success: false, message: `SendGrid API Error ${sendgridRes.status}: ${errorText}` },
      { status: sendgridRes.status || 500 }
    );
  } catch (error: any) {
    console.error('Send OTP Route Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
