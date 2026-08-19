import { getDriveRootMetadata, getSpreadsheetMetadata } from '../lib/google.js';

function isSetupAuthorized(req) {
  const expected = process.env.SETUP_TEST_KEY;
  const received = req.headers['x-setup-key'];
  return Boolean(expected && received && received === expected);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Until Google user login/session validation is added, real Google metadata
  // is only exposed through an explicit setup key kept in Vercel.
  if (!isSetupAuthorized(req)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const action = String(req.body?.action || 'connection-test').toLowerCase();

  try {
    if (action === 'connection-test' || action === 'bootstrap') {
      const [spreadsheet, driveRoot] = await Promise.all([
        getSpreadsheetMetadata(),
        getDriveRootMetadata()
      ]);

      return res.status(200).json({
        ok: true,
        hosting: 'vercel',
        spreadsheet: {
          id: spreadsheet.spreadsheetId,
          title: spreadsheet.properties?.title,
          sheets: (spreadsheet.sheets || []).map((entry) => ({
            id: entry.properties?.sheetId,
            title: entry.properties?.title,
            index: entry.properties?.index,
            rows: entry.properties?.gridProperties?.rowCount,
            columns: entry.properties?.gridProperties?.columnCount
          }))
        },
        driveRoot
      });
    }

    return res.status(400).json({ ok: false, error: `Unknown action: ${action}` });
  } catch (error) {
    const status = error.code === 'GOOGLE_NOT_CONFIGURED' ? 503 : 502;
    return res.status(status).json({
      ok: false,
      error: error.message || 'Google API request failed.',
      code: error.code || null
    });
  }
}
