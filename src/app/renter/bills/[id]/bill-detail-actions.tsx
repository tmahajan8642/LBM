"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadBillPDF } from "@/lib/pdf";
import { useTranslations } from "@/components/providers/locale-provider";
import type { BillWithRenter } from "@/types";

export function BillDetailActions({ bill }: { bill: BillWithRenter }) {
  const { t } = useTranslations();

  return (
    <Button onClick={() => downloadBillPDF(bill)}>
      <Download className="mr-2 h-4 w-4" />
      {t("common.downloadPdf")}
    </Button>
  );
}
