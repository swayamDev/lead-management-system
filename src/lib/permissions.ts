/**
 * Central authorization rules for the app.
 *
 * These functions are the single source of truth for what each role can
 * do. They are imported on the SERVER (API routes) to enforce access,
 * and on the CLIENT (dashboard components) to decide what to render.
 * Keeping the logic in one place means the client and server can never
 * silently drift apart.
 */
import type { Role } from "@/generated/prisma/enums";

export type SessionUser = {
  id: string;
  role: Role;
};

export const permissions = {
  // Leads
  canViewAllLeads: (role: Role) => role === "ADMIN",
  canCreateLeadManually: (role: Role) => role === "ADMIN",
  canDeleteLead: (role: Role) => role === "ADMIN",
  canAssignLead: (role: Role) => role === "ADMIN",
  canChangeLeadStatus: (role: Role) => role === "ADMIN" || role === "MEMBER", // both roles, but scoped to their own leads for members
  canAddNote: (role: Role) => role === "ADMIN" || role === "MEMBER",
  canViewAnalytics: (role: Role) => role === "ADMIN",

  // Users
  canCreateUser: (role: Role) => role === "ADMIN",
  canDeleteUser: (role: Role) => role === "ADMIN",
  canViewUsers: (role: Role) => role === "ADMIN",
};

/**
 * A member may only act on leads assigned to them. An admin may act on
 * any lead. This is checked against the actual row, not just the role,
 * so a member can never reach another member's lead by guessing an id.
 */
export function canAccessLead(user: SessionUser, lead: { assignedToId: string | null }) {
  if (user.role === "ADMIN") return true;
  return lead.assignedToId === user.id;
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in to do that.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
