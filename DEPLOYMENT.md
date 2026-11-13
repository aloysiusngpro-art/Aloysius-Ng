# Aloysius Ng Homes — deployment

Source snapshot: version 163, commit 4cbd87c16ef07b671a0754bf069397b1d0d905f4.

## Current hosting

ChatGPT Sites manages deployment to Cloudflare Workers. `web/` contains the pages and static assets, `worker/index.mjs` handles requests, login and APIs, and `node scripts/build-protected-site.mjs` combines them into `dist/server/index.js`. The `.openai/hosting.json` manifest identifies the Sites project and requests an R2 binding named `BUCKET`. Publishing a saved Sites version deploys the compiled Worker. The live custom domain is https://aloysiusnghomes.com.

## Deploy a separate copy on your own Cloudflare account

1. Extract the ZIP. Run `node scripts/build-protected-site.mjs` from the extracted project folder.
2. Create a private R2 bucket. Create `wrangler.toml` in the project folder:

   ```toml
   name = "aloysius-ng-homes"
   main = "dist/server/index.js"
   compatibility_date = "2026-11-13"

   [[r2_buckets]]
   binding = "BUCKET"
   bucket_name = "REPLACE_WITH_YOUR_R2_BUCKET_NAME"
   ```

3. Authenticate Wrangler (`npx wrangler login`) and deploy (`npx wrangler deploy`). Configure three secrets with `npx wrangler secret put NAME`, one at a time:
   - `ANH_PASSWORD_SALT`: a fresh random salt as text.
   - `ANH_PASSWORD_HASH`: lowercase hex PBKDF2-HMAC-SHA256 of your chosen password, using the UTF-8 bytes of the salt, 100,000 iterations and 32 output bytes. Generate it locally; don't put the plaintext password into your project or command history.
   - `ANH_SESSION_SECRET`: a fresh, independent high-entropy random secret for signing sessions.
4. Test login and saving on the new Worker URL. Attach a custom domain only after testing; changing the existing domain would be a separate cutover.

This is a code export, not a live-data backup. Saved scorecards, profiles, preferences and property searches in the current R2 bucket, as well as deployed secrets and custom-domain settings, are separate. A new R2 bucket starts empty. The `.openai/hosting.json` project ID is for Sites hosting; Wrangler uses `wrangler.toml` instead. No live PropertyGuru feed is connected.

References: https://developers.cloudflare.com/r2/api/workers/workers-api-usage/ and https://developers.cloudflare.com/workers/configuration/routing/custom-domains/.
