/**
 * The contact survey: what is asked, how an answer is checked, and how it becomes
 * an email. The browser and the server use the same checks, so a visitor is never
 * told one thing in the form and another by the server, and the server never has
 * to trust what the browser claims.
 */
export const SERVICES = [
  'Web application',
  'Custom software',
  'System integration',
  'Practical AI',
  'Not sure yet',
] as const;

export const TIMELINES = [
  'As soon as possible',
  'In the next few months',
  'Just exploring for now',
] as const;

export const LIMITS = { name: 120, email: 254, organisation: 160, challengeMin: 10, challenge: 3000 } as const;

/** The least time a person could plausibly take over four questions. */
export const MIN_FILL_MS = 4000;

export type Draft = {
  services: string[];
  challenge: string;
  timeline: string;
  name: string;
  email: string;
  organisation: string;
};

export type Field = keyof Draft;
export type FieldErrors = Partial<Record<Field, string>>;

export const emptyDraft: Draft = { services: [], challenge: '', timeline: '', name: '', email: '', organisation: '' };

/** The fields each step of the survey asks for, in order. */
export const STEP_FIELDS: readonly (readonly Field[])[] = [
  ['services'],
  ['challenge'],
  ['timeline'],
  ['name', 'email', 'organisation'],
];

// Control characters have no place in a name or an email, and one in a subject line
// is how mail headers get forged. Line breaks are kept only where a person writes
// paragraphs.
// eslint-disable-next-line no-control-regex -- matching control characters is the point
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const clean = (value: unknown, multiline = false) => {
  if (typeof value !== 'string') return '';
  const text = value.replace(CONTROL, '');
  return (multiline ? text.replace(/\r\n?/g, '\n') : text.replace(/[\r\n\t]+/g, ' ')).trim();
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Turns whatever arrived into a draft of the right shape, dropping anything else. */
export function normalizeDraft(input: unknown): Draft {
  const source = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  const services = Array.isArray(source.services)
    ? SERVICES.filter((service) => (source.services as unknown[]).includes(service))
    : [];
  return {
    services: [...services],
    challenge: clean(source.challenge, true),
    timeline: clean(source.timeline),
    name: clean(source.name),
    email: clean(source.email),
    organisation: clean(source.organisation),
  };
}

const validators: Record<Field, (draft: Draft) => string | undefined> = {
  services: (d) => (d.services.length === 0 ? 'Pick at least one, or choose “Not sure yet”.' : undefined),
  challenge: (d) =>
    d.challenge.length < LIMITS.challengeMin
      ? 'Tell us a little more. A sentence or two is plenty.'
      : d.challenge.length > LIMITS.challenge
        ? `Please keep it under ${LIMITS.challenge} characters. You can tell us the rest when we reply.`
        : undefined,
  timeline: (d) => ((TIMELINES as readonly string[]).includes(d.timeline) ? undefined : 'Choose the closest one.'),
  name: (d) => (d.name.length === 0 ? 'We’d like to know what to call you.' : d.name.length > LIMITS.name ? 'That name is a bit long.' : undefined),
  email: (d) => (!EMAIL.test(d.email) || d.email.length > LIMITS.email ? 'That doesn’t look like an email address.' : undefined),
  organisation: (d) => (d.organisation.length > LIMITS.organisation ? 'That is a bit long.' : undefined),
};

/** Checks only the given fields (one step of the survey, or all of them). */
export function validateFields(draft: Draft, fields: readonly Field[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of fields) {
    const message = validators[field](draft);
    if (message) errors[field] = message;
  }
  return errors;
}

export const ALL_FIELDS: readonly Field[] = STEP_FIELDS.flat();

export type Checked = { ok: true; value: Draft } | { ok: false; errors: FieldErrors };

export function checkEnquiry(input: unknown): Checked {
  const value = normalizeDraft(input);
  const errors = validateFields(value, ALL_FIELDS);
  return Object.keys(errors).length === 0 ? { ok: true, value } : { ok: false, errors };
}

/**
 * True when a submission looks like a script rather than a person: the hidden field
 * a person never sees was filled in, or the form was sent faster than anyone could
 * read it. These are answered as if they had worked, so a bot learns nothing.
 */
export function looksAutomated(trap: unknown, startedAt: unknown, now: number): boolean {
  if (typeof trap === 'string' && trap.trim() !== '') return true;
  if (typeof startedAt !== 'number' || !Number.isFinite(startedAt)) return true;
  return now - startedAt < MIN_FILL_MS;
}

export function composeMessage(enquiry: Draft): { subject: string; text: string } {
  const who = enquiry.organisation ? `${enquiry.name}, ${enquiry.organisation}` : enquiry.name;
  const subject = `New enquiry from ${who}`.replace(/\s+/g, ' ').slice(0, 150);
  const text = [
    'A new enquiry came in through the contact survey.',
    '',
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Organisation: ${enquiry.organisation || '(not given)'}`,
    `Interested in: ${enquiry.services.join(', ')}`,
    `How soon: ${enquiry.timeline}`,
    '',
    'What takes too long today:',
    enquiry.challenge,
    '',
    '— Sent from the contact survey on the website. Reply to this message to answer the visitor.',
  ].join('\n');
  return { subject, text };
}

export type MailConfig = { apiKey: string; from: string; to: string; endpoint?: string };

export const MAIL_ENDPOINT = 'https://api.resend.com/emails';

/** Hands an enquiry to the email service. Replies go straight to the visitor. */
export async function sendEnquiry(
  enquiry: Draft,
  config: MailConfig,
  send: typeof fetch = fetch,
): Promise<{ ok: true } | { ok: false; status: number }> {
  const { subject, text } = composeMessage(enquiry);
  const response = await send(config.endpoint ?? MAIL_ENDPOINT, {
    method: 'POST',
    headers: { authorization: `Bearer ${config.apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: config.from, to: [config.to], reply_to: enquiry.email, subject, text }),
  });
  return response.ok ? { ok: true } : { ok: false, status: response.status };
}
