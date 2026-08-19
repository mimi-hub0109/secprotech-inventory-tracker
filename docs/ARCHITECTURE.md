# Architecture

Browser/PWA -> Vercel static app -> Vercel `/api/*` functions -> Google APIs

## Google Sheets

Keep the recognizable structure of the original Inventory workbook. Physical-stock sheets use the original category and area organization. A model-level catalog is separate from serialized stock.

## Google Drive

Suggested root structure:

- PRODUCT PHOTOS/
- REPORTS/
  - INVENTORY REPORTS/
  - SOLD & RETURNS/
  - INVOICES/
- QUOTATIONS/
  - <creator name>/
- BACKUPS/

## Security rules

- Never expose service-account keys or OAuth client secrets in browser JavaScript.
- Browser writes must go through authenticated Vercel functions.
- Employee permissions are checked server-side for protected operations.
- Destructive/stock-changing operations should be logged and support the planned 7-second undo where safe.
