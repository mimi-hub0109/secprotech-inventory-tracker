# Google Sheets + Drive backend setup

This project uses the existing Google Sheet and Google Drive folder through a small Google Apps Script web app. This keeps the data in Google and lets the Vercel app access it without exposing Google credentials to employees or the browser.

## Why Apps Script instead of a service account for Drive

For a normal My Drive folder, a service account is not the right owner for generated files. Apps Script can run as the Google account that owns the Sheet/Drive content, which is a better fit for reports, quotations, invoices and photos stored in My Drive.

## 1. Create the Apps Script project

Open the live inventory spreadsheet, then choose **Extensions -> Apps Script**.

Copy the contents of `google-apps-script/Bridge.gs` into the Apps Script project and save.

## 2. Add Script Properties

In Apps Script, open **Project Settings -> Script Properties** and add:

- `INVENTORY_SHEET_ID` = the spreadsheet ID
- `DRIVE_ROOT_FOLDER_ID` = the Drive root folder ID
- `BACKEND_SHARED_SECRET` = a long random secret (32+ characters)

Do not commit the shared secret to GitHub.

## 3. Deploy the Apps Script bridge

Choose **Deploy -> New deployment -> Web app**.

Use:

- Execute as: **Me**
- Who has access: **Anyone**

Deploy and copy the `/exec` web app URL.

The bridge verifies an HMAC signature on every data request, so the public Apps Script URL is not enough to access inventory data.

## 4. Add Vercel environment variables

In the Vercel project, add:

- `APPS_SCRIPT_WEB_APP_URL` = the Apps Script `/exec` URL
- `APPS_SCRIPT_SHARED_SECRET` = the same value used for `BACKEND_SHARED_SECRET`

Add them to Production and Preview environments.

Redeploy after saving environment variables.

## 5. Test

Open:

`/api/integration-status`

It should report `dataBridgeReady: true`.

Then POST this JSON to `/api/data`:

```json
{"action":"health"}
```

A successful response includes the spreadsheet name, Drive root folder name, and number of sheets.

## Next phase

After the bridge passes the health test, the frontend will be changed from sample data to the original workbook structure for Scan, Logsheet, Product Inventory, model Database, reports and quotations.
