import { describe, expect, it } from "vitest";
import { publicLeadSchema, updateLeadSchema, leadListQuerySchema } from "@/schemas/lead.schema";

describe("publicLeadSchema", () => {
  it("accepts a minimal valid submission", () => {
    const result = publicLeadSchema.safeParse({ name: "Jamie", email: "jamie@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = publicLeadSchema.safeParse({ name: "", email: "jamie@example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = publicLeadSchema.safeParse({ name: "Jamie", email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("defaults source to WEBSITE when omitted", () => {
    const result = publicLeadSchema.parse({ name: "Jamie", email: "jamie@example.com" });
    expect(result.source).toBe("WEBSITE");
  });

  it("coerces a string budget to a number", () => {
    const result = publicLeadSchema.parse({
      name: "Jamie",
      email: "jamie@example.com",
      budget: "5000",
    });
    expect(result.budget).toBe(5000);
  });
});

describe("updateLeadSchema", () => {
  it("accepts a status-only update", () => {
    expect(updateLeadSchema.safeParse({ status: "WON" }).success).toBe(true);
  });

  it("rejects an invalid status", () => {
    expect(updateLeadSchema.safeParse({ status: "MADE_UP" }).success).toBe(false);
  });

  it("allows explicitly unassigning via null", () => {
    expect(updateLeadSchema.safeParse({ assignedToId: null }).success).toBe(true);
  });
});

describe("leadListQuerySchema", () => {
  it("fills in defaults for page and perPage", () => {
    const result = leadListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(20);
  });

  it("caps perPage at 100", () => {
    expect(leadListQuerySchema.safeParse({ perPage: "500" }).success).toBe(false);
  });
});
