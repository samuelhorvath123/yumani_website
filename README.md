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
- Design tokens and responsive styles: `app/globals.css`
- Page metadata: `app/layout.tsx`
- Brand and design context: `PRODUCT.md` and `DESIGN.md`

Contact actions open the visitor's email app addressed to samuel.horvath@yumaniautomation.com. There is no form backend, visitor tracking, or invented customer proof. The Sites deployment is private for review; public access and a custom domain can be configured separately.
