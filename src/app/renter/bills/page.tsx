import { Suspense } from "react";
import { RenterBillsClient } from "./bills-client";
import { getBills, getRenterDashboardStats } from "@/actions/bills";
import type { BillStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function RenterBillsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [billData, stats] = await Promise.all([
    getBills({
      year: params.year ? Number(params.year) : undefined,
      month: params.month ? Number(params.month) : undefined,
      status:
        params.status && params.status !== "all"
          ? (params.status as BillStatus)
          : undefined,
      page,
      limit: 10,
    }),
    getRenterDashboardStats(),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RenterBillsClient
        bills={billData.bills}
        page={page}
        totalPages={billData.totalPages}
        total={billData.total}
        stats={stats}
      />
    </Suspense>
  );
}
