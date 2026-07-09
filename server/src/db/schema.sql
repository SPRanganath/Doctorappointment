-- Doctor Appointment Booking System — domain schema
-- Run via `npm run db:migrate` (after Better Auth's own migration, which
-- creates the "user" / "session" / "account" / "verification" tables).

-- Rerunning this migration always starts from a clean slate for our domain
-- tables. Better Auth's own tables are managed separately and untouched here.
DROP TABLE IF EXISTS appointments, doctor_schedule, doctors, patients, specialties, users CASCADE;

CREATE TABLE specialties (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL,
  description TEXT
);

CREATE TABLE doctors (
  id                SERIAL PRIMARY KEY,
  user_id           TEXT UNIQUE REFERENCES "user"(id) ON DELETE SET NULL,
  specialty_id      INTEGER NOT NULL REFERENCES specialties(id),
  name              TEXT NOT NULL,
  qualifications    TEXT,
  experience_years  INTEGER NOT NULL DEFAULT 0,
  rating            NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  reviews_count     INTEGER NOT NULL DEFAULT 0,
  location          TEXT,
  hospital          TEXT,
  bio               TEXT,
  consultation_fee  INTEGER NOT NULL DEFAULT 50,
  avatar_color      TEXT NOT NULL DEFAULT 'bg-primary-100 text-primary-700',
  gender            TEXT CHECK (gender IN ('male', 'female')),
  languages         TEXT[] NOT NULL DEFAULT '{English}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE patients (
  id             SERIAL PRIMARY KEY,
  user_id        TEXT UNIQUE NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  date_of_birth  DATE,
  address        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE doctor_schedule (
  id           SERIAL PRIMARY KEY,
  doctor_id    INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week  TEXT NOT NULL CHECK (
    day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
  ),
  slot_time    TEXT NOT NULL,
  UNIQUE (doctor_id, day_of_week, slot_time)
);

CREATE TABLE appointments (
  id                SERIAL PRIMARY KEY,
  doctor_id         INTEGER NOT NULL REFERENCES doctors(id),
  patient_id        INTEGER NOT NULL REFERENCES patients(id),
  appointment_date  DATE NOT NULL,
  appointment_time  TEXT NOT NULL,
  reason            TEXT,
  status            TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  fee               INTEGER NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent double-booking the same doctor/date/time slot, but only while the
-- appointment is still upcoming — a cancelled slot can be rebooked.
CREATE UNIQUE INDEX uq_appointments_doctor_slot_upcoming
  ON appointments (doctor_id, appointment_date, appointment_time)
  WHERE status = 'upcoming';

CREATE INDEX idx_appointments_patient ON appointments (patient_id);
CREATE INDEX idx_appointments_doctor ON appointments (doctor_id);
CREATE INDEX idx_doctors_specialty ON doctors (specialty_id);
CREATE INDEX idx_doctor_schedule_doctor ON doctor_schedule (doctor_id);
