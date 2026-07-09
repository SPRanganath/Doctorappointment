import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { pool } from "../db/pool.js";

export async function authenticate(req, res, next) {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      phone: session.user.phone ?? undefined,
      createdAt: session.user.createdAt,
    };

    if (user.role === "doctor") {
      const { rows } = await pool.query("SELECT id FROM doctors WHERE user_id = $1", [user.id]);
      user.doctorId = rows[0] ? String(rows[0].id) : null;
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}
