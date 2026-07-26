import { describe, expect, it } from "vitest";
import { permissions, canAccessLead } from "@/lib/permissions";

describe("permissions", () => {
  it("only admins can delete leads", () => {
    expect(permissions.canDeleteLead("ADMIN")).toBe(true);
    expect(permissions.canDeleteLead("MEMBER")).toBe(false);
  });

  it("only admins can assign leads", () => {
    expect(permissions.canAssignLead("ADMIN")).toBe(true);
    expect(permissions.canAssignLead("MEMBER")).toBe(false);
  });

  it("only admins can create user accounts", () => {
    expect(permissions.canCreateUser("ADMIN")).toBe(true);
    expect(permissions.canCreateUser("MEMBER")).toBe(false);
  });

  it("both roles can add notes and change status", () => {
    expect(permissions.canAddNote("ADMIN")).toBe(true);
    expect(permissions.canAddNote("MEMBER")).toBe(true);
    expect(permissions.canChangeLeadStatus("MEMBER")).toBe(true);
  });
});

describe("canAccessLead", () => {
  const admin = { id: "admin-1", role: "ADMIN" as const };
  const member = { id: "member-1", role: "MEMBER" as const };

  it("lets an admin access any lead", () => {
    expect(canAccessLead(admin, { assignedToId: "someone-else" })).toBe(true);
    expect(canAccessLead(admin, { assignedToId: null })).toBe(true);
  });

  it("lets a member access only their own assigned lead", () => {
    expect(canAccessLead(member, { assignedToId: "member-1" })).toBe(true);
  });

  it("blocks a member from another member's lead", () => {
    expect(canAccessLead(member, { assignedToId: "someone-else" })).toBe(false);
  });

  it("blocks a member from an unassigned lead", () => {
    expect(canAccessLead(member, { assignedToId: null })).toBe(false);
  });
});
