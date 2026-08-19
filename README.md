# SECproTECH Inventory Tracker

Vercel-hosted PWA based on the existing SECproTECH inventory workflow.

## Data ownership

- **Google Sheets** is the source of truth for physical inventory, model database, logs, employee access, settings and backup mirrors.
- **Google Drive** stores product photos, generated reports, invoices, quotations and backup files.
- **Vercel** hosts the web/PWA frontend and server-side API functions.
- Real Google credentials must stay in Vercel Environment Variables and must never be written into `index.html` or committed to GitHub.

## Application areas

### Inventory workspace
- Scan
- Logsheet
- Product Inventory

### Employee workspace
- Database (model-level product catalog)
- Reports
- Quotation

### Admin Settings
- Theme / UI
- Employee access
- Google integration
- Backup
- Security

## Inventory vs Database

**Product Inventory** is physical stock. It contains serials, quantities, Sheet/category and the Showroom / Office / Storage locations.

**Database** is model-level. A model can exist with no serial and can remain visible as `IN STOCK`, `OUT OF STOCK`, or `ORDER BASED`.

## Local development

Install the Vercel CLI and run:

```bash
npm i -g vercel
vercel dev
```

The current frontend is intentionally self-contained while Google integration is being wired server-side.

## Vercel deployment

The intended production flow is GitHub -> Vercel Git Integration:

1. Push this repository to GitHub.
2. Import the repository into the existing Vercel project.
3. Add the variables from `.env.example` in Vercel Project Settings -> Environment Variables.
4. Keep secrets server-side only.
5. Pushes to the production branch deploy automatically; branches/PRs create preview deployments.

## PWA / Android

The app already includes a web app manifest and service worker. The same production URL can later be wrapped as an Android Trusted Web Activity APK, so ordinary web deployments update what the Android wrapper displays without rebuilding the APK for normal UI/business-logic changes.
