export default function handler(req, res) {
  const configured = {
    GOOGLE_BACKEND_CLIENT_ID: Boolean(process.env.GOOGLE_BACKEND_CLIENT_ID),
    GOOGLE_BACKEND_CLIENT_SECRET: Boolean(process.env.GOOGLE_BACKEND_CLIENT_SECRET),
    GOOGLE_BACKEND_REFRESH_TOKEN: Boolean(process.env.GOOGLE_BACKEND_REFRESH_TOKEN),
    GOOGLE_INVENTORY_SHEET_ID: Boolean(process.env.GOOGLE_INVENTORY_SHEET_ID),
    GOOGLE_DRIVE_ROOT_FOLDER_ID: Boolean(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID),
    GOOGLE_LOGIN_CLIENT_ID: Boolean(process.env.GOOGLE_LOGIN_CLIENT_ID),
    ADMIN_GOOGLE_EMAIL: Boolean(process.env.ADMIN_GOOGLE_EMAIL)
  };

  const googleDataReady =
    configured.GOOGLE_BACKEND_CLIENT_ID &&
    configured.GOOGLE_BACKEND_CLIENT_SECRET &&
    configured.GOOGLE_BACKEND_REFRESH_TOKEN &&
    configured.GOOGLE_INVENTORY_SHEET_ID &&
    configured.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  res.status(200).json({
    hosting: 'vercel',
    dataStore: 'google-sheets',
    fileStore: 'google-drive',
    googleDataReady,
    googleLoginReady: configured.GOOGLE_LOGIN_CLIENT_ID,
    configured
  });
}
