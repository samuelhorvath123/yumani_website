'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
// faq.css is imported by page.tsx, for the same reason as services.css: CSS imported
// here, in a client module, would be fetched again when this chunk loads, on top of
// the copy already inlined in the page.

// Every answer restates something the page already promises. There is no price, no
// timeline and no result in them that the rest of the page does not already stand
// behind, because there is nothing else we could honestly claim yet.
const faqs: { id: string; question: string; answer: ReactNode }[] = [
  {
    id: 'time',
    question: 'How long does a project take?',
    answer: <p>Real work takes weeks, and we won’t pretend otherwise. We build in short rounds, with working software to try every few weeks, so you see progress long before the end. After we’ve listened, you get an estimate you can plan around.</p>,
  },
  {
    id: 'cost',
    question: 'What will it cost?',
    answer: <p>It depends on the work, so we don’t publish a price list. After we’ve listened you get an estimate you can plan around, with nothing hidden in the fine print. We are not the cheapest, and we would rather tell you that now than surprise you later.</p>,
  },
  {
    id: 'replace',
    question: 'Do we have to replace what we already use?',
    answer: <p>Not unless it has to be. We connect the systems you already have, so data moves between them without anyone retyping it, and we build something new only where nothing existing fits.</p>,
  },
  {
    id: 'involved',
    question: 'What do you need from us?',
    answer: <p>Someone who knows how the work really runs, for about an hour a week. They talk us through the work at the start, try each round as we build, and tell us what’s off. That is what keeps what we build close to the real thing.</p>,
  },
  {
    id: 'after',
    question: 'What happens after launch?',
    answer: <p>We stay close. The people who built it look after it, for fixes, questions and the next improvement, and we help your team get comfortable with it first.</p>,
  },
  {
    id: 'start',
    question: 'How do we get started?',
    answer: <p>Tell us what you have in mind in <a className="faq-link" href="/contact">the short survey</a>: four questions that go straight to the team, so there is nothing to write from scratch. Prefer to write? Email <a className="faq-link" href="mailto:info@yumaniautomation.com">info@yumaniautomation.com</a>.</p>,
  },
];

type FaqId = (typeof faqs)[number]['id'];

// The same single-open disclosure as the services list: closed panels stay mounted
// but inert, so the height can animate and search engines still read them.
export default function Faq() {
  const [open, setOpen] = useState<FaqId | null>('time');
  const listRef = useRef<HTMLDivElement>(null);

  // Arrow keys, Home and End move between the headers.
  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const triggers = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('.faq-trigger') ?? []);
    const index = triggers.indexOf(event.currentTarget);
    const last = triggers.length - 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? last : event.key === 'ArrowDown' ? (index === last ? 0 : index + 1) : (index === 0 ? last : index - 1);
    event.preventDefault();
    triggers[next]?.focus();
  };

  return (
    <div className="faq-list" ref={listRef}>
      {faqs.map(({ id, question, answer }) => {
        const expanded = open === id;
        return (
          <div key={id} className="faq-item" data-reveal="">
            <h3 className="faq-heading-row">
              <button
                type="button"
                className="faq-trigger"
                id={`faq-trigger-${id}`}
                aria-expanded={expanded}
                aria-controls={`faq-panel-${id}`}
                onClick={() => setOpen(expanded ? null : id)}
                onKeyDown={moveFocus}
              >
                <span className="faq-question">{question}</span>
                <span className="faq-toggle" aria-hidden="true"><span/><span/></span>
              </button>
            </h3>
            <section className="faq-panel" id={`faq-panel-${id}`} aria-labelledby={`faq-trigger-${id}`} data-open={expanded} inert={!expanded}>
              <div className="faq-panel-clip">
                <div className="faq-answer">{answer}</div>
              </div>
            </section>
          </div>
        );
      })}
    </div>
  );
}
