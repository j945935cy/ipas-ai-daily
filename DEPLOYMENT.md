# Deployment

## Required environment variables

Set these in the production host:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `CRON_SECRET`

Generate VAPID keys:

```powershell
npx web-push generate-vapid-keys --json
```

## Daily push schedule

`vercel.json` runs `/api/cron/daily-push` at `0 0 * * *`, which is 08:00 in Asia/Taipei.

## Mobile push test

1. Deploy the site with HTTPS.
2. Open the production URL on a phone.
3. Register or log in.
4. Tap `開啟每日推送` and allow notifications.
5. Open `/admin` as an admin and click `發送今日句子測試`.

## Database note

Production uses PostgreSQL. The app expects `DATABASE_URL` to point to a persistent Postgres database such as Prisma
Postgres, Neon, or Supabase. Run `npm run db:push` after changing the Prisma schema.
