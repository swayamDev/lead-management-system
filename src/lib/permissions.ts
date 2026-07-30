// Single source of truth for what each role can do. Used on the server
// (API routes) to enforce access, and on the client (dashboard) to decide
// what to render.
import type { Role } from "@/generated/prisma/enums";

export type SessionUser = {
  id: string;
  role: Role;
};

export const permissions = {
  // Leads
  canCreateLeadManually: (role: Role) => role === "ADMIN",
  canDeleteLead: (role: Role) => role === "ADMIN",
  canAssignLead: (role: Role) => role === "ADMIN",
  canChangeLeadStatus: (role: Role) => role === "ADMIN" || role === "MEMBER", // scoped to own leads for members
  canAddNote: (role: Role) => role === "ADMIN" || role === "MEMBER",

  // Users
  canCreateUser: (role: Role) => role === "ADMIN",
  canViewUsers: (role: Role) => role === "ADMIN",
};

// A member may only act on leads assigned to them; an admin may act on
// any lead. Checked against the actual row, not just the role.
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
