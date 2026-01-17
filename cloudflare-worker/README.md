Cloudflare Worker for Daily Summaries

This worker exposes minimal Daily Summary endpoints and uses MongoDB Atlas Data API.

Required secrets (set via Cloudflare Dashboard or `wrangler secret put`):
- MONGODB_DATA_API_URL (e.g. https://data.mongodb-api.com/app/<APP_ID>/endpoint/data/v1)
- MONGODB_DATA_API_KEY (Data API key)
- MONGO_DB_NAME
- MONGO_DATA_SOURCE

Deploy locally with:
1. Install wrangler: `npm i -g wrangler` (or use `npx wrangler`)
2. Set secrets:
   npx wrangler secret put MONGODB_DATA_API_KEY
   npx wrangler secret put MONGO_DB_NAME
   npx wrangler secret put MONGO_DATA_SOURCE
3. Deploy:
   npx wrangler deploy

Notes:
- This Worker uses the MongoDB Data API; enable it in MongoDB Atlas (App Services → Data API) and create an API key.
- Do NOT store secrets in the repository. Use Cloudflare Secrets or environment via wrangler.
- The Worker implements:
  - GET /api/summaries
  - GET /api/summaries/weekly
  - GET /api/summaries/:date
  - POST /api/summaries/generate
  - POST /api/summaries/generate/:date
  - DELETE /api/summaries/cleanup

Security:
- Rotate Cloudinary secret (it appears in the Backend .env) — consider revoking and creating a new key.
