# iPAS AI Daily

iPAS AI Daily 是從 `j945935cy/english-daily-sentence` 調整而來的每日學習站，目標是把 iPAS 人工智慧應用規劃師備考內容拆成短小、可持續的每日重點。

目前保留原本的 Next.js、Prisma、會員、推播、郵件與後台架構，並先完成專案名稱、首頁、PWA manifest、SEO metadata 與預設部署網址的轉換。

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

Useful commands:

```bash
npm run lint
npm run build
npm run db:check
npm run db:push
npm run seed:local-365
```

## Local Database

The local development database uses PostgreSQL on port `5433`.

Make sure Docker Desktop or the Docker daemon is running before starting the local database. If Docker is installed but the daemon is stopped, `docker` commands will fail with `Cannot connect to the Docker daemon`.

If Docker Compose is available:

```bash
docker compose up -d
```

If only Docker is available:

```bash
npm run db:docker:up
```

If the container already exists:

```bash
npm run db:docker:start
```

Then initialize and seed the database:

```bash
npm run db:check
npm run db:push
npm run seed:365
```

## Environment

Copy `.env.example` and provide the required values:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `CRON_SECRET`

## Deployment

The default production URL used by scripts is:

```text
https://ipas-ai-daily.vercel.app
```

See `DEPLOYMENT.md` for cron, push notification, and database notes. See `PRODUCTION_CHECKLIST.md` for the fastest path to copy the working English Daily Sentence deployment pattern into a separate iPAS AI Daily production setup.
