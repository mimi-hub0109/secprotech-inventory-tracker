export default function handler(req, res) {
  const configured = {
    APPS_SCRIPT_WEB_APP_URL: Boolean(process.env.APPS_SCRIPT_WEB_APP_URL),
    APPS_SCRIPT_SHARED_SECRET: Boolean(process.env.APPS_SCRIPT_SHARED_SECRET),
    GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    ADMIN_GOOGLE_EMAIL: Boolean(process.env.ADMIN_GOOGLE_EMAIL)
  };

  res.status(200).json({
    dataBridgeReady:
      configured.APPS_SCRIPT_WEB_APP_URL &&
      configured.APPS_SCRIPT_SHARED_SECRET,
    googleAuthReady:
      configured.GOOGLE_CLIENT_ID && configured.GOOGLE_CLIENT_SECRET,
    configured
  });
}
