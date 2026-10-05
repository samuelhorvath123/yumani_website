import { company } from '@/lib/company';
import { checkEnquiry, looksAutomated, sendEnquiry, type MailConfig } from '@/lib/contact';

// The contact survey lands here. It checks the answers again (the browser's checks
// are a courtesy, not a defence), hands them to the email service, and tells the
// browser only whether it worked. Nothing is stored: the enquiry exists in this
// request and in the email, and nowhere else.
//
// Configuration comes from the environment, never from the code:
//   RESEND_API_KEY  the email service's secret key (required)
//   CONTACT_FROM    a sender on a domain verified with that service, for example
//                   "Yumani website <website@yumaniautomation.com>" (required)
//   CONTACT_TO      where enquiries go (defaults to the company address)

const MAX_BODY_BYTES = 20_000;

const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

function readConfig(): MailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM?.trim();
  if (!apiKey || !from) return null;
  return { apiKey, from, to: process.env.CONTACT_TO?.trim() || company.email };
}

export async function POST(request: Request) {
  // A page on another site cannot send JSON without the browser first asking us
  // for permission, which we never give. Requiring it is what keeps this endpoint
  // from being posted to by a form on someone else's page.
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return reply({ error: 'unsupported' }, 415);
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return reply({ error: 'too-large' }, 413);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('shape');
    body = parsed as Record<string, unknown>;
  } catch {
    return reply({ error: 'invalid' }, 400);
  }

  // A script gets the same answer as a person, so it has nothing to learn from.
  if (looksAutomated(body.website, body.startedAt, Date.now())) return reply({ ok: true });

  const checked = checkEnquiry(body);
  if (!checked.ok) return reply({ error: 'invalid', errors: checked.errors }, 422);

  const config = readConfig();
  if (!config) {
    console.error('Contact survey: RESEND_API_KEY or CONTACT_FROM is not set.');
    return reply({ error: 'unavailable' }, 503);
  }

  try {
    const sent = await sendEnquiry(checked.value, config);
    if (!sent.ok) {
      // The status only. The enquiry is personal data and stays out of the logs.
      console.error(`Contact survey: the email service refused the message (${sent.status}).`);
      return reply({ error: 'delivery' }, 502);
    }
  } catch {
    console.error('Contact survey: the email service could not be reached.');
    return reply({ error: 'delivery' }, 502);
  }
  return reply({ ok: true });
}
