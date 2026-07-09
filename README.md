# MediCare — Doctor Appointment Booking System

A full-stack doctor appointment booking application.

- **Frontend**: React + Vite + TypeScript + Tailwind CSS (`/`)
- **Backend**: Node.js + Express + PostgreSQL, hosted on [Neon](https://neon.tech) (`/server`)
- **Auth**: [Better Auth](https://better-auth.com) with cookie-based sessions

## Project structure

```
.
├── src/            # React frontend (Vite)
├── public/
├── server/         # Express API
│   └── src/
│       ├── db/         # schema.sql, migrate.js, seed.js
│       ├── lib/         # Better Auth config
│       ├── middleware/
│       └── routes/     # doctors, patients, users, appointments, specialties
└── package.json    # frontend scripts
```

## Features

- Search doctors by specialty, view profiles and live availability
- Book / cancel appointments with double-booking prevention
- Role-based accounts: patient, doctor, admin — each with its own dashboard
- Session-based auth (Better Auth) with role-locked sign-up

## Local setup

### 1. Database

Create a [Neon](https://neon.tech) Postgres project and copy its connection string.

### 2. Backend

```
cd server
cp .env.example .env   # fill in DATABASE_URL, BETTER_AUTH_SECRET
npm install
npm run db:setup       # runs Better Auth + domain schema migrations, then seeds demo data
npm run dev             # http://localhost:5000
```

### 3. Frontend

```
cp .env.example .env    # defaults point at the local backend
npm install
npm run dev              # http://localhost:5173
```

### Demo accounts

Seeded by `npm run db:seed`:

| Role    | Email             | Password    |
| ------- | ----------------- | ----------- |
| Patient | patient@demo.com  | patient123  |
| Doctor  | doctor@demo.com   | doctor123   |
| Admin   | admin@demo.com    | admin123    |

## Scripts

**Frontend** (repo root): `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`

**Backend** (`server/`): `npm run dev`, `npm start`, `npm run db:migrate`, `npm run db:seed`, `npm run db:setup`

## Deployment (Render)

Deployed as two Render services from this single repo — see `render.yaml`:

- **`doctorappointment-api`** — Web Service, root dir `server`, build `npm install`, start `npm start`, health check `/api/health`
- **`doctorappointment-web`** — Static Site, root dir `.`, build `npm install && npm run build`, publish dir `dist`, SPA rewrite via `public/_redirects`

Env vars: the API needs `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NODE_ENV=production`, and `CORS_ORIGIN` (the static site's URL); the static site needs `VITE_SERVER_URL` (the API's URL) set at build time. In production the two services live on different `onrender.com` subdomains, so Better Auth's session cookie is configured with `SameSite=None; Secure` (see `server/src/lib/auth.js`) to survive the cross-origin request.

To redeploy from scratch on a new Render account: Dashboard → New → Blueprint → point at this repo → Render reads `render.yaml` and provisions both services (fill in `DATABASE_URL` manually when prompted).
