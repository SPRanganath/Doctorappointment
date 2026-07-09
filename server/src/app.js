import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { withScheme } from "./utils/url.js";
import specialtiesRoutes from "./routes/specialties.routes.js";
import doctorsRoutes from "./routes/doctors.routes.js";
import patientsRoutes from "./routes/patients.routes.js";
import usersRoutes from "./routes/users.routes.js";
import appointmentsRoutes from "./routes/appointments.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => withScheme(origin.trim()));

const app = express();

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan("dev"));

// Better Auth needs the raw (unparsed) request, so it's mounted before
// express.json() runs on the rest of the app.
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

app.get("/", (_req, res) =>
  res.json({
    message: "MediCare API is running.",
    health: "/api/health",
    endpoints: [
      "/api/auth",
      "/api/specialties",
      "/api/doctors",
      "/api/patients",
      "/api/users",
      "/api/appointments",
    ],
  }),
);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/specialties", specialtiesRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/appointments", appointmentsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
