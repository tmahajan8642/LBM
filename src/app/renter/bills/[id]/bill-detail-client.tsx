"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillStatusBadge } from "@/components/shared/bill-status-badge";
import { BillDetailActions } from "./bill-detail-actions";
import { useTranslations } from "@/components/providers/locale-provider";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BillWithRenter } from "@/types";

export function BillDetailClient({ bill }: { bill: BillWithRenter }) {
  const { t, getMonthName } = useTranslations();

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/renter/bills">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("renter.billDetail.back")}
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t("renter.billDetail.billTitle", {
              month: getMonthName(bill.month),
              year: bill.year,
            })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("renter.billDetail.generatedOn", {
              date: formatDate(bill.createdAt),
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BillStatusBadge status={bill.status} />
          <BillDetailActions bill={bill} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("renter.billDetail.meterReadings")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span className="text-muted-foreground">
                {t("renter.billDetail.previousReading")}
              </span>
              <span className="font-medium">
                {bill.previousReading} {t("common.units")}
              </span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span className="text-muted-foreground">
                {t("renter.billDetail.currentReading")}
              </span>
              <span className="font-medium">
                {bill.currentReading} {t("common.units")}
              </span>
            </div>
            <div className="flex justify-between rounded-lg bg-primary/10 p-3">
              <span className="font-medium">{t("renter.billDetail.unitsConsumed")}</span>
              <span className="font-bold">
                {bill.units.toFixed(2)} {t("common.units")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("renter.billDetail.charges")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span className="text-muted-foreground">
                {t("renter.billDetail.ratePerUnit")}
              </span>
              <span className="font-medium">{formatCurrency(bill.ratePerUnit)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span className="text-muted-foreground">
                {t("renter.billDetail.fixedCharge")}
              </span>
              <span className="font-medium">{formatCurrency(bill.fixedCharge)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span className="text-muted-foreground">Room Rent</span>
              <span className="font-medium">{formatCurrency(bill.roomRent ?? 0)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-primary/10 p-3">
              <span className="font-medium">{t("renter.billDetail.totalAmount")}</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(bill.totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("renter.billDetail.yourDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("renter.billDetail.meterNumber")}
              </p>
              <p className="font-medium">{bill.renter.meterNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Room Number</p>
              <p className="font-medium">{bill.renter.roomNumber || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.renters.address")}</p>
              <p className="font-medium">{bill.renter.address}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">{t("common.formula")}</p>
    </div>
  );
}
