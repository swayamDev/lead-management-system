import prisma from "@/lib/prisma";
import type { CurrentUser } from "@/lib/get-session";
import { getLeadForUser } from "@/lib/services/lead.service";
import { recordActivity } from "@/lib/services/activity.service";
import { permissions, ForbiddenError } from "@/lib/permissions";
import type { CreateNoteInput } from "@/schemas/note.schema";

export async function addNote(user: CurrentUser, leadId: string, input: CreateNoteInput) {
  if (!permissions.canAddNote(user.role)) {
    throw new ForbiddenError("You do not have permission to add notes.");
  }

  // Reuses the same access check as reading the lead: a member can only
  // add notes to leads assigned to them, an admin can note any lead.
  await getLeadForUser(user, leadId);

  const note = await prisma.note.create({
    data: {
      leadId,
      authorId: user.id,
      text: input.text,
    },
    include: { author: { select: { id: true, name: true } } },
  });

  await recordActivity({
    leadId,
    type: "NOTE_ADDED",
    message: `${user.name} added a note`,
    actorId: user.id,
  });

  return note;
}

export async function listNotes(user: CurrentUser, leadId: string) {
  await getLeadForUser(user, leadId);
  return prisma.note.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true } } },
  });
}
