import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { CurrentUser } from "@/lib/get-session";
import { permissions, ForbiddenError } from "@/lib/permissions";
import { BadRequestError } from "@/lib/api-response";
import type { CreateUserInput } from "@/schemas/user.schema";

// Admin-only. There is no public signup; accounts are provisioned here.
export async function createUser(admin: CurrentUser, input: CreateUserInput) {
  if (!permissions.canCreateUser(admin.role)) {
    throw new ForbiddenError("Only admins can create user accounts.");
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new BadRequestError("A user with that email already exists.");
  }

  // Better Auth owns account/session creation, including password hashing.
  const result = await auth.api.signUpEmail({
    body: { email: input.email, password: input.password, name: input.name },
    headers: await headers(),
  });

  // `role` is marked input: false in auth.ts so users can't self-elevate;
  // this is the one place allowed to set it directly.
  const user = await prisma.user.update({
    where: { id: result.user.id },
    data: { role: input.role },
  });

  return user;
}

export async function listUsers(admin: CurrentUser) {
  if (!permissions.canViewUsers(admin.role)) {
    throw new ForbiddenError("Only admins can view the user list.");
  }
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}
