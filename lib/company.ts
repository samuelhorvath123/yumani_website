// The identity Slovak law requires on a website, kept in one place for the legal
// pages and the footer. The values are the ones already published in the
// commercial register.
export const company = {
  name: 'yumani automation s. r. o.',
  street: 'Šaldova 10831/7',
  city: '831 07 Bratislava – Vajnory',
  country: 'Slovakia',
  ico: '57307253',
  register: 'Commercial Register of the Municipal Court Bratislava III, Section Sro, File No. 193404/B',
  email: 'info@yumaniautomation.com',
  site: 'yumaniautomation.com',
} as const;

// Shown at the top of each legal page. Change it whenever the wording of any of
// them changes in substance.
export const legalUpdated = { iso: '2026-10-05', label: '5 October 2026' } as const;
