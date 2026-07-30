import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/lib/get-session";
import { getLeadForUser } from "@/lib/services/lead.service";
import { listActivity } from "@/lib/services/activity.service";
import { listUsers } from "@/lib/services/user.service";
import { permissions } from "@/lib/permissions";
import { LeadStatusSelect } from "@/components/dashboard/lead-status-select";
import { LeadAssignSelect } from "@/components/dashboard/lead-assign-select";
import { NotesPanel } from "@/components/dashboard/notes-panel";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const lead = await getLeadForUser(user, id);
  const [activity, teamMembers] = await Promise.all([
    listActivity(id),
    permissions.canAssignLead(user.role) ? listUsers(user) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/leads" className="text-sm text-muted-foreground hover:underline">
          &larr; Back to leads
        </Link>
        <h1 className="mt-1 font-heading text-xl font-semibold">{lead.name}</h1>
        <p className="text-sm text-muted-foreground">{lead.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Company</p>
              <p>{lead.company ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p>{lead.phone ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Budget</p>
              <p>{lead.budget != null ? `$${lead.budget.toLocaleString()}` : "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Source</p>
              <p>{lead.source.replaceAll("_", " ")}</p>
            </div>
            {lead.message && (
              <div>
                <p className="text-muted-foreground">Message</p>
                <p>{lead.message}</p>
              </div>
            )}

            <Separator />

            <div>
              <p className="mb-1 text-muted-foreground">Status</p>
              <LeadStatusSelect leadId={lead.id} status={lead.status} />
            </div>

            {permissions.canAssignLead(user.role) && (
              <div>
                <p className="mb-1 text-muted-foreground">Assigned to</p>
                <LeadAssignSelect
                  leadId={lead.id}
                  assignedToId={lead.assignedToId}
                  teamMembers={teamMembers.map((m) => ({ id: m.id, name: m.name }))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <NotesPanel
              leadId={lead.id}
              notes={lead.notes.map((n) => ({
                id: n.id,
                text: n.text,
                createdAt: n.createdAt.toISOString(),
                author: { id: n.author.id, name: n.author.name },
              }))}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline
              items={activity.map((a) => ({
                id: a.id,
                type: a.type,
                message: a.message,
                createdAt: a.createdAt.toISOString(),
                actor: a.actor ? { id: a.actor.id, name: a.actor.name } : null,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
