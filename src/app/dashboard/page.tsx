import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/get-session";
import prisma from "@/lib/prisma";

export const metadata = { title: "Overview | Digital Heroes CRM" };

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";

  const where = isAdmin ? {} : { assignedToId: user.id };

  const [total, won, contacted, unassigned] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.count({ where: { ...where, status: "WON" } }),
    prisma.lead.count({ where: { ...where, status: "CONTACTED" } }),
    isAdmin ? prisma.lead.count({ where: { assignedToId: null } }) : Promise.resolve(0),
  ]);

  const cards = [
    { label: isAdmin ? "Total leads" : "Assigned to you", value: total },
    { label: "Won", value: won },
    { label: "Contacted", value: contacted },
    ...(isAdmin ? [{ label: "Unassigned", value: unassigned }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Here's how the pipeline looks across the whole team."
            : "Here's what's on your plate today."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="font-heading text-2xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  );
}
