# Production Checklist

Use the deployed `j945935cy/english-daily-sentence` project as the deployment reference, but keep iPAS AI Daily on separate production resources.

## Copy From English Daily Sentence

- Vercel project settings pattern: framework, install command, build command, and output defaults.
- Environment variable names and where they are configured.
- PostgreSQL provider setup pattern.
- Web Push VAPID setup flow.
- Vercel cron setup pattern for `/api/cron/daily-push`.
- Manual smoke-test flow: register, log in, open admin, subscribe to push, send a test push.

## Create New For iPAS AI Daily

- New Vercel project connected to `j945935cy/ipas-ai-daily`.
- New production PostgreSQL database.
- New `DATABASE_URL` for the iPAS database.
- New `AUTH_SECRET`.
- New `CRON_SECRET`.
- New VAPID public/private key pair.
- New `VAPID_SUBJECT`, preferably an iPAS-specific contact email.
- New first admin user created by registering the first account on the iPAS site.

Do not reuse the English Daily Sentence production database or secrets. Sharing them can mix users, sessions, push subscriptions, and course data between the two apps.

## Vercel Environment Variables

Set these in the iPAS AI Daily Vercel project:

```text
DATABASE_URL
AUTH_SECRET
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
CRON_SECRET
```

Generate secrets:

```bash
openssl rand -base64 32
```

Generate VAPID keys:

```bash
npx web-push generate-vapid-keys --json
```

## Database Initialization

After setting `DATABASE_URL` for the production database, initialize schema and seed iPAS content:

```bash
npm run db:push
npm run seed:365
```

Expected seed coverage:

- `daily-english`: Daily Focus
- `kids-english`: Foundations
- `grammar-english`: Data & Governance
- `pattern-english`: Use Cases
- `chat-english`: Q&A Drill

## Deploy

1. Connect Vercel to `j945935cy/ipas-ai-daily`.
2. Confirm the build command is `npm run build`.
3. Add the environment variables above.
4. Deploy from `main`.
5. Confirm `vercel.json` includes the daily cron for `/api/cron/daily-push`.

## Smoke Test

Run these checks on the production URL:

- Open `/`.
- Open `/daily`, `/foundations`, `/governance`, `/cases`, and `/qa`.
- Register the first account and confirm it becomes admin.
- Log out and log in again.
- Open `/admin`.
- Create or update one daily lesson.
- Open each history page.
- On a mobile browser, subscribe to daily push.
- From `/admin`, send a push test.
- Confirm `/api/cron/daily-push` rejects unauthorized requests if `CRON_SECRET` is set.

## Current App-Specific Notes

- Session cookie name is `ipas_ai_daily_session`.
- The app can show fallback lessons when the database is unavailable, but production should still use a persistent PostgreSQL database.
- The first registered user becomes admin, so create the owner account before sharing the production URL.
