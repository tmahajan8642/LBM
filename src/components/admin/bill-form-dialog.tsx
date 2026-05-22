"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { billSchema, type BillInput } from "@/lib/validations";
import { createBill, updateBill, getLastReading } from "@/actions/bills";
import { calculateBillAmount, formatCurrency, getYearsList } from "@/lib/utils";
import { useTranslations } from "@/components/providers/locale-provider";
import type { BillWithRenter } from "@/types";

interface RenterOption {
  id: string;
  meterNumber: string;
  user: { name: string };
}

interface BillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: BillWithRenter | null;
  renters: RenterOption[];
  onSuccess?: () => void;
}

export function BillFormDialog({
  open,
  onOpenChange,
  bill,
  renters,
  onSuccess,
}: BillFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const { t, getMonthName } = useTranslations();
  const isEdit = !!bill;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<BillInput>({
    resolver: zodResolver(billSchema),
    defaultValues: bill
      ? {
          renterId: bill.renterId,
          month: bill.month,
          year: bill.year,
          previousReading: bill.previousReading,
          currentReading: bill.currentReading,
          ratePerUnit: bill.ratePerUnit,
          fixedCharge: bill.fixedCharge,
          status: bill.status,
        }
      : {
          renterId: "",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          previousReading: 0,
          currentReading: 0,
          ratePerUnit: 8.5,
          fixedCharge: 150,
          status: "PENDING",
        },
  });

  const watched = useWatch({ control });
  const preview = calculateBillAmount(
    Number(watched.previousReading) || 0,
    Number(watched.currentReading) || 0,
    Number(watched.ratePerUnit) || 0,
    Number(watched.fixedCharge) || 0
  );

  useEffect(() => {
    if (!watched.renterId || isEdit) return;
    getLastReading(watched.renterId).then((reading) => {
      setValue("previousReading", reading);
    });
  }, [watched.renterId, isEdit, setValue]);

  const onSubmit = async (data: BillInput) => {
    setLoading(true);
    try {
      const result = isEdit
        ? await updateBill(bill!.id, data)
        : await createBill(data);

      if (result.success) {
        toast.success(isEdit ? t("admin.bills.updated") : t("admin.bills.created"));
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error ?? t("toast.error"));
      }
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("admin.bills.editBill") : t("admin.bills.newBill")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("admin.bills.renter")}</Label>
            <Select
              value={watched.renterId}
              onValueChange={(v) => setValue("renterId", v)}
              disabled={isEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.bills.selectRenter")} />
              </SelectTrigger>
              <SelectContent>
                {renters.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.user.name} ({r.meterNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.renterId && (
              <p className="text-sm text-destructive">{errors.renterId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("admin.bills.month")}</Label>
              <Select
                value={String(watched.month)}
                onValueChange={(v) => setValue("month", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {getMonthName(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("admin.bills.year")}</Label>
              <Select
                value={String(watched.year)}
                onValueChange={(v) => setValue("year", Number(v))}
              >
                <SelectTrigger>
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="previousReading">{t("admin.bills.previousReading")}</Label>
              <Input
                id="previousReading"
                type="number"
                step="0.01"
                {...register("previousReading", { valueAsNumber: true })}
              />
              {errors.previousReading && (
                <p className="text-sm text-destructive">
                  {errors.previousReading.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentReading">{t("admin.bills.currentReading")}</Label>
              <Input
                id="currentReading"
                type="number"
                step="0.01"
                {...register("currentReading", { valueAsNumber: true })}
              />
              {errors.currentReading && (
                <p className="text-sm text-destructive">
                  {errors.currentReading.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ratePerUnit">{t("admin.bills.ratePerUnit")}</Label>
              <Input
                id="ratePerUnit"
                type="number"
                step="0.01"
                {...register("ratePerUnit", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixedCharge">{t("admin.bills.fixedCharge")}</Label>
              <Input
                id="fixedCharge"
                type="number"
                step="0.01"
                {...register("fixedCharge", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("admin.bills.status")}</Label>
            <Select
              value={watched.status}
              onValueChange={(v) =>
                setValue("status", v as BillInput["status"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">{t("status.PENDING")}</SelectItem>
                <SelectItem value="PAID">{t("status.PAID")}</SelectItem>
                <SelectItem value="OVERDUE">{t("status.OVERDUE")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p>
              <strong>{t("admin.bills.unitsLabel")}:</strong> {preview.units.toFixed(2)}
            </p>
            <p>
              <strong>{t("admin.bills.totalLabel")}:</strong>{" "}
              {formatCurrency(preview.totalAmount)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.bills.calcPreview")}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            {isEdit ? t("admin.bills.updateBill") : t("admin.bills.generateBill")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
