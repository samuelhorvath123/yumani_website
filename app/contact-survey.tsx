'use client';

import { useEffect, useId, useRef, useState, type SyntheticEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import {
  LIMITS,
  SERVICES,
  STEP_FIELDS,
  TIMELINES,
  emptyDraft,
  normalizeDraft,
  validateFields,
  type Draft,
  type Field,
  type FieldErrors,
} from '@/lib/contact';
// contact.css is imported by the contact page: CSS imported here, in a client
// module, would be fetched again as a stylesheet when this chunk loads, on top of
// the copy already inlined in the page.

const email = 'info@yumaniautomation.com';

// One question to a screen. The first asks for the least effort and the last asks
// for the most, so the visitor is already well on the way when it counts.
const steps = [
  { title: 'What would you like help with?', hint: 'Pick everything that applies.' },
  { title: 'What takes too long today?', hint: 'The copying, the checking, the chasing. A sentence or two is plenty.' },
  { title: 'How soon would you like to start?', hint: 'An honest answer helps us say whether we can.' },
  { title: 'Who should we reply to?', hint: 'We use these details only to answer you.' },
] as const;

type Status = 'editing' | 'sending' | 'sent' | 'failed';

export default function ContactSurvey() {
  const id = useId();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('editing');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const trapRef = useRef<HTMLInputElement>(null);
  const startedAt = useRef(0);
  const moved = useRef(false);

  // When the form was opened, so a submission far quicker than a person could read
  // it can be told apart from one by a script.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Moving on moves focus to the new question, so a keyboard or screen reader
  // user lands where the page now is. Not on first load, which would steal focus.
  useEffect(() => {
    if (!moved.current) {
      moved.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step, status]);

  const set = <K extends Field>(field: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const focusFirstError = (found: FieldErrors) => {
    const first = (Object.keys(found) as Field[])[0];
    if (first) requestAnimationFrame(() => document.getElementById(`${id}-${first}`)?.focus());
  };

  const last = step === steps.length - 1;

  const next = () => {
    const found = validateFields(normalizeDraft(draft), STEP_FIELDS[step]);
    setErrors(found);
    if (Object.keys(found).length > 0) return focusFirstError(found);
    setStep((current) => current + 1);
  };

  const submit = async () => {
    const value = normalizeDraft(draft);
    const found = validateFields(value, STEP_FIELDS[step]);
    setErrors(found);
    if (Object.keys(found).length > 0) return focusFirstError(found);
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...value, website: trapRef.current?.value ?? '', startedAt: startedAt.current }),
      });
      if (response.ok) return setStatus('sent');
      if (response.status === 422) {
        // The server disagreed with the browser: show where, on the step it belongs to.
        const body = (await response.json().catch(() => ({}))) as { errors?: FieldErrors };
        const serverErrors = body.errors ?? {};
        const fields = Object.keys(serverErrors) as Field[];
        if (fields.length > 0) {
          setErrors(serverErrors);
          setStep(STEP_FIELDS.findIndex((group) => group.includes(fields[0])));
          setStatus('editing');
          return;
        }
      }
      setStatus('failed');
    } catch {
      setStatus('failed');
    }
  };

  const onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    if (last) void submit();
    else next();
  };

  if (status === 'sent') {
    return <div className="survey" aria-live="polite">
      <h2 className="survey-title" ref={headingRef} tabIndex={-1}>Thank you.</h2>
      <p className="survey-hint">Your answers are with us. We will reply to {draft.email.trim()} with honest next steps, even if the answer is that you do not need us.</p>
      {/* A plain anchor on purpose: the site navigates with native anchors. */}
      <a className="text-link survey-done" href="/">Back to the site <ArrowUpRight size={16} aria-hidden="true"/></a>
    </div>;
  }

  const fieldProps = (field: Field) => ({
    id: `${id}-${field}`,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${id}-${field}-error` : undefined,
  });
  const error = (field: Field) => errors[field]
    ? <p className="survey-error" id={`${id}-${field}-error`}>{errors[field]}</p>
    : null;
  const titleId = `${id}-title`;
  const hintId = `${id}-hint`;

  return <form className="survey" onSubmit={onSubmit} noValidate aria-labelledby={titleId}>
    <div className="survey-progress">
      <p>Step {step + 1} of {steps.length}</p>
      <ol aria-hidden="true">{steps.map((item, index) => <li key={item.title} data-state={index < step ? 'done' : index === step ? 'current' : 'todo'}/>)}</ol>
    </div>
    <h2 className="survey-title" id={titleId} ref={headingRef} tabIndex={-1}>{steps[step].title}</h2>
    <p className="survey-hint" id={hintId}>{steps[step].hint}</p>

    {/* Every question stays mounted, so nothing typed is lost on the way back. */}
    <div hidden={step !== 0}>
      <fieldset className="survey-choices" data-invalid={errors.services ? '' : undefined} aria-labelledby={titleId} aria-describedby={hintId}>
        {SERVICES.map((service, index) => <label className="survey-choice" key={service}>
          <input type="checkbox" {...(index === 0 ? fieldProps('services') : {})} checked={draft.services.includes(service)} onChange={(event) => set('services', event.target.checked ? [...draft.services, service] : draft.services.filter((item) => item !== service))}/>
          <span>{service}</span>
          <Check size={18} aria-hidden="true"/>
        </label>)}
      </fieldset>
      {error('services')}
    </div>

    <div hidden={step !== 1}>
      <textarea className="survey-input" {...fieldProps('challenge')} aria-describedby={errors.challenge ? `${hintId} ${id}-challenge-error` : hintId} aria-labelledby={titleId} rows={7} maxLength={LIMITS.challenge + 200} value={draft.challenge} onChange={(event) => set('challenge', event.target.value)} placeholder="Every Monday, someone copies the week’s orders from email into a spreadsheet…"/>
      {error('challenge')}
    </div>

    <div hidden={step !== 2}>
      <fieldset className="survey-choices" data-invalid={errors.timeline ? '' : undefined} aria-labelledby={titleId} aria-describedby={hintId}>
        {TIMELINES.map((timeline, index) => <label className="survey-choice" key={timeline}>
          <input type="radio" name={`${id}-timeline`} {...(index === 0 ? fieldProps('timeline') : {})} checked={draft.timeline === timeline} onChange={() => set('timeline', timeline)}/>
          <span>{timeline}</span>
          <Check size={18} aria-hidden="true"/>
        </label>)}
      </fieldset>
      {error('timeline')}
    </div>

    <div hidden={step !== 3}>
      <div className="survey-field">
        <label htmlFor={`${id}-name`}>Your name</label>
        <input className="survey-input" type="text" autoComplete="name" maxLength={LIMITS.name + 40} {...fieldProps('name')} value={draft.name} onChange={(event) => set('name', event.target.value)}/>
        {error('name')}
      </div>
      <div className="survey-field">
        <label htmlFor={`${id}-email`}>Your email</label>
        <input className="survey-input" type="email" inputMode="email" autoComplete="email" maxLength={LIMITS.email + 40} {...fieldProps('email')} value={draft.email} onChange={(event) => set('email', event.target.value)}/>
        {error('email')}
      </div>
      <div className="survey-field">
        <label htmlFor={`${id}-organisation`}>Your organisation <span>(optional)</span></label>
        <input className="survey-input" type="text" autoComplete="organization" maxLength={LIMITS.organisation + 40} {...fieldProps('organisation')} value={draft.organisation} onChange={(event) => set('organisation', event.target.value)}/>
        {error('organisation')}
      </div>
      {/* People never see this field. A script that fills in every box does. */}
      <div className="survey-trap" aria-hidden="true">
        <label>Leave this empty <input type="text" name="website" tabIndex={-1} autoComplete="off" ref={trapRef}/></label>
      </div>
      <p className="survey-note">Sending this asks for nothing more than a reply. See how we handle your details in the <a href="/privacy">Privacy Policy</a>.</p>
    </div>

    {status === 'failed'
      ? <p className="survey-error survey-failed" role="alert">That did not go through. Your answers are still here, so you can try again, or write to us at <a href={`mailto:${email}`}>{email}</a>.</p>
      : null}

    <div className="survey-actions">
      {step > 0 ? <button type="button" className="text-link survey-back" onClick={() => { setStatus('editing'); setStep(step - 1); }}><ArrowLeft size={16} aria-hidden="true"/> Back</button> : <span/>}
      <button type="submit" className="primary-link" disabled={status === 'sending'}>
        {last ? (status === 'sending' ? 'Sending…' : status === 'failed' ? 'Try again' : 'Send it') : 'Next'}
        {last ? <ArrowUpRight size={18} aria-hidden="true"/> : <ArrowRight size={18} aria-hidden="true"/>}
      </button>
    </div>
  </form>;
}
