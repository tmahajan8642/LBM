"use client";

import { Users, FileText, Clock, CheckCircle, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { StatCard } from "@/components/shared/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { BillsTable } from "@/components/admin/bills-table";
import { useTranslations } from "@/components/providers/locale-provider";
import { formatCurrency } from "@/lib/utils";
import type { BillWithRenter, DashboardStats } from "@/types";

interface DashboardClientProps {
  stats: DashboardStats;
  bills: BillWithRenter[];
}

export function DashboardClient({ stats, bills }: DashboardClientProps) {
  const { t } = useTranslations();

  return (
    <div>
      <DashboardHeader
        title={t("admin.dashboard.title")}
        description={t("admin.dashboard.description")}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("admin.dashboard.totalRenters")} value={stats.totalRenters} icon={Users} />
        <StatCard title={t("admin.dashboard.totalBills")} value={stats.totalBills} icon={FileText} />
        <StatCard
          title={t("admin.dashboard.pendingBills")}
          value={stats.pendingBills}
          icon={Clock}
          description={t("admin.dashboard.paidCount", { count: stats.paidBills })}
        />
        <StatCard
          title={t("admin.dashboard.totalRevenue")}
          value={formatCurrency(stats.totalRevenue)}
          icon={IndianRupee}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.monthlyRevenue")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={stats.monthlyRevenue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("admin.dashboard.quickStats")}</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span className="text-sm text-muted-foreground">
                {t("admin.dashboard.paidBills")}
              </span>
              <span className="font-semibold">{stats.paidBills}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span className="text-sm text-muted-foreground">
                {t("admin.dashboard.pendingBills")}
              </span>
              <span className="font-semibold text-yellow-600">{stats.pendingBills}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span className="text-sm text-muted-foreground">
                {t("admin.dashboard.collectionRate")}
              </span>
              <span className="font-semibold">
                {stats.totalBills > 0
                  ? `${Math.round((stats.paidBills / stats.totalBills) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold">{t("admin.dashboard.recentBills")}</h2>
        <BillsTable bills={bills} showRenter readonly />
      </div>
    </div>
  );
}
