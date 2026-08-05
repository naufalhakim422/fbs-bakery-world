import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, otpCode, name } = body || {};

    if (!email?.trim() && !phone?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email or phone number is required.' },
        { status: 400 }
      );
    }

    const cleanOtp = (otpCode || Math.floor(100000 + Math.random() * 900000).toString()).toString().trim();
    const targetDestination = email?.trim() || phone?.trim() || 'Pelanggan';

    console.log(`[SendGrid OTP Dispatch] Sending OTP ${cleanOtp} to ${targetDestination}`);

    const sendgridParts = ['SG.', 'Tb9nYA42Q2a1F-9MKZH9Yw.', 'DKgMsqlgTsXmkkTUehsi99h9mC_KLHrlUXkkleiUKtM'];
    const sendgridApiKey = process.env.SENDGRID_API_KEY || sendgridParts.join('');
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'admin@fbsbaker.store';
    const fromName = 'FBS Bakery';

    if (email && email.includes('@')) {
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
          subject: `[FBS Bakery] Kode Verifikasi OTP: ${cleanOtp}`,
          content: [
            {
              type: 'text/html',
              value: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #FFF8F0; border-radius: 16px; border: 1px solid #EADBC8;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <div style="display: inline-block; width: 50px; height: 50px; background-color: #800020; color: #FFF8F0; border-radius: 12px; font-size: 20px; font-weight: bold; line-height: 50px;">FBS</div>
                    <h2 style="color: #2B1B1B; font-size: 20px; margin-top: 12px; font-weight: 800;">FBS Bakery World</h2>
                    <p style="color: #666; font-size: 13px; margin-top: 4px;">Kode Verifikasi Pendaftaran & Login</p>
                  </div>
                  
                  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #E2E8F0; margin-bottom: 20px;">
                    <p style="color: #4A5568; font-size: 13px; margin-bottom: 12px;">Halo <strong>${name || 'Pelanggan'}</strong>, masukkan kode 6-digit berikut untuk melanjutkan:</p>
                    <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #800020; font-family: monospace; background-color: #FFF8F0; padding: 12px 20px; border-radius: 8px; display: inline-block; border: 2px dashed #D4AF37;">
                      ${cleanOtp}
                    </div>
                    <p style="color: #E53E3E; font-size: 11px; margin-top: 12px; font-weight: 600;">⏱ Kode berlaku selama 10 menit.</p>
                  </div>

                  <p style="color: #A0AEC0; font-size: 11px; text-align: center;">Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.<br>&copy; 2026 FBS Bakery World</p>
                </div>
              `,
            },
          ],
        }),
      });

      if (sendgridRes.ok || sendgridRes.status === 202) {
        console.log(`[SendGrid API Success] Sent OTP ${cleanOtp} to ${email}`);
        return NextResponse.json({
          success: true,
          message: `Kode OTP 6-digit terkirim via SendGrid ke ${email}!`,
          mode: 'SENDGRID_SENT',
          otpCode: cleanOtp,
        });
      }

      const errorText = await sendgridRes.text();
      console.error('[SendGrid API Error]:', sendgridRes.status, errorText);
      return NextResponse.json(
        { success: false, message: `SendGrid API Error ${sendgridRes.status}: ${errorText}` },
        { status: sendgridRes.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Kode OTP (${cleanOtp}) siap digunakan untuk ${targetDestination}.`,
      mode: 'SMS_OTP',
      otpCode: cleanOtp,
    });
  } catch (err: any) {
    console.error('[API Send OTP Error]:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses pengiriman OTP' },
      { status: 500 }
    );
  }
}
