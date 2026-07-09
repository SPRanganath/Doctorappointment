import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { withScheme } from "./url";

const SERVER_URL = withScheme(import.meta.env.VITE_SERVER_URL || "http://localhost:5000");

export const authClient = createAuthClient({
  baseURL: SERVER_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string" },
        phone: { type: "string", required: false },
      },
    }),
  ],
});
