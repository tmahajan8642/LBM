"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { BillStatusBadge } from "@/components/shared/bill-status-badge";
import { formatCurrency, getYearsList } from "@/lib/utils";
import { useTranslations } from "@/components/providers/locale-provider";
import type { BillStatus } from "@prisma/client";

interface YearlySummary {
  year: number;
  total: number;
  count: number;
  paid: number;
}

interface MonthlyBillSummary {
  totalAmount: number;
  units: number;
  status: BillStatus;
}

interface MonthlyEntry {
  month: number;
  monthName: string;
  bill?: MonthlyBillSummary | null;
}

interface ReportsPageClientProps {
  yearlySummary: YearlySummary[];
  monthlyHistory: MonthlyEntry[];
  selectedYear: number;
}

export function ReportsPageClient({
  yearlySummary,
  monthlyHistory,
  selectedYear,
}: ReportsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslations();

  const updateYear = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year);
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <DashboardHeader
        title={t("admin.reports.title")}
        description={t("admin.reports.description")}
      >
        <Select value={String(selectedYear)} onValueChange={updateYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getYearsList(5).map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DashboardHeader>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">{t("admin.reports.yearlySummary")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {yearlySummary.length === 0 ? (
            <p className="text-muted-foreground">{t("common.noData")}</p>
          ) : (
            yearlySummary.map((year) => (
              <Card key={year.year}>
                <CardHeader>
                  <CardTitle>{year.year}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("admin.reports.totalBills")}</span>
                    <span className="font-medium">{year.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("admin.reports.paid")}</span>
                    <span className="font-medium">{year.paid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("admin.reports.revenue")}</span>
                    <span className="font-medium">{formatCurrency(year.total)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          {t("admin.reports.monthlyHistory", { year: selectedYear })}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {monthlyHistory.map((entry) => (
            <Card
              key={entry.month}
              className={entry.bill ? "" : "opacity-50"}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{entry.monthName}</CardTitle>
              </CardHeader>
              <CardContent>
                {entry.bill ? (
                  <div className="space-y-1 text-sm">
                    <p>{formatCurrency(entry.bill.totalAmount)}</p>
                    <p className="text-muted-foreground">
                      {entry.bill.units.toFixed(2)} units
                    </p>
                    <BillStatusBadge status={entry.bill.status} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("admin.reports.noBill")}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
