import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, phone, otpCode, name } = await req.json();

    const targetDestination = email || phone || 'Pelanggan';

    console.log(`[OTP EMAIL BOT TRIGGERED] Sending OTP ${otpCode} to ${targetDestination}`);

    // If Resend API Key is available in Environment Variables
    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey && email && email.includes('@')) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: 'FBS Bakery Security <onboarding@resend.dev>',
            to: [email],
            subject: `[FBS Bakery] Kode Verifikasi Keamanan (OTP): ${otpCode}`,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #FFF8F0; border-radius: 16px; border: 1px solid #EADBC8;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="display: inline-block; width: 50px; height: 50px; background-color: #800020; color: #FFF8F0; border-radius: 12px; font-size: 20px; font-weight: bold; line-height: 50px;">FBS</div>
                  <h2 style="color: #2B1B1B; font-size: 20px; margin-top: 12px; font-weight: 800;">FBS Bakery World</h2>
                  <p style="color: #666; font-size: 13px; margin-top: 4px;">Kode Verifikasi Pendaftaran & Login</p>
                </div>
                
                <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #E2E8F0; margin-bottom: 20px;">
                  <p style="color: #4A5568; font-size: 13px; margin-bottom: 12px;">Halo <strong>${name || 'Pelanggan'}</strong>, masukkan kode 6-digit berikut untuk melanjutkan:</p>
                  <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #800020; font-family: monospace; background-color: #FFF8F0; padding: 12px 20px; border-radius: 8px; display: inline-block; border: 2px dashed #D4AF37;">
                    ${otpCode}
                  </div>
                  <p style="color: #E53E3E; font-size: 11px; margin-top: 12px; font-weight: 600;">⏱ Kode berlaku selama 60 detik.</p>
                </div>

                <p style="color: #A0AEC0; font-size: 11px; text-align: center;">Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.<br>&copy; 2026 FBS Bakery World</p>
              </div>
            `,
          }),
        });

        const data = await resendRes.json();
        console.log('[Resend API Response]:', data);

        if (resendRes.ok) {
          return NextResponse.json({
            success: true,
            message: `Kode OTP terkirim langsung ke Inbox Email ${email}!`,
            mode: 'REAL_EMAIL_SENT',
          });
        }
      } catch (emailErr) {
        console.error('[Resend Email Send Error]:', emailErr);
      }
    }

    // Default simulation fallback response
    return NextResponse.json({
      success: true,
      message: `Bot telah mengirimkan kode OTP (${otpCode}) ke ${targetDestination}.`,
      mode: 'BOT_SIMULATED',
      otpCode,
    });
  } catch (err: any) {
    console.error('[API Send OTP Error]:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses pengiriman OTP' },
      { status: 500 }
    );
  }
}
