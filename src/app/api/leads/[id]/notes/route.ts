import { NextRequest } from "next/server";
import { requireUser } from "@/lib/get-session";
import { createNoteSchema } from "@/schemas/note.schema";
import { addNote, listNotes } from "@/lib/services/note.service";
import { jsonError, jsonOk } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

// GET /api/leads/:id/notes
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const notes = await listNotes(user, id);
    return jsonOk(notes);
  } catch (error) {
    return jsonError(error);
  }
}

// POST /api/leads/:id/notes
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const input = createNoteSchema.parse(body);
    const note = await addNote(user, id, input);
    return jsonOk(note, 201);
  } catch (error) {
    return jsonError(error);
  }
}
