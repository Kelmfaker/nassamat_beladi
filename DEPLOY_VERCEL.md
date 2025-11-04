# Deploying to Vercel — quick checklist

This project uses a serverless handler under `api/index.js` (Vercel auto-detection).

Required environment variables (set these in the Vercel dashboard -> Project -> Settings -> Environment Variables):

- `MONGO_URI` — your MongoDB connection string (required for most endpoints).
- `DB_NAME` — optional (defaults to `nassamatbeladi`).
- Any other secrets your app uses (JWT secret, SMTP creds, etc.).

Notes:
- A lightweight health check is available at `GET /_health` and does not require a DB connection.
- If you want to use a custom build or route configuration via `vercel.json`, keep `builds`/`routes` in the file. Otherwise, remove them so Vercel Project Settings apply (this repo currently relies on auto-detection).

Troubleshooting:
- 404 on functions: ensure `api/index.js` exists at the project root and that Vercel has finished a fresh deploy after your last push.
- 500 on function invocation: check the Function logs in Vercel — most common cause is missing `MONGO_URI` or network restrictions to your DB.
