import { NextRequest } from "next/server";
import { publicLeadSchema } from "@/schemas/lead.schema";
import { createPublicLead } from "@/lib/services/lead.service";
import { jsonError, jsonOk } from "@/lib/api-response";

// POST /api/public/leads: no authentication, this is the endpoint the
// marketing site's capture form submits to. Anyone can call it, so
// input is validated strictly and nothing here trusts the caller.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = publicLeadSchema.parse(body);
    const lead = await createPublicLead(input);
    return jsonOk({ id: lead.id }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
