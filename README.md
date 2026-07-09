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
