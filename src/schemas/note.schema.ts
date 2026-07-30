import { z } from "zod";

export const createNoteSchema = z.object({
  text: z.string().trim().min(1, "Note can't be empty").max(4000),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
