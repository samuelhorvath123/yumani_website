'use client';

import { useEffect } from 'react';
import { watchProcess } from '@/lib/process-watch';

// Renders nothing: it marks the steps of How we work as the reader reaches them, so the
// page can answer each one (see lib/process-steps.ts and app/approach.css). Without it the
// section is complete and still.
export default function ProcessSteps() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.process');
    return root ? watchProcess(root) : undefined;
  }, []);
  return null;
}
