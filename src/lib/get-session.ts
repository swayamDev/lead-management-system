import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";
import type { Role } from "@/generated/prisma/enums";

/**
 * Reads the current session on the server (route handlers, server
 * components, server actions). Returns null when there is no signed-in
 * user - callers decide whether that means 401 or a redirect.
 *
 * Wrapped in React's cache() because a single request usually calls
 * this more than once - e.g. the dashboard layout checks the session,
 * then the page itself calls requireUser() again. Without caching,
 * that was two separate DB round trips (through Neon's HTTP driver,
 * ~100-200ms each) for every single navigation. cache() dedupes those
 * into one call per request.
 */
export const getServerSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
});

export type CurrentUser = {
  id: string;
  role: Role;
  name: string;
  email: string;
};

export async function requireUser(): Promise<CurrentUser> {
  const session = await getServerSession();
  if (!session?.user) {
    const { UnauthorizedError } = await import("@/lib/permissions");
    throw new UnauthorizedError();
  }
  return session.user as unknown as CurrentUser;
}
