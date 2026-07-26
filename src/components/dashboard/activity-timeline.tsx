type ActivityItem = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  actor: { id: string; name: string } | null;
};

const typeLabel: Record<string, string> = {
  LEAD_CREATED: "Created",
  STATUS_CHANGED: "Status changed",
  ASSIGNED: "Assigned",
  UNASSIGNED: "Unassigned",
  NOTE_ADDED: "Note added",
};

/**
 * Read-only, append-only trail - there is no edit or delete affordance
 * here on purpose, mirroring that the underlying Activity rows are
 * never mutated once written.
 */
export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-4 border-l pl-4">
      {items.map((item) => (
        <li key={item.id} className="relative text-sm">
          <span className="absolute -left-[21px] top-1 size-2 rounded-full bg-primary" />
          <p>
            <span className="font-medium">{typeLabel[item.type] ?? item.type}</span>
            {" - "}
            <span className="text-muted-foreground">{item.message}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {item.actor?.name ?? "System"} - {new Date(item.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ol>
  );
}
