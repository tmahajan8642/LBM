"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  Menu,
  X,
  User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  role: "ADMIN" | "PROPERTY_OWNER" | "RENTER";
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslations();

  const adminLinks = [
    { href: "/admin/dashboard", label: t("admin.nav.dashboard"), icon: LayoutDashboard },
    { href: "/admin/reports", label: t("admin.nav.reports"), icon: BarChart3 },
    { href: "/admin/property-owners", label: "Property Owners", icon: Users },
  ];

  const propertyOwnerLinks = [
    { href: "/admin/renters", label: t("admin.nav.renters"), icon: Users },
    { href: "/admin/bills", label: t("admin.nav.bills"), icon: FileText },
    { href: "/admin/settings", label: t("admin.nav.settings"), icon: Settings },
  ];

  const renterLinks = [
    { href: "/renter/bills", label: t("renter.nav.myBills"), icon: FileText },
    { href: "/renter/profile", label: t("renter.nav.profile"), icon: User },
  ];

  const links =
    role === "ADMIN" ? adminLinks : role === "PROPERTY_OWNER" ? propertyOwnerLinks : renterLinks;

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Zap className="h-6 w-6 text-primary" />
        <span className="font-bold">{t("common.appName")}</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3">
          <LanguageSwitcher className="w-full" />
        </div>
        <div className="mb-3 flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{session?.user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("common.logout")}
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b px-4 xl:hidden">
        <div className="flex items-center gap-2 font-bold text-primary">
          <Zap className="h-5 w-5" />
          {t("common.appName")}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 xl:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform xl:static xl:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
