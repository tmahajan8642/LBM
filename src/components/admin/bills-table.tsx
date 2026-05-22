"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BillStatusBadge } from "@/components/shared/bill-status-badge";
import { downloadBillPDF } from "@/lib/pdf";
import { deleteBill } from "@/actions/bills";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "@/components/providers/locale-provider";
import type { BillWithRenter } from "@/types";

interface BillsTableProps {
  bills: BillWithRenter[];
  onEdit?: (bill: BillWithRenter) => void;
  showRenter?: boolean;
  readonly?: boolean;
}

export function BillsTable({
  bills,
  onEdit,
  showRenter = true,
  readonly = false,
}: BillsTableProps) {
  const router = useRouter();
  const { t, getMonthName } = useTranslations();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.bills.deleteConfirm"))) return;
    setDeletingId(id);
    try {
      await deleteBill(id);
      toast.success(t("admin.bills.deleted"));
      router.refresh();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setDeletingId(null);
    }
  };

  if (bills.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        {t("admin.bills.noBills")}
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {showRenter && <TableHead>{t("admin.bills.renter")}</TableHead>}
            <TableHead>{t("admin.bills.period")}</TableHead>
            <TableHead>{t("admin.bills.unitsLabel")}</TableHead>
            <TableHead>{t("admin.bills.amount")}</TableHead>
            <TableHead>{t("admin.bills.status")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill) => (
            <TableRow key={bill.id}>
              {showRenter && (
                <TableCell>
                  <div>
                    <p className="font-medium">{bill.renter.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {bill.renter.meterNumber}
                    </p>
                  </div>
                </TableCell>
              )}
              <TableCell>
                {getMonthName(bill.month)} {bill.year}
              </TableCell>
              <TableCell>{bill.units.toFixed(2)}</TableCell>
              <TableCell>{formatCurrency(bill.totalAmount)}</TableCell>
              <TableCell>
                <BillStatusBadge status={bill.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {readonly && (
                    <Button variant="ghost" size="icon" asChild title={t("common.view")}>
                      <Link href={`/renter/bills/${bill.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => downloadBillPDF(bill)}
                    title={t("common.downloadPdf")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {!readonly && onEdit && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(bill)}
                        title={t("common.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(bill.id)}
                        disabled={deletingId === bill.id}
                        title={t("common.delete")}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
