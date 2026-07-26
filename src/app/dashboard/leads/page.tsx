import { requireUser } from "@/lib/get-session";
import { listLeads } from "@/lib/services/lead.service";
import { listUsers } from "@/lib/services/user.service";
import { leadListQuerySchema } from "@/schemas/lead.schema";
import { LeadsDataTable } from "@/components/dashboard/leads-data-table";
import { LeadFilters } from "@/components/dashboard/lead-filters";
import { LeadsPagination } from "@/components/dashboard/leads-pagination";
import { CreateLeadDialog } from "@/components/dashboard/create-lead-dialog";

export const metadata = { title: "Leads | Digital Heroes CRM" };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const query = leadListQuerySchema.parse(params);

  const { leads, pagination } = await listLeads(user, query);
  const teamMembers = user.role === "ADMIN" ? await listUsers(user) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {user.role === "ADMIN"
              ? "Every lead in the pipeline."
              : "Leads currently assigned to you."}
          </p>
        </div>
        {user.role === "ADMIN" && (
          <CreateLeadDialog teamMembers={teamMembers.map((m) => ({ id: m.id, name: m.name }))} />
        )}
      </div>

      <LeadFilters />

      <LeadsDataTable
        data={leads.map((lead) => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          company: lead.company,
          status: lead.status,
          source: lead.source,
          createdAt: lead.createdAt.toISOString(),
          assignedTo: lead.assignedTo ? { id: lead.assignedTo.id, name: lead.assignedTo.name } : null,
        }))}
      />

      <LeadsPagination page={pagination.page} totalPages={pagination.totalPages} />
    </div>
  );
}
