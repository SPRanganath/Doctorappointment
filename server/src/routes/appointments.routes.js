import { Router } from "express";
import { pool } from "../db/pool.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const APPOINTMENT_SELECT = `
  SELECT
    a.id,
    a.doctor_id AS "doctorId",
    d.name AS "doctorName",
    sp.name AS specialty,
    pu.id AS "patientId",
    pu.name AS "patientName",
    to_char(a.appointment_date, 'YYYY-MM-DD') AS date,
    a.appointment_time AS time,
    a.reason,
    a.status,
    a.fee,
    a.created_at AS "createdAt"
  FROM appointments a
  JOIN doctors d ON d.id = a.doctor_id
  JOIN specialties sp ON sp.id = d.specialty_id
  JOIN patients p ON p.id = a.patient_id
  JOIN "user" pu ON pu.id = p.user_id
`;

function toResponse(row) {
  return { ...row, id: String(row.id), doctorId: String(row.doctorId), patientId: String(row.patientId) };
}

async function getPatientIdForUser(userId) {
  const { rows } = await pool.query("SELECT id FROM patients WHERE user_id = $1", [userId]);
  return rows[0]?.id ?? null;
}

router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const conditions = [];
    const params = [];

    if (req.user.role === "patient") {
      params.push(req.user.id);
      conditions.push(`pu.id = $${params.length}`);
    } else if (req.user.role === "doctor") {
      if (!req.user.doctorId) return res.json([]);
      params.push(req.user.doctorId);
      conditions.push(`a.doctor_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `${APPOINTMENT_SELECT} ${where} ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      params,
    );
    res.json(rows.map(toResponse));
  }),
);

router.get(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [req.params.id]);
    const appt = rows[0];
    if (!appt) return res.status(404).json({ error: "Appointment not found." });

    const isOwner =
      (req.user.role === "patient" && String(appt.patientId) === String(req.user.id)) ||
      (req.user.role === "doctor" && String(appt.doctorId) === String(req.user.doctorId)) ||
      req.user.role === "admin";
    if (!isOwner) return res.status(403).json({ error: "You do not have permission to view this appointment." });

    res.json(toResponse(appt));
  }),
);

router.post(
  "/",
  authenticate,
  authorize("patient"),
  asyncHandler(async (req, res) => {
    const { doctorId, date, time, reason } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ error: "doctorId, date and time are required." });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "date must be in YYYY-MM-DD format." });
    }

    const { rows: doctorRows } = await pool.query("SELECT id, consultation_fee FROM doctors WHERE id = $1", [
      doctorId,
    ]);
    if (!doctorRows[0]) return res.status(404).json({ error: "Doctor not found." });

    const dayOfWeek = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" });
    const { rows: scheduleRows } = await pool.query(
      "SELECT 1 FROM doctor_schedule WHERE doctor_id = $1 AND day_of_week = $2 AND slot_time = $3",
      [doctorId, dayOfWeek, time],
    );
    if (!scheduleRows[0]) {
      return res.status(400).json({ error: "This doctor does not offer that time slot on the selected date." });
    }

    const patientId = await getPatientIdForUser(req.user.id);
    if (!patientId) return res.status(400).json({ error: "No patient profile found for this account." });

    try {
      const { rows } = await pool.query(
        `INSERT INTO appointments (doctor_id, patient_id, appointment_date, appointment_time, reason, fee)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [doctorId, patientId, date, time, reason || "General consultation", doctorRows[0].consultation_fee],
      );
      const { rows: fullRows } = await pool.query(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [rows[0].id]);
      res.status(201).json(toResponse(fullRows[0]));
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: "This slot has just been booked. Please choose another." });
      }
      throw err;
    }
  }),
);

router.patch(
  "/:id/cancel",
  authenticate,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [req.params.id]);
    const appt = rows[0];
    if (!appt) return res.status(404).json({ error: "Appointment not found." });

    const canCancel =
      (req.user.role === "patient" && String(appt.patientId) === String(req.user.id)) ||
      (req.user.role === "doctor" && String(appt.doctorId) === String(req.user.doctorId)) ||
      req.user.role === "admin";
    if (!canCancel) return res.status(403).json({ error: "You do not have permission to cancel this appointment." });
    if (appt.status !== "upcoming") {
      return res.status(400).json({ error: "Only upcoming appointments can be cancelled." });
    }

    await pool.query("UPDATE appointments SET status = 'cancelled' WHERE id = $1", [req.params.id]);
    const { rows: updated } = await pool.query(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [req.params.id]);
    res.json(toResponse(updated[0]));
  }),
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("doctor", "admin"),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!["completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "status must be 'completed' or 'cancelled'." });
    }

    const { rows } = await pool.query(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [req.params.id]);
    const appt = rows[0];
    if (!appt) return res.status(404).json({ error: "Appointment not found." });

    if (req.user.role === "doctor" && String(appt.doctorId) !== String(req.user.doctorId)) {
      return res.status(403).json({ error: "You do not have permission to update this appointment." });
    }

    await pool.query("UPDATE appointments SET status = $1 WHERE id = $2", [status, req.params.id]);
    const { rows: updated } = await pool.query(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [req.params.id]);
    res.json(toResponse(updated[0]));
  }),
);

export default router;
