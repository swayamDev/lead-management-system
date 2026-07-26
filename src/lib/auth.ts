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
