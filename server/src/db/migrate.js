import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getMigrations } from "better-auth/db/migration";
import { auth } from "../lib/auth.js";
import { pool } from "./pool.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  console.log("Running Better Auth migrations (user/session/account/verification)...");
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  console.log("Better Auth migrations complete.");

  const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");
  console.log("Running domain schema migration...");
  await pool.query(sql);
  console.log("Domain schema migration complete.");

  await pool.end();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
