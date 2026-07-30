import { NextRequest } from "next/server";
import { requireUser } from "@/lib/get-session";
import { createUserSchema } from "@/schemas/user.schema";
import { createUser, listUsers } from "@/lib/services/user.service";
import { jsonError, jsonOk } from "@/lib/api-response";

// GET /api/admin/users: admin only.
export async function GET() {
  try {
    const admin = await requireUser();
    const users = await listUsers(admin);
    return jsonOk(users);
  } catch (error) {
    return jsonError(error);
  }
}

// POST /api/admin/users: admin only. Provisions an Admin or Member account.
export async function POST(request: NextRequest) {
  try {
    const admin = await requireUser();
    const body = await request.json();
    const input = createUserSchema.parse(body);
    const user = await createUser(admin, input);
    return jsonOk({ id: user.id, email: user.email, role: user.role }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
