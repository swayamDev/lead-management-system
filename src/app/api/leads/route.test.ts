import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the session and prisma layers so this test exercises real
// route, service, and permission logic without touching a database.
vi.mock("@/lib/get-session", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    lead: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    activity: {
      create: vi.fn(),
    },
  },
}));

import { requireUser } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import { UnauthorizedError } from "@/lib/permissions";
import { GET, POST } from "@/app/api/leads/route";

const mockedRequireUser = vi.mocked(requireUser);
const mockedPrisma = vi.mocked(prisma, true);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/leads", () => {
  it("scopes a member's results to their own assigned leads", async () => {
    mockedRequireUser.mockResolvedValue({
      id: "member-1",
      role: "MEMBER",
      name: "Morgan Member",
      email: "member@test.com",
    });
    mockedPrisma.lead.count.mockResolvedValue(1);
    mockedPrisma.lead.findMany.mockResolvedValue([]);

    const request = new NextRequest("http://localhost/api/leads?page=1");
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockedPrisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ assignedToId: "member-1" }),
      }),
    );
  });

  it("returns 401 when there is no session", async () => {
    mockedRequireUser.mockRejectedValue(new UnauthorizedError());

    const request = new NextRequest("http://localhost/api/leads");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});

describe("POST /api/leads", () => {
  it("returns 403 when a member tries to create a lead manually", async () => {
    mockedRequireUser.mockResolvedValue({
      id: "member-1",
      role: "MEMBER",
      name: "Morgan Member",
      email: "member@test.com",
    });

    const request = new NextRequest("http://localhost/api/leads", {
      method: "POST",
      body: JSON.stringify({ name: "Jamie", email: "jamie@example.com" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(mockedPrisma.lead.create).not.toHaveBeenCalled();
  });

  it("returns 201 when an admin creates a lead", async () => {
    mockedRequireUser.mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
      name: "Alex Admin",
      email: "admin@test.com",
    });
    // Test mocks only need the fields the route actually reads; casting
    // to the full Prisma return type isn't worth it here.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    mockedPrisma.lead.create.mockResolvedValue({
      id: "lead-1",
      status: "NEW",
    } as any);
    mockedPrisma.activity.create.mockResolvedValue({ id: "activity-1" } as any);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const request = new NextRequest("http://localhost/api/leads", {
      method: "POST",
      body: JSON.stringify({ name: "Jamie", email: "jamie@example.com" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
  });
});
