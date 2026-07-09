import { Router } from "express";
import { pool } from "../db/pool.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const PATIENT_SELECT = `
  SELECT
    u.id,
    u.name,
    u.email,
    u.phone,
    p.date_of_birth AS "dateOfBirth",
    p.address,
    u."createdAt" AS "createdAt"
  FROM patients p
  JOIN "user" u ON u.id = p.user_id
`;

function canAccessPatient(req, userId) {
  return req.user.role === "admin" || String(req.user.id) === String(userId);
}

router.get(
  "/",
  authenticate,
  authorize("admin"),
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(`${PATIENT_SELECT} ORDER BY u.name`);
    res.json(rows.map((r) => ({ ...r, id: String(r.id) })));
  }),
);

router.get(
  "/:userId",
  authenticate,
  asyncHandler(async (req, res) => {
    if (!canAccessPatient(req, req.params.userId)) {
      return res.status(403).json({ error: "You do not have permission to view this patient." });
    }
    const { rows } = await pool.query(`${PATIENT_SELECT} WHERE u.id = $1`, [req.params.userId]);
    if (!rows[0]) return res.status(404).json({ error: "Patient not found." });
    res.json({ ...rows[0], id: String(rows[0].id) });
  }),
);

router.put(
  "/:userId",
  authenticate,
  asyncHandler(async (req, res) => {
    if (!canAccessPatient(req, req.params.userId)) {
      return res.status(403).json({ error: "You do not have permission to update this patient." });
    }
    const { dateOfBirth, address } = req.body;
    await pool.query(
      `UPDATE patients SET date_of_birth = COALESCE($1, date_of_birth), address = COALESCE($2, address)
       WHERE user_id = $3`,
      [dateOfBirth ?? null, address ?? null, req.params.userId],
    );
    const { rows } = await pool.query(`${PATIENT_SELECT} WHERE u.id = $1`, [req.params.userId]);
    if (!rows[0]) return res.status(404).json({ error: "Patient not found." });
    res.json({ ...rows[0], id: String(rows[0].id) });
  }),
);

export default router;
