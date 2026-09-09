'use client';

import { Code2, Workflow, PanelsTopLeft, Puzzle } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const services = [
  { id: 'software', number: '01', title: 'Custom software', icon: Code2, description: 'Your work is unique. Your software should be too. We build reliable applications around your processes, your people, and the way you want to grow.', examples: ['Web applications', 'Internal tools', 'Customer portals'] },
  { id: 'automation', number: '02', title: 'Task automation', icon: Workflow, description: 'Less copying, checking, and chasing. We connect the steps in your everyday workflows, so repetitive tasks move forward without taking up your team’s day.', examples: ['Document processing', 'Reporting', 'Connected workflows'] },
  { id: 'systems', number: '03', title: 'Information systems', icon: PanelsTopLeft, description: 'Bring scattered information into focus. We build systems that make records, workflows, and reporting easier to manage, for the people who rely on them every day.', examples: ['Records & data', 'Approval workflows', 'Operational systems'] },
  { id: 'solutions', number: '04', title: 'Tailored solutions', icon: Puzzle, description: 'The hardest problems rarely fit into a neat category. We look at the whole picture, connect the right pieces, and build a solution around what your organisation actually needs.', examples: ['System integrations', 'Complex processes', 'Your next challenge'] },
];

export default function Services() {
  return <Accordion defaultValue={['software']} className="service-list">
    {services.map(({ id, number, title, icon: Icon, description, examples }) => <AccordionItem key={id} value={id} className="service-item">
      <AccordionTrigger className="service-trigger"><span className="service-number">{number}</span><Icon className="service-icon" size={23} strokeWidth={1.5}/><span className="service-title">{title}</span></AccordionTrigger>
      <AccordionContent className="service-content"><p>{description}</p><ul className="service-tags">{examples.map(example => <li key={example}>{example}</li>)}</ul></AccordionContent>
    </AccordionItem>)}
  </Accordion>;
}
