const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY || '';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'FBS Bakery World <admin@fbsbaker.store>';
const targetRecipient = 'opaln9406@gmail.com';

const resend = new Resend(apiKey);

async function testResendEmail() {
  console.log(`[Resend Test] Initiating OTP Test Email dispatch to: ${targetRecipient}...`);
  console.log(`[Resend Test] Using Sender: ${fromEmail}`);

  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [targetRecipient],
      subject: `[FBS Bakery] Kode Verifikasi OTP 6-Digit: ${testOtp}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #FFF8F0; border-radius: 16px; border: 1px solid #EADBC8;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #800020; font-size: 24px; margin: 0; font-family: serif;">FBS BAKERY WORLD</h2>
            <p style="color: #666; font-size: 13px; margin-top: 4px;">Kode Verifikasi Email Pendaftaran & Login</p>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 24px; border-radius: 12px; text-align: center; border: 1px solid #EADBC8;">
            <p style="color: #444; font-size: 14px;">Halo <strong>opaln9406@gmail.com</strong>,</p>
            <p style="color: #666; font-size: 13px;">Berikut adalah Kode Verifikasi 6-Digit Anda:</p>
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #800020; font-family: monospace; background-color: #800020; color: #FFF; padding: 14px 24px; border-radius: 12px; display: inline-block; margin: 16px 0; border: 2px dashed #D4AF37;">
              ${testOtp}
            </div>
            <p style="color: #DC2626; font-size: 12px; font-weight: bold;">⏱ Kode berlaku selama 10 menit.</p>
          </div>

          <p style="color: #999; font-size: 11px; text-align: center; margin-top: 20px;">&copy; 2026 FBS Bakery World (fbsbaker.store)</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ [Resend Test Error]:', error);
      process.exit(1);
    } else {
      console.log('✅ [Resend Test Success] Email dispatch response:', data);
      console.log(`✅ Message ID: ${data.id}`);
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ [Resend Exception]:', err);
    process.exit(1);
  }
}

testResendEmail();
