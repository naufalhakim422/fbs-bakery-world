import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';

export const resend = new Resend(resendApiKey);

// Custom configured sender or default onboarding sender if domain pending verification
export const RESEND_FROM = process.env.RESEND_FROM_EMAIL || 'FBS Bakery <onboarding@resend.dev>';

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
  const recipients = Array.isArray(to) ? to : [to];
  
  // Try sending with primary configured sender
  const primaryFrom = process.env.RESEND_FROM_EMAIL || 'FBS Bakery <admin@fbsbaker.store>';
  
  const primaryResult = await resend.emails.send({
    from: primaryFrom,
    to: recipients,
    subject,
    html,
    replyTo,
  });

  if (!primaryResult.error) {
    return primaryResult;
  }

  // If primary domain is not verified yet in Resend dashboard (403 domain_not_verified),
  // fallback to onboarding@resend.dev for test recipients
  if (primaryResult.error.message?.includes('not verified')) {
    console.warn('[Resend Warning] Primary domain fbsbaker.store pending verification in Resend dashboard. Fallback to onboarding@resend.dev');
    return await resend.emails.send({
      from: 'FBS Bakery <onboarding@resend.dev>',
      to: recipients,
      subject,
      html,
      replyTo,
    });
  }

  return primaryResult;
}
