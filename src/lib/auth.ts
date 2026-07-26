import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    // Without this, every getSession() call - which is every page
    // load and every navigation - hits the database. This signs a
    // short-lived copy of the session into the cookie itself, so most
    // checks are verified from the cookie alone; the DB is only
    // re-queried once the cache expires (or the session changes).
    cookieCache: {
      enabled: true,
      maxAge: 60, // seconds
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "MEMBER",
        // Only an admin can change this via the API - see /api/admin/users.
        // Better Auth otherwise treats additionalFields as user-editable,
        // so we exclude it from the client-facing update surface.
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
