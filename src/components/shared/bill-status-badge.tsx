"use client";

import { Badge } from "@/components/ui/badge";
import type { BillStatus } from "@prisma/client";
import { useTranslations } from "@/components/providers/locale-provider";

const statusVariants: Record<
  BillStatus,
  "default" | "success" | "warning" | "destructive"
> = {
  PAID: "success",
  PENDING: "warning",
  OVERDUE: "destructive",
};

export function BillStatusBadge({ status }: { status: BillStatus }) {
  const { t } = useTranslations();
  return (
    <Badge variant={statusVariants[status]}>{t(`status.${status}`)}</Badge>
  );
}
