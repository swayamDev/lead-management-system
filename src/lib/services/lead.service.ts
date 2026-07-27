import prisma from "@/lib/prisma";
import type { CurrentUser } from "@/lib/get-session";
import { canAccessLead, permissions, ForbiddenError } from "@/lib/permissions";
import { NotFoundError } from "@/lib/api-response";
import { recordActivity } from "@/lib/services/activity.service";
import type {
  CreateLeadInput,
  LeadListQuery,
  PublicLeadInput,
  UpdateLeadInput,
} from "@/schemas/lead.schema";

/** Anyone can submit the public capture form - no auth, no permission check. */
export async function createPublicLead(input: PublicLeadInput) {
  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      company: input.company || null,
      message: input.message || null,
      budget: input.budget ?? null,
      source: input.source,
    },
  });

  await recordActivity({
    leadId: lead.id,
    type: "LEAD_CREATED",
    message: `Lead submitted the public capture form`,
  });

  return lead;
}

/** Admin-only: create a lead manually from inside the dashboard. */
export async function createLead(user: CurrentUser, input: CreateLeadInput) {
  if (!permissions.canCreateLeadManually(user.role)) {
    throw new ForbiddenError("Only admins can create leads manually.");
  }

  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      company: input.company || null,
      message: input.message || null,
      budget: input.budget ?? null,
      source: input.source,
      assignedToId: input.assignedToId ?? null,
    },
  });

  await recordActivity({
    leadId: lead.id,
    type: "LEAD_CREATED",
    message: `${user.name} created this lead`,
    actorId: user.id,
  });

  if (input.assignedToId) {
    await recordActivity({
      leadId: lead.id,
      type: "ASSIGNED",
      message: `Assigned on creation`,
      actorId: user.id,
    });
  }

  return lead;
}

/**
 * Paginated, filterable list. Admins see every lead; members only ever
 * see their own assigned leads - that scoping happens in the `where`
 * clause below, not just by hiding rows in the UI.
 */
export async function listLeads(user: CurrentUser, query: LeadListQuery) {
  const where: Record<string, unknown> = {};

  if (user.role !== "ADMIN") {
    where.assignedToId = user.id;
  } else if (query.assignedTo) {
    where.assignedToId = query.assignedTo;
  }

  if (query.status) where.status = query.status;
  if (query.source) where.source = query.source;
  if (query.company) {
    where.company = { contains: query.company, mode: "insensitive" };
  }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { company: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const skip = (query.page - 1) * query.perPage;

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      skip,
      take: query.perPage,
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return {
    leads,
    pagination: {
      page: query.page,
      perPage: query.perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.perPage)),
    },
  };
}

export async function getLeadOr404(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { id: true, name: true } } } },
    },
  });
  if (!lead) throw new NotFoundError("Lead not found");
  return lead;
}

export async function getLeadForUser(user: CurrentUser, leadId: string) {
  const lead = await getLeadOr404(leadId);
  if (!canAccessLead(user, lead)) {
    throw new ForbiddenError("You do not have access to this lead.");
  }
  return lead;
}

export async function updateLead(user: CurrentUser, leadId: string, input: UpdateLeadInput) {
  const lead = await getLeadOr404(leadId);
  if (!canAccessLead(user, lead)) {
    throw new ForbiddenError("You do not have access to this lead.");
  }

  if (input.status !== undefined && !permissions.canChangeLeadStatus(user.role)) {
    throw new ForbiddenError("You do not have permission to change this lead's status.");
  }

  if (input.assignedToId !== undefined && !permissions.canAssignLead(user.role)) {
    throw new ForbiddenError("Only admins can assign leads.");
  }

  const { status, assignedToId, ...rest } = input;

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: { ...rest, ...(status ? { status } : {}), ...(assignedToId !== undefined ? { assignedToId } : {}) },
  });

  if (status && status !== lead.status) {
    await recordActivity({
      leadId,
      type: "STATUS_CHANGED",
      message: `Status changed from ${lead.status} to ${status}`,
      actorId: user.id,
    });
  }

  if (assignedToId !== undefined && assignedToId !== lead.assignedToId) {
    await recordActivity({
      leadId,
      type: assignedToId ? "ASSIGNED" : "UNASSIGNED",
      message: assignedToId ? `Reassigned to a new team member` : `Unassigned`,
      actorId: user.id,
    });
  }

  return updated;
}

export async function deleteLead(user: CurrentUser, leadId: string) {
  if (!permissions.canDeleteLead(user.role)) {
    throw new ForbiddenError("Only admins can delete leads.");
  }
  const lead = await getLeadOr404(leadId);
  await prisma.lead.delete({ where: { id: leadId } });
  return lead;
}
