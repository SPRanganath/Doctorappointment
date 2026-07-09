import { Router } from "express";
import { pool } from "../db/pool.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const USER_SELECT = `
  SELECT u.id, u.name, u.email, u.role, u.phone, u."createdAt" AS "createdAt", doc.id AS "doctorId"
  FROM "user" u
  LEFT JOIN doctors doc ON doc.user_id = u.id
`;

function toResponse(row) {
  return { ...row, id: String(row.id), doctorId: row.doctorId != null ? String(row.doctorId) : undefined };
}

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  }),
);

router.get(
  "/",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { role } = req.query;
    const params = [];
    let where = "";
    if (role) {
      params.push(role);
      where = `WHERE u.role = $${params.length}`;
    }
    const { rows } = await pool.query(`${USER_SELECT} ${where} ORDER BY u."createdAt" DESC`, params);
    res.json(rows.map(toResponse));
  }),
);

router.get(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "admin" && String(req.user.id) !== String(req.params.id)) {
      return res.status(403).json({ error: "You do not have permission to view this user." });
    }
    const { rows } = await pool.query(`${USER_SELECT} WHERE u.id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "User not found." });
    res.json(toResponse(rows[0]));
  }),
);

export default router;
