import { NextRequest } from "next/server";
import { requireUser } from "@/lib/get-session";
import { createLeadSchema, leadListQuerySchema } from "@/schemas/lead.schema";
import { createLead, listLeads } from "@/lib/services/lead.service";
import { jsonError, jsonOk } from "@/lib/api-response";

/**
 * GET /api/leads?page=1&perPage=20&status=won&assignedTo=<id>&company=Acme&source=LINKEDIN&search=jane
 * Returns a paginated, filtered list. Admins see every lead; members
 * only ever see leads assigned to them (enforced in the service layer,
 * not just by the query params the client happens to send).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const query = leadListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    const result = await listLeads(user, query);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}

/** POST /api/leads - admin-only manual lead creation. */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const input = createLeadSchema.parse(body);
    const lead = await createLead(user, input);
    return jsonOk(lead, 201);
  } catch (error) {
    return jsonError(error);
  }
}
