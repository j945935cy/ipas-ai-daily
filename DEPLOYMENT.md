# Deployment

## Required Environment Variables

Set these in the production host:

- `DATABASE_URL`
- `AUTH_SECRET`
- `CRON_SECRET`
- `DAILY_EMAIL_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

## Daily Mail Schedule

`vercel.json` runs `/api/cron/daily-mail` at `0 0 * * *`, which is 08:00 in Asia/Taipei.

## Daily Mail Test

1. Deploy the site with HTTPS.
2. Open the production URL.
3. Register or log in.
4. Subscribe to a daily mail category.
5. Open `/admin` as an admin and click `寄送今日每日信測試`.
6. Confirm the subscribed mailbox receives today's iPAS AI Daily content.

## Database Note

Production uses PostgreSQL. The app expects `DATABASE_URL` to point to a persistent Postgres database such as Prisma
Postgres, Neon, or Supabase. Run `npm run db:push` after changing the Prisma schema.
