# Production Checklist

Use the deployed `j945935cy/english-daily-sentence` project as the deployment reference, but keep iPAS AI Daily on separate production resources.

## Copy From English Daily Sentence

- Vercel project settings pattern: framework, install command, build command, and output defaults.
- Environment variable names and where they are configured.
- PostgreSQL provider setup pattern.
- SMTP setup pattern for daily mail.
- Vercel cron setup pattern for `/api/cron/daily-mail`.
- Manual smoke-test flow: register, log in, subscribe to daily mail, send a test mail from admin.

## Create New For iPAS AI Daily

- New Vercel project connected to `j945935cy/ipas-ai-daily`.
- New production PostgreSQL database.
- New `DATABASE_URL` for the iPAS database.
- New `AUTH_SECRET`.
- New `CRON_SECRET`.
- SMTP credentials for daily mail.
- New first admin user created by registering the first account on the iPAS site.

Do not reuse the English Daily Sentence production database or secrets. Sharing them can mix users, sessions, subscriptions, and course data between the two apps.

## Vercel Environment Variables

Set these in the iPAS AI Daily Vercel project:

```text
DATABASE_URL
AUTH_SECRET
CRON_SECRET
DAILY_EMAIL_URL
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
```

Generate secrets:

```bash
openssl rand -base64 32
```

## Database Initialization

After setting `DATABASE_URL` for the production database, initialize schema and seed iPAS content:

```bash
npm run db:push
npm run seed:365
```

Expected seed coverage:

- `ipas-daily`: Daily Focus
- `ipas-foundations`: Foundations
- `ipas-governance`: Data & Governance
- `ipas-cases`: Use Cases
- `ipas-qa`: Q&A Drill

## Deploy

1. Connect Vercel to `j945935cy/ipas-ai-daily`.
2. Confirm the build command is `npm run build`.
3. Add the environment variables above.
4. Deploy from `main`.
5. Confirm `vercel.json` includes the daily cron for `/api/cron/daily-mail`.

## Smoke Test

- Open `/`.
- Open `/daily`, `/foundations`, `/governance`, `/cases`, and `/qa`.
- Register the first account and confirm it becomes admin.
- Log out and log in again.
- Subscribe to at least one daily mail category.
- Open `/admin`.
- Create or update one daily lesson.
- Open each history page.
- From `/admin`, send a daily mail test.
- Confirm the subscribed mailbox receives today's content.
- Confirm `/api/cron/daily-mail` rejects unauthorized requests if `CRON_SECRET` is set.

## Current App-Specific Notes

- Session cookie name is `ipas_ai_daily_session`.
- The app can show fallback lessons when the database is unavailable, but production should still use a persistent PostgreSQL database.
- The first registered user becomes admin, so create the owner account before sharing the production URL.
