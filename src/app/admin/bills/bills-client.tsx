"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { BillFilters } from "@/components/admin/bill-filters";
import { BillsTable } from "@/components/admin/bills-table";
import { BillFormDialog } from "@/components/admin/bill-form-dialog";
import { Pagination } from "@/components/shared/pagination";
import { useTranslations } from "@/components/providers/locale-provider";
import type { BillWithRenter } from "@/types";

interface RenterOption {
  id: string;
  meterNumber: string;
  user: { name: string };
}

interface BillsPageClientProps {
  bills: BillWithRenter[];
  renters: RenterOption[];
  page: number;
  totalPages: number;
  total: number;
}

export function BillsPageClient({
  bills,
  renters,
  page,
  totalPages,
  total,
}: BillsPageClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<BillWithRenter | null>(null);
  const { t } = useTranslations();

  return (
    <div>
      <DashboardHeader
        title={t("admin.bills.title")}
        description={
          total === 1
            ? t("admin.bills.found", { count: total })
            : t("admin.bills.foundPlural", { count: total })
        }
      >
        <Button
          onClick={() => {
            setEditingBill(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.bills.generateBill")}
        </Button>
      </DashboardHeader>

      <div className="mb-6">
        <BillFilters />
      </div>

      <BillsTable
        bills={bills}
        onEdit={(bill) => {
          setEditingBill(bill);
          setDialogOpen(true);
        }}
      />

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} />
      </div>

      <BillFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bill={editingBill}
        renters={renters}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
