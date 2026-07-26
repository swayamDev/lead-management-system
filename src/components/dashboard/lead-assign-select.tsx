"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UNASSIGNED = "__unassigned__";

export function LeadAssignSelect({
  leadId,
  assignedToId,
  teamMembers,
}: {
  leadId: string;
  assignedToId: string | null;
  teamMembers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  async function onChange(value: string | null) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: !value || value === UNASSIGNED ? null : value }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Could not reassign lead.");
      }
      toast.success("Lead reassigned");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reassign lead.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Select value={assignedToId ?? UNASSIGNED} onValueChange={onChange} disabled={updating}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
        {teamMembers.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
