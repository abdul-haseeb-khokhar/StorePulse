# StorePulse

Real-time web analytics for e-commerce storefronts. A store owner drops a single tracking snippet into their site, StorePulse records page views and product clicks as they happen, and a dashboard turns that into traffic trends, top products, and top referrers per site.

This is a monorepo with two independent apps:

| App | Path | Stack |
|---|---|---|
| API | [`storepulse-backend/`](storepulse-backend) | Node.js, Express 5, Prisma + PostgreSQL, Redis |
| Dashboard | [`storepulse-frontend/`](storepulse-frontend) | React 19, Vite, TanStack Query, Tailwind |

## Table of contents

- [How it works](#how-it-works)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend setup](#backend-setup)
  - [Frontend setup](#frontend-setup)
  - [Running with Docker](#running-with-docker)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Deployment](#deployment)
- [License](#license)

## How it works

1. A site owner signs up, adds a site, and gets back an API key plus a one-line tracking snippet (`<script src=".../track.js" data-site-key="...">`).
2. The snippet ([`storepulse-backend/public/track.js`](storepulse-backend/public/track.js)) tracks one page view per load and any element tagged with `data-storepulse-product-id`, posting each event to `POST /api/events`.
3. Incoming events are validated, checked against the owning account's plan (site count and monthly event quota), and buffered in Redis rather than written straight to Postgres.
4. A separate flush worker drains that buffer into Postgres in batches, so a burst of traffic never turns into a burst of individual database writes.
5. The dashboard reads aggregated analytics (summary stats, daily traffic, top products, top referrers) per site, polling periodically so the numbers stay close to live.

## Features

- **Analytics**: per-site traffic chart, headline stats with period-over-period change, top clicked products, top referrers.
- **Multi-site accounts**: add multiple storefronts under one account, each with its own API key (regeneratable).
- **Plans & billing**: Free/Pro/Business tiers with site and monthly-event limits, manual bank-transfer payment requests, self-service cancellation, and a full billing history.
- **Auth**: email/password signup with verification, password reset, email change (confirmed via the new address), rate-limited login.
- **Notifications**: in-app notifications and transactional emails for plan changes, payment review outcomes, and account status changes.
- **Admin panel**: a separate authenticated surface for managing users, sites, payment requests, and admins, with a superadmin role and an activity log.

## Tech stack

**Backend** — Express 5, Prisma ORM over PostgreSQL, Redis (`ioredis`) for ingest buffering/caching and rate-limit storage, JWT auth, Zod for request validation, Resend for transactional email, Helmet for security headers.

**Frontend** — React 19, Vite, React Router, TanStack Query for server state, Tailwind CSS, Recharts for charts, Framer Motion for animation.

## Project structure

```
storepulse-backend/
  src/
    modules/        one folder per domain: auth, sites, ingest, analytics, billing,
                     subscription, paymentRequest, notification, email, admin, adminAuth
    middleware/      auth guards, rate limiters, request validation
    validators/      Zod schemas, one per module
    config/          Prisma client, Redis client, plan limits
    utils/           small shared helpers (JWT, password hashing, tokens, etc.)
  prisma/            schema.prisma + migrations
  public/track.js    the tracking snippet served to customer storefronts
  server.js          API entry point
  flush-worker.js    drains the Redis event buffer into Postgres on an interval

storepulse-frontend/
  src/
    pages/           one file per route (pages/admin/* for the admin panel)
    components/      shared UI (components/ui) and feature components (dashboard/, auth/)
    layouts/         page shells (AppLayout, AuthLayout, AdminLayout, BlankLayout)
    lib/             API clients, session storage, query keys, shared formatting helpers
    context/          theme (light/dark) context
```

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- A [Resend](https://resend.com) API key (for sending transactional email)

### Backend setup

```bash
cd storepulse-backend
npm install
cp .env.example .env   # fill in the values — see Environment variables below
npx prisma migrate dev
npx prisma db seed     # creates the root SUPERADMIN account from ADMIN_* env vars
npm run dev            # starts the API on PORT (default 5000) with nodemon
```

The ingest buffer needs its flush worker running too, or events will sit in Redis and analytics will stay at zero:

```bash
node flush-worker.js
```

### Frontend setup

```bash
cd storepulse-frontend
npm install
cp .env.example .env   # at minimum set VITE_API_BASE_URL to the backend's URL
npm run dev            # starts Vite on http://localhost:5173
```

Other frontend scripts: `npm run build` (production build), `npm run preview` (preview the build), `npm run lint`.

### Running with Docker

The backend ships a `docker-compose.yml` that runs the API and the flush worker as two separate services (both need the same `.env`):

```bash
cd storepulse-backend
docker compose up --build
```

Postgres and Redis aren't included in the compose file — point `DATABASE_URL` / `REDIS_URL` at instances you already have running.

## Environment variables

**`storepulse-backend/.env`**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Port the API listens on |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Session token signing |
| `REDIS_URL` | Redis connection string (ingest buffer, caching, rate limiting) |
| `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS` | Transactional email |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Used once by `prisma db seed` to create the root SUPERADMIN |
| `FRONTEND_URL` | Allowed CORS origin + base URL used in emailed links |

**`storepulse-frontend/.env`**

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend API origin |
| `VITE_CONTACT_EMAIL`, `VITE_CONTACT_WHATSAPP`, `VITE_CONTACT_WHATSAPP_DISPLAY`, `VITE_CONTACT_PHONE`, `VITE_CONTACT_PHONE_DISPLAY` | Support contact details shown in the app |
| `VITE_BANK_NAME`, `VITE_BANK_ACCOUNT_TITLE`, `VITE_BANK_ACCOUNT_NUMBER`, `VITE_BANK_IBAN` | Bank details shown on the manual-payment checkout page |
| `VITE_PRICE_PRO_MONTHLY_PKR`, `VITE_PRICE_PRO_ANNUAL_PKR`, `VITE_PRICE_BUSINESS_MONTHLY_PKR`, `VITE_PRICE_BUSINESS_ANNUAL_PKR` | Pricing shown on the landing/upgrade pages |

See each app's `.env.example` for the authoritative list.

## API overview

All routes are mounted under `/api` (see [`storepulse-backend/src/app.js`](storepulse-backend/src/app.js)):

| Prefix | Module | Auth |
|---|---|---|
| `/api/auth` | signup, login, verification, password reset, profile | mixed |
| `/api/sites` | create/list sites, usage, API key regeneration | user session |
| `/api/events` | tracking snippet ingest endpoint | public (API key + rate limited) |
| `/api/analytics` | traffic, summary, top products/referrers | user session |
| `/api/billing` | payment requests, cancellation, billing history | user session |
| `/api/notifications` | in-app notifications | user session |
| `/api/admin/auth` | admin login, invites | admin session |
| `/api/admin` | user/site management, payment review, stats, logs | admin session (some routes superadmin-only) |

`GET /health` returns `{ status: "ok" }` for uptime checks.

## Deployment

Production runs the backend on a plain VM behind [Caddy](https://caddyserver.com) as a TLS-terminating reverse proxy (using an [sslip.io](https://sslip.io) hostname so Let's Encrypt has a real domain to issue against), and the frontend on Vercel. Because the API sits behind exactly one proxy hop, `app.set('trust proxy', 1)` in `app.js` is what makes IP-based logic (rate limiting) see the real client IP instead of Caddy's.

## License

No license has been chosen for this project yet — all rights reserved by the author unless stated otherwise.
