"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type LeadRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: string;
  source: string;
  createdAt: string;
  assignedTo: { id: string; name: string } | null;
};

const statusTone: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  NEW: "secondary",
  CONTACTED: "outline",
  QUALIFIED: "outline",
  PROPOSAL_SENT: "outline",
  NEGOTIATION: "outline",
  WON: "default",
  LOST: "destructive",
};

export const leadColumns: ColumnDef<LeadRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/dashboard/leads/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => row.original.company ?? <span className="text-muted-foreground">-</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusTone[row.original.status] ?? "outline"}>
        {row.original.status.replaceAll("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned to",
    cell: ({ row }) =>
      row.original.assignedTo?.name ?? <span className="text-muted-foreground">Unassigned</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
];
