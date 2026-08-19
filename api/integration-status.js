export default function handler(req, res) {
  const required = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
    "GOOGLE_INVENTORY_SHEET_ID",
    "GOOGLE_DRIVE_ROOT_FOLDER_ID"
  ];

  const configured = Object.fromEntries(
    required.map((key) => [key, Boolean(process.env[key])])
  );

  res.status(200).json({
    googleAuthReady: configured.GOOGLE_CLIENT_ID && configured.GOOGLE_CLIENT_SECRET,
    sheetsReady:
      configured.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      configured.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      configured.GOOGLE_INVENTORY_SHEET_ID,
    driveReady:
      configured.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      configured.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      configured.GOOGLE_DRIVE_ROOT_FOLDER_ID,
    configured
  });
}
