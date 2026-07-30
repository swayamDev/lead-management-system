import { NextRequest } from "next/server";
import { requireUser } from "@/lib/get-session";
import { updateLeadSchema } from "@/schemas/lead.schema";
import { deleteLead, getLeadForUser, updateLead } from "@/lib/services/lead.service";
import { jsonError, jsonOk } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

// GET /api/leads/:id
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const lead = await getLeadForUser(user, id);
    return jsonOk(lead);
  } catch (error) {
    return jsonError(error);
  }
}

// PATCH /api/leads/:id: status change, reassignment, or field edits.
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const input = updateLeadSchema.parse(body);
    const lead = await updateLead(user, id, input);
    return jsonOk(lead);
  } catch (error) {
    return jsonError(error);
  }
}

// DELETE /api/leads/:id: admin only.
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteLead(user, id);
    return jsonOk({ id });
  } catch (error) {
    return jsonError(error);
  }
}
