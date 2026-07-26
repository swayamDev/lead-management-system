import { z } from "zod";

/** Matches the LeadStatus / LeadSource enums in prisma/schema.prisma. */
export const leadStatusValues = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export const leadSourceValues = [
  "WEBSITE",
  "REFERRAL",
  "LINKEDIN",
  "COLD_OUTREACH",
  "EVENT",
  "OTHER",
] as const;

/** Public capture form - anyone can submit this, no auth required. */
export const publicLeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  budget: z.coerce.number().int().nonnegative().optional(),
  source: z.enum(leadSourceValues).default("WEBSITE"),
});

export type PublicLeadInput = z.infer<typeof publicLeadSchema>;

/** Admin-created lead from inside the dashboard. */
export const createLeadSchema = publicLeadSchema.extend({
  assignedToId: z.string().cuid2().or(z.string().min(1)).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

/** Partial update - status change and/or reassignment. */
export const updateLeadSchema = z.object({
  status: z.enum(leadStatusValues).optional(),
  assignedToId: z.string().min(1).nullable().optional(),
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(120).optional(),
  budget: z.coerce.number().int().nonnegative().optional(),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

/** Query-string params accepted by GET /api/leads. */
export const leadListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(leadStatusValues).optional(),
  assignedTo: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  source: z.enum(leadSourceValues).optional(),
  search: z.string().min(1).optional(),
});

export type LeadListQuery = z.infer<typeof leadListQuerySchema>;
