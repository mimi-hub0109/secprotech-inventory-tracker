const REQUIRED_PROPERTIES = [
  'BACKEND_SHARED_SECRET',
  'INVENTORY_SHEET_ID',
  'DRIVE_ROOT_FOLDER_ID'
];

function doGet() {
  return json_({
    ok: true,
    service: 'SECproTECH Inventory Data Bridge',
    version: '0.1.0'
  });
}

function doPost(e) {
  try {
    const raw = e && e.postData ? e.postData.contents : '';
    const envelope = JSON.parse(raw || '{}');
    verifyEnvelope_(envelope);

    const payload = envelope.payload || {};
    const action = String(payload.action || 'health').toLowerCase();

    if (action === 'health') {
      return json_(health_());
    }

    if (action === 'bootstrap') {
      return json_(bootstrap_());
    }

    return json_({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return json_({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function health_() {
  const props = PropertiesService.getScriptProperties();
  const missing = REQUIRED_PROPERTIES.filter(function (key) {
    return !props.getProperty(key);
  });

  if (missing.length) {
    return { ok: false, error: 'Missing Script Properties', missing: missing };
  }

  const ss = SpreadsheetApp.openById(props.getProperty('INVENTORY_SHEET_ID'));
  const folder = DriveApp.getFolderById(props.getProperty('DRIVE_ROOT_FOLDER_ID'));

  return {
    ok: true,
    spreadsheet: ss.getName(),
    driveRoot: folder.getName(),
    sheetCount: ss.getSheets().length
  };
}

function bootstrap_() {
  const props = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.openById(props.getProperty('INVENTORY_SHEET_ID'));
  const folder = DriveApp.getFolderById(props.getProperty('DRIVE_ROOT_FOLDER_ID'));

  const sheets = ss.getSheets().map(function (sheet) {
    return {
      name: sheet.getName(),
      rows: sheet.getLastRow(),
      columns: sheet.getLastColumn()
    };
  });

  return {
    ok: true,
    spreadsheet: {
      id: ss.getId(),
      name: ss.getName(),
      sheets: sheets
    },
    driveRoot: {
      id: folder.getId(),
      name: folder.getName()
    }
  };
}

function verifyEnvelope_(envelope) {
  const props = PropertiesService.getScriptProperties();
  const secret = props.getProperty('BACKEND_SHARED_SECRET');
  if (!secret) throw new Error('BACKEND_SHARED_SECRET is not configured.');

  const ts = Number(envelope.ts || 0);
  if (!ts || Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
    throw new Error('Expired or invalid request timestamp.');
  }

  const payload = envelope.payload || {};
  const canonical = String(ts) + '.' + JSON.stringify(payload);
  const expected = hex_(Utilities.computeHmacSha256Signature(canonical, secret));
  const received = String(envelope.signature || '').toLowerCase();

  if (!received || received !== expected) {
    throw new Error('Invalid request signature.');
  }
}

function hex_(bytes) {
  return bytes.map(function (b) {
    const value = b < 0 ? b + 256 : b;
    return ('0' + value.toString(16)).slice(-2);
  }).join('');
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
