import { Resend } from 'resend';

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }
  return new Resend(apiKey.trim());
}

export const RESEND_FROM = process.env.RESEND_FROM_EMAIL || 'FBS Bakery World <admin@fbsbaker.store>';

export async function sendEmailViaResend({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const client = getResendClient();
  if (!client) {
    console.warn('[Resend] RESEND_API_KEY is missing in environment variables.');
    return {
      data: null,
      error: { message: 'RESEND_API_KEY is missing in server environment variables.', name: 'missing_api_key' },
    };
  }

  const recipients = Array.isArray(to) ? to : [to];
  const primaryFrom = process.env.RESEND_FROM_EMAIL || 'FBS Bakery World <admin@fbsbaker.store>';
  
  const primaryResult = await client.emails.send({
    from: primaryFrom,
    to: recipients,
    subject,
    html,
    replyTo,
  });

  if (!primaryResult.error) {
    return primaryResult;
  }

  if (primaryResult.error.message?.includes('not verified')) {
    console.warn('[Resend Warning] Primary domain pending verification. Fallback to onboarding@resend.dev');
    return await client.emails.send({
      from: 'FBS Bakery <onboarding@resend.dev>',
      to: recipients,
      subject,
      html,
      replyTo,
    });
  }

  return primaryResult;
}
