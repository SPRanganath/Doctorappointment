import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

function toSpecialtyResponse(row) {
  return { id: row.slug, name: row.name, icon: row.icon, description: row.description ?? undefined };
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query("SELECT * FROM specialties ORDER BY name");
    res.json(rows.map(toSpecialtyResponse));
  }),
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM specialties WHERE slug = $1", [req.params.slug]);
    if (!rows[0]) return res.status(404).json({ error: "Specialty not found." });
    res.json(toSpecialtyResponse(rows[0]));
  }),
);

export default router;
