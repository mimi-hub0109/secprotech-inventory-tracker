export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    app: "SECproTECH Inventory Tracker",
    storage: {
      products: "Google Sheets",
      files: "Google Drive"
    },
    timestamp: new Date().toISOString()
  });
}
