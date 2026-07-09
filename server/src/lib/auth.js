import { betterAuth, APIError } from "better-auth";
import { pool } from "../db/pool.js";
import "dotenv/config";

const trustedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  user: {
    additionalFields: {
      role: {
        type: ["patient", "doctor", "admin"],
        required: true,
        defaultValue: "patient",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Public sign-up only ever creates patients or doctors — admin
          // accounts are provisioned out-of-band (see db/seed.js).
          if (user.role === "admin") {
            throw new APIError("BAD_REQUEST", {
              message: "role must be 'patient' or 'doctor'.",
            });
          }
          const role = user.role === "doctor" ? "doctor" : "patient";
          return { data: { ...user, role } };
        },
        after: async (user) => {
          if (user.role === "patient") {
            await pool.query("INSERT INTO patients (user_id) VALUES ($1)", [user.id]);
          } else if (user.role === "doctor") {
            const { rows } = await pool.query(
              "SELECT id FROM doctors WHERE user_id IS NULL ORDER BY id LIMIT 1",
            );
            if (rows[0]) {
              await pool.query("UPDATE doctors SET user_id = $1 WHERE id = $2", [user.id, rows[0].id]);
            }
          }
        },
      },
      update: {
        before: async (data) => {
          // Role is set once at sign-up and is never client-updatable
          // (prevents a patient from promoting themselves via updateUser).
          if ("role" in data) delete data.role;
          return { data };
        },
      },
    },
  },
});
