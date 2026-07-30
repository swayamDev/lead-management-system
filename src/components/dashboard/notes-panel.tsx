"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Note = {
  id: string;
  text: string;
  createdAt: string;
  author: { id: string; name: string };
};

export function NotesPanel({ leadId, notes }: { leadId: string; notes: Note[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Could not add note.");
      }
      setText("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add note.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <Textarea
          placeholder="Add a note about this lead..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
        <Button type="submit" size="sm" disabled={submitting} className="self-end">
          {submitting ? "Adding..." : "Add note"}
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        {notes.length === 0 && (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="rounded-none border p-3 text-sm">
            <p>{note.text}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {note.author.name} · {new Date(note.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
