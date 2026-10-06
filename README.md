# Yumani Automation

An English landing page for yumani automation s.r.o., built with React, TypeScript, Vinext, and the Sites starter. It includes responsive layouts, accessible service disclosures, reduced-motion support, local fonts, and original blue ribbon artwork.

## Local development

Use Node.js 22.13 or later.

```sh
npm install
npm run dev
```

Open the Local URL printed by the development server.

```sh
npm run build
npx tsc --noEmit
```

## Content

- Page content and email links: `app/page.tsx`
- Services: `app/services.tsx`
- Approach steps, the good-fit / not-a-fit rows and the audience: `app/page.tsx`. Questions and answers: `app/faq.tsx`. Their styles: `app/approach.css` and `app/faq.css`. Keep every answer to what the page already promises: no prices, timelines or results that are not already stated elsewhere on it.
- Design tokens and responsive styles: `app/globals.css`
- Page metadata: `app/layout.tsx`
- Brand and design context: `PRODUCT.md` and `DESIGN.md`
- Legal pages: `app/privacy/page.tsx`, `app/cookies/page.tsx` and `app/terms/page.tsx`, on the shared shell in `app/legal-page.tsx`. Company details and the "last updated" date are in `lib/company.ts`; update both whenever the wording changes in substance.
- Cookie banner: `app/cookie-consent.tsx`, with its logic in `lib/consent.ts`. The site sets one first-party cookie, `yumani_consent`. Before adding any optional tool (analytics, embeds), gate it on the stored choice, list its cookies in the Cookie Policy, and bump `CONSENT_VERSION` so visitors are asked again.

Every contact button leads to the survey at `/contact`: four short questions that are checked in the browser and again on the server (`app/api/contact/route.ts`, logic in `lib/contact.ts`), then emailed to info@yumaniautomation.com. Nothing is stored; the answers exist in the request and in the email. There is no visitor tracking or invented customer proof.

### Making the survey deliver

The route sends through the Resend email API and needs two secrets. Without them it answers "unavailable" and the survey tells the visitor to email instead, so it fails honestly, never silently.

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | A key from a Resend account (secret). |
| `CONTACT_FROM` | A sender on a domain verified in Resend, for example `Yumani website <website@yumaniautomation.com>`. |
| `CONTACT_TO` | Optional. Where enquiries go; defaults to info@yumaniautomation.com. |

Set them as secrets or environment variables in the hosting dashboard. For local testing put them in `.dev.vars` (ignored by git). Verify the sending domain in Resend first, or every message is refused. If a bot problem ever appears, add a rate-limiting rule for `/api/contact` at the host: the route already ignores scripts that fill the hidden field or send too fast, but it cannot count requests by itself. The Sites deployment is private for review; public access and a custom domain can be configured separately.
