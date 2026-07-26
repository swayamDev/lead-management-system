import prisma from "@/lib/prisma";
import type { ActivityType } from "@/generated/prisma/enums";

/**
 * Every meaningful change to a lead writes one row here. Nothing is ever
 * updated or deleted from this table - it's an append-only trail, the
 * same way GitHub's issue timeline never disappears.
 */
export async function recordActivity(params: {
  leadId: string;
  type: ActivityType;
  message: string;
  actorId?: string | null;
}) {
  return prisma.activity.create({
    data: {
      leadId: params.leadId,
      type: params.type,
      message: params.message,
      actorId: params.actorId ?? null,
    },
  });
}

export async function listActivity(leadId: string) {
  return prisma.activity.findMany({
    where: { leadId },
    orderBy: { createdAt: "asc" },
    include: { actor: { select: { id: true, name: true } } },
  });
}
