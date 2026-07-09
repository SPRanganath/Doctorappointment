import { Router } from "express";
import { pool } from "../db/pool.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const DOCTOR_COLUMNS = `
  d.id,
  d.user_id AS "userId",
  d.name,
  sp.slug AS "specialtyId",
  sp.name AS specialty,
  d.qualifications,
  d.experience_years AS "experienceYears",
  d.rating::float AS rating,
  d.reviews_count AS "reviewsCount",
  d.location,
  d.hospital,
  d.bio,
  d.consultation_fee AS "consultationFee",
  d.avatar_color AS "avatarColor",
  d.gender,
  d.languages
`;

function toDoctorResponse(row, availability) {
  return {
    id: String(row.id),
    name: row.name,
    specialtyId: row.specialtyId,
    specialty: row.specialty,
    qualifications: row.qualifications ?? undefined,
    experienceYears: row.experienceYears,
    rating: row.rating,
    reviewsCount: row.reviewsCount,
    location: row.location ?? undefined,
    hospital: row.hospital ?? undefined,
    bio: row.bio ?? undefined,
    consultationFee: row.consultationFee,
    avatarColor: row.avatarColor,
    gender: row.gender ?? undefined,
    languages: row.languages ?? [],
    ...(availability ? { availability } : {}),
  };
}

function buildAvailability(scheduleRows) {
  const availability = [];
  const indexByDay = {};
  for (const row of scheduleRows) {
    if (!(row.day_of_week in indexByDay)) {
      indexByDay[row.day_of_week] = availability.length;
      availability.push({ day: row.day_of_week, slots: [] });
    }
    availability[indexByDay[row.day_of_week]].slots.push(row.slot_time);
  }
  return availability;
}

async function fetchSchedule(doctorId) {
  const { rows } = await pool.query(
    "SELECT day_of_week, slot_time FROM doctor_schedule WHERE doctor_id = $1 ORDER BY id",
    [doctorId],
  );
  return buildAvailability(rows);
}

function canManageDoctor(req, doctorId) {
  if (req.user.role === "admin") return true;
  return req.user.role === "doctor" && String(req.user.doctorId) === String(doctorId);
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, specialty, sort } = req.query;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(d.name ILIKE $${params.length} OR sp.name ILIKE $${params.length})`);
    }
    if (specialty && specialty !== "all") {
      params.push(specialty);
      conditions.push(`sp.slug = $${params.length}`);
    }

    const orderBy =
      {
        experience: "d.experience_years DESC",
        "fee-low": "d.consultation_fee ASC",
        "fee-high": "d.consultation_fee DESC",
      }[sort] || "d.rating DESC";

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `SELECT ${DOCTOR_COLUMNS} FROM doctors d JOIN specialties sp ON sp.id = d.specialty_id ${where} ORDER BY ${orderBy}`,
      params,
    );
    res.json(rows.map((row) => toDoctorResponse(row)));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT ${DOCTOR_COLUMNS} FROM doctors d JOIN specialties sp ON sp.id = d.specialty_id WHERE d.id = $1`,
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ error: "Doctor not found." });
    const availability = await fetchSchedule(req.params.id);
    res.json(toDoctorResponse(rows[0], availability));
  }),
);

router.get(
  "/:id/schedule",
  asyncHandler(async (req, res) => {
    const availability = await fetchSchedule(req.params.id);
    res.json({ availability });
  }),
);

router.put(
  "/:id/schedule",
  authenticate,
  asyncHandler(async (req, res) => {
    if (!canManageDoctor(req, req.params.id)) {
      return res.status(403).json({ error: "You do not have permission to update this schedule." });
    }
    const { schedule } = req.body;
    if (!Array.isArray(schedule)) {
      return res.status(400).json({ error: "schedule must be an array of { day, slots }." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM doctor_schedule WHERE doctor_id = $1", [req.params.id]);
      for (const entry of schedule) {
        for (const slot of entry.slots ?? []) {
          await client.query(
            "INSERT INTO doctor_schedule (doctor_id, day_of_week, slot_time) VALUES ($1, $2, $3)",
            [req.params.id, entry.day, slot],
          );
        }
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    const availability = await fetchSchedule(req.params.id);
    res.json({ availability });
  }),
);

router.get(
  "/:id/slots",
  asyncHandler(async (req, res) => {
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "A valid date query param (YYYY-MM-DD) is required." });
    }

    const dayOfWeek = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" });

    const { rows: scheduleRows } = await pool.query(
      "SELECT slot_time FROM doctor_schedule WHERE doctor_id = $1 AND day_of_week = $2 ORDER BY id",
      [req.params.id, dayOfWeek],
    );
    const { rows: bookedRows } = await pool.query(
      "SELECT appointment_time FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND status = 'upcoming'",
      [req.params.id, date],
    );
    const booked = new Set(bookedRows.map((r) => r.appointment_time));

    res.json({
      date,
      dayOfWeek,
      slots: scheduleRows.map((r) => ({ time: r.slot_time, available: !booked.has(r.slot_time) })),
    });
  }),
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const {
      name, specialtyId, qualifications, experienceYears = 0, location, hospital, bio,
      consultationFee = 50, avatarColor = "bg-primary-100 text-primary-700", gender, languages = ["English"],
      schedule = [],
    } = req.body;

    if (!name || !specialtyId) {
      return res.status(400).json({ error: "name and specialtyId are required." });
    }

    const { rows: specialtyRows } = await pool.query("SELECT id FROM specialties WHERE slug = $1", [
      specialtyId,
    ]);
    if (!specialtyRows[0]) return res.status(400).json({ error: "Unknown specialtyId." });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        `INSERT INTO doctors
          (specialty_id, name, qualifications, experience_years, location, hospital, bio, consultation_fee, avatar_color, gender, languages)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          specialtyRows[0].id, name, qualifications ?? null, experienceYears, location ?? null,
          hospital ?? null, bio ?? null, consultationFee, avatarColor, gender ?? null, languages,
        ],
      );
      const doctorId = rows[0].id;
      for (const entry of schedule) {
        for (const slot of entry.slots ?? []) {
          await client.query(
            "INSERT INTO doctor_schedule (doctor_id, day_of_week, slot_time) VALUES ($1, $2, $3)",
            [doctorId, entry.day, slot],
          );
        }
      }
      await client.query("COMMIT");

      const { rows: fullRows } = await pool.query(
        `SELECT ${DOCTOR_COLUMNS} FROM doctors d JOIN specialties sp ON sp.id = d.specialty_id WHERE d.id = $1`,
        [doctorId],
      );
      const availability = await fetchSchedule(doctorId);
      res.status(201).json(toDoctorResponse(fullRows[0], availability));
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }),
);

router.put(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    if (!canManageDoctor(req, req.params.id)) {
      return res.status(403).json({ error: "You do not have permission to update this doctor." });
    }

    const fields = {
      name: "name", qualifications: "qualifications", experience_years: "experienceYears",
      location: "location", hospital: "hospital", bio: "bio", consultation_fee: "consultationFee",
      avatar_color: "avatarColor", gender: "gender", languages: "languages",
    };

    const sets = [];
    const params = [];
    for (const [column, key] of Object.entries(fields)) {
      if (req.body[key] !== undefined) {
        params.push(req.body[key]);
        sets.push(`${column} = $${params.length}`);
      }
    }
    if (req.body.specialtyId) {
      const { rows: specialtyRows } = await pool.query("SELECT id FROM specialties WHERE slug = $1", [
        req.body.specialtyId,
      ]);
      if (!specialtyRows[0]) return res.status(400).json({ error: "Unknown specialtyId." });
      params.push(specialtyRows[0].id);
      sets.push(`specialty_id = $${params.length}`);
    }

    if (sets.length === 0) return res.status(400).json({ error: "No fields to update." });

    params.push(req.params.id);
    await pool.query(`UPDATE doctors SET ${sets.join(", ")} WHERE id = $${params.length}`, params);

    const { rows } = await pool.query(
      `SELECT ${DOCTOR_COLUMNS} FROM doctors d JOIN specialties sp ON sp.id = d.specialty_id WHERE d.id = $1`,
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ error: "Doctor not found." });
    const availability = await fetchSchedule(req.params.id);
    res.json(toDoctorResponse(rows[0], availability));
  }),
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    try {
      const { rowCount } = await pool.query("DELETE FROM doctors WHERE id = $1", [req.params.id]);
      if (rowCount === 0) return res.status(404).json({ error: "Doctor not found." });
      res.status(204).end();
    } catch (err) {
      if (err.code === "23503") {
        return res
          .status(409)
          .json({ error: "Cannot delete a doctor with existing appointments. Cancel or reassign them first." });
      }
      throw err;
    }
  }),
);

export default router;
