import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";

import { db } from "@/lib/db/client";
import { account, session, user, verification } from "@/lib/db/schema";
import { getRoleForEmail } from "@/lib/auth/roles";

function getGoogleAccountMode(): "all" | "throxy_only" {
  const raw = (process.env.AUTH_GOOGLE_ACCOUNT_MODE || process.env.AUTH_GOOGLE_DOMAIN_MODE || "throxy_only")
    .trim()
    .toLowerCase();
  return raw === "throxy_only" ? "throxy_only" : "all";
}

function isAllowedGoogleEmail(email: string): boolean {
  if (getGoogleAccountMode() !== "throxy_only") {
    return true;
  }

  return email.trim().toLowerCase().endsWith("@throxy.com");
}

export const auth = betterAuth({
  appName: "throxy-app",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: true,
        defaultValue: "user",
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        async before(nextUser) {
          if (!isAllowedGoogleEmail(nextUser.email)) {
            throw new Error("Only @throxy.com Google accounts are allowed for this app.");
          }

          return {
            data: {
              ...nextUser,
              role: getRoleForEmail(nextUser.email),
            },
          };
        },
      },
    },
  },
});
