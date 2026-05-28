import { Suspense } from "react";
import { BillsPageClient } from "./bills-client";
import { getBills } from "@/actions/bills";
import { getRentersForSelect } from "@/actions/renters";
import type { BillStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    year?: string;
    month?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminBillsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROPERTY_OWNER") {
    redirect("/admin/dashboard");
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [{ bills, total, totalPages }, renters] = await Promise.all([
    getBills({
      search: params.search,
      year: params.year ? Number(params.year) : undefined,
      month: params.month ? Number(params.month) : undefined,
      status:
        params.status && params.status !== "all"
          ? (params.status as BillStatus)
          : undefined,
      page,
      limit: 10,
    }),
    getRentersForSelect(),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillsPageClient
        bills={bills}
        renters={renters}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    </Suspense>
  );
}
