"use client";

import Link from "next/link";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { StatCard } from "@/components/shared/stat-card";
import { BillFilters } from "@/components/admin/bill-filters";
import { BillsTable } from "@/components/admin/bills-table";
import { Pagination } from "@/components/shared/pagination";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "@/components/providers/locale-provider";
import type { BillWithRenter } from "@/types";

interface LatestBillSummary {
  id: string;
  month: number;
  year: number;
  totalAmount: number;
}

interface RenterBillsClientProps {
  bills: BillWithRenter[];
  page: number;
  totalPages: number;
  total: number;
  stats: {
    totalBills: number;
    pendingBills: number;
    paidBills: number;
    totalDue: number;
    latestBill: LatestBillSummary | null;
  };
}

export function RenterBillsClient({
  bills,
  page,
  totalPages,
  total,
  stats,
}: RenterBillsClientProps) {
  const { t, getMonthName } = useTranslations();

  return (
    <div>
      <DashboardHeader
        title={t("renter.bills.title")}
        description={t("renter.bills.description")}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("renter.bills.totalBills")} value={stats.totalBills} icon={FileText} />
        <StatCard title={t("renter.bills.pending")} value={stats.pendingBills} icon={Clock} />
        <StatCard title={t("renter.bills.paid")} value={stats.paidBills} icon={CheckCircle} />
        <StatCard
          title={t("renter.bills.amountDue")}
          value={formatCurrency(stats.totalDue)}
          icon={AlertCircle}
        />
      </div>

      {stats.latestBill && (
        <div className="mb-6 rounded-lg border bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">{t("renter.bills.latestBill")}</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">
              {getMonthName(stats.latestBill.month)} {stats.latestBill.year} —{" "}
              {formatCurrency(stats.latestBill.totalAmount)}
            </p>
            <Link
              href={`/renter/bills/${stats.latestBill.id}`}
              className="text-sm text-primary hover:underline"
            >
              {t("renter.bills.viewDetails")}
            </Link>
          </div>
        </div>
      )}

      <div className="mb-6">
        <BillFilters />
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {total === 1
          ? t("admin.bills.found", { count: total })
          : t("admin.bills.foundPlural", { count: total })}
      </p>

      <BillsTable bills={bills} showRenter={false} readonly />

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
