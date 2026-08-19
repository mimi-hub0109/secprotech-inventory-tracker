const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export function getGoogleConfig() {
  return {
    clientId: process.env.GOOGLE_BACKEND_CLIENT_ID,
    clientSecret: process.env.GOOGLE_BACKEND_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_BACKEND_REFRESH_TOKEN,
    spreadsheetId: process.env.GOOGLE_INVENTORY_SHEET_ID,
    driveRootFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
  };
}

export function assertGoogleConfig() {
  const cfg = getGoogleConfig();
  const missing = Object.entries(cfg)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    const err = new Error(`Google backend is not configured: ${missing.join(', ')}`);
    err.code = 'GOOGLE_NOT_CONFIGURED';
    throw err;
  }
  return cfg;
}

export async function getGoogleAccessToken() {
  const cfg = assertGoogleConfig();
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    refresh_token: cfg.refreshToken,
    grant_type: 'refresh_token'
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    const err = new Error(data.error_description || data.error || 'Could not refresh Google access token.');
    err.code = 'GOOGLE_AUTH_FAILED';
    throw err;
  }

  return data.access_token;
}

export async function googleFetch(url, options = {}) {
  const token = await getGoogleAccessToken();
  const headers = new Headers(options.headers || {});
  headers.set('authorization', `Bearer ${token}`);
  if (options.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data?.error?.message || data?.error_description || `Google API request failed (${response.status}).`;
    const err = new Error(message);
    err.status = response.status;
    err.google = data;
    throw err;
  }

  return data;
}

export async function getSpreadsheetMetadata() {
  const { spreadsheetId } = assertGoogleConfig();
  const fields = encodeURIComponent('spreadsheetId,properties(title),sheets(properties(sheetId,title,index,gridProperties))');
  return googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=${fields}`);
}

export async function getDriveRootMetadata() {
  const { driveRootFolderId } = assertGoogleConfig();
  const fields = encodeURIComponent('id,name,mimeType,parents');
  return googleFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(driveRootFolderId)}?fields=${fields}&supportsAllDrives=true`);
}

export async function getSheetValues(range) {
  const { spreadsheetId } = assertGoogleConfig();
  return googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?majorDimension=ROWS`);
}

export async function updateSheetValues(range, values) {
  const { spreadsheetId } = assertGoogleConfig();
  return googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    body: JSON.stringify({ range, majorDimension: 'ROWS', values })
  });
}
