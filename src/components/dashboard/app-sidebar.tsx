"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HugeiconsIcon,
} from "@hugeicons/react";
import {
  Analytics01Icon,
  DashboardSquare01Icon,
  Logout01Icon,
  UserGroupIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { Role } from "@/generated/prisma/enums";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: DashboardSquare01Icon, adminOnly: false },
  { href: "/dashboard/leads", label: "Leads", icon: UserGroupIcon, adminOnly: false },
  { href: "/dashboard/admin/users", label: "Team", icon: UserMultiple02Icon, adminOnly: true },
];

export function AppSidebar({ role, name }: { role: Role; name: string }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-none bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Analytics01Icon} size={16} />
          </div>
          <span className="font-heading text-sm font-semibold">Digital Heroes CRM</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter((item) => !item.adminOnly || role === "ADMIN")
                .map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      render={<Link href={item.href} />}
                    >
                      <HugeiconsIcon icon={item.icon} size={16} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-2 px-3 py-3">
        <div className="flex flex-col text-xs">
          <span className="font-medium">{name}</span>
          <span className="text-muted-foreground">{role === "ADMIN" ? "Admin" : "Member"}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await authClient.signOut();
            router.push("/login");
            router.refresh();
          }}
        >
          <HugeiconsIcon icon={Logout01Icon} size={14} />
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
