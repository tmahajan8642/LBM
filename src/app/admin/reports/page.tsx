import { ReportsPageClient } from "./reports-client";
import { getYearlyBillSummary, getMonthlyHistory } from "@/actions/bills";

interface PageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const year = params.year ? Number(params.year) : new Date().getFullYear();

  const [yearlySummary, monthlyHistory] = await Promise.all([
    getYearlyBillSummary(),
    getMonthlyHistory(year),
  ]);

  return (
    <ReportsPageClient
      yearlySummary={yearlySummary}
      monthlyHistory={monthlyHistory}
      selectedYear={year}
    />
  );
}
