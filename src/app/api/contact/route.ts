import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body || {};

    // LANGKAH 5: Validasi semua field. Jika ada field kosong return status 400
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: 'All fields (name, email, phone, subject, message) are required.' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // LANGKAH 6 & 7: Kirim email menggunakan Resend
    // Sender domain: fbsbaker.store (VERIFIED)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'FBS Baker <contact@fbsbaker.store>';
    const toEmail = 'opallbusiness@gmail.com';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f6f0; margin: 0; padding: 20px; color: #2b1b1b; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #eadbc8; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { border-bottom: 2px solid #800020; padding-bottom: 16px; margin-bottom: 24px; }
            .header h2 { color: #800020; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
            .badge { display: inline-block; background: #800020; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 12px; margin-top: 6px; }
            .field-group { margin-bottom: 16px; }
            .label { font-size: 11px; font-weight: bold; color: #800020; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .value { font-size: 14px; color: #1c1917; background: #fdfbf7; padding: 10px 14px; border-radius: 8px; border: 1px solid #e7e5e4; word-break: break-word; }
            .message-box { font-size: 14px; color: #1c1917; background: #fff8f0; padding: 16px; border-radius: 10px; border-left: 4px solid #800020; line-height: 1.6; white-space: pre-wrap; }
            .footer { margin-top: 24px; pt: 16px; border-top: 1px solid #e7e5e4; font-size: 11px; color: #78716c; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form - FBS Baker</h2>
              <span class="badge">fbsbaker.store Inquiry</span>
            </div>

            <div class="field-group">
              <div class="label">Customer Name</div>
              <div class="value">${name.trim()}</div>
            </div>

            <div class="field-group">
              <div class="label">Email Address</div>
              <div class="value"><a href="mailto:${email.trim()}" style="color: #800020; font-weight: bold; text-decoration: none;">${email.trim()}</a></div>
            </div>

            <div class="field-group">
              <div class="label">Phone Number</div>
              <div class="value">${phone.trim()}</div>
            </div>

            <div class="field-group">
              <div class="label">Subject</div>
              <div class="value">${subject.trim()}</div>
            </div>

            <div class="field-group">
              <div class="label">Message</div>
              <div class="message-box">${message.trim()}</div>
            </div>

            <div class="footer">
              <p>This message was sent from the Contact Form on <strong>fbsbaker.store</strong>.</p>
              <p>Clicking <strong>Reply</strong> in your email client will reply directly to <strong>${email.trim()}</strong>.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email.trim(), // LANGKAH 7: Set Reply-To agar klik Reply membalas customer
      subject: `New Contact Form - FBS Baker: ${subject.trim()}`,
      html: htmlContent,
    });

    if (data.error) {
      console.error('Resend Email Error:', data.error);
      return NextResponse.json(
        { success: false, error: data.error.message || 'Failed to send email via Resend' },
        { status: 500 }
      );
    }

    // LANGKAH 8: Jika berhasil return { success: true }
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Contact Form Route Internal Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
