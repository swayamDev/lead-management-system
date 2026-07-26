import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Separator } from "@/components/ui/separator";

/**
 * Everything under /dashboard is authenticated (also enforced by
 * middleware.ts at the edge). This layout re-checks the session
 * server-side because middleware only proves "has a cookie", not
 * "cookie is a valid, current session" - the source of truth is here.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as unknown as { name: string; role: "ADMIN" | "MEMBER" };

  return (
    <SidebarProvider>
      <AppSidebar role={user.role} name={user.name} />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">Dashboard</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
