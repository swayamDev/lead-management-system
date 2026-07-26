import { NextRequest } from "next/server";
import { requireUser } from "@/lib/get-session";
import { getLeadForUser } from "@/lib/services/lead.service";
import { listActivity } from "@/lib/services/activity.service";
import { jsonError, jsonOk } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

/** GET /api/leads/:id/activity - the full audit trail for one lead. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await getLeadForUser(user, id); // 403s a member trying another user's lead
    const activity = await listActivity(id);
    return jsonOk(activity);
  } catch (error) {
    return jsonError(error);
  }
}
