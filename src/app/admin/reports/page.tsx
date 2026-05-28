import { ReportsPageClient } from "./reports-client";
import { getYearlyBillSummary, getMonthlyHistory } from "@/actions/bills";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/renters");
  }

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
