"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { renterSchema, type RenterInput } from "@/lib/validations";
import { createRenter, updateRenter } from "@/actions/renters";
import { useTranslations } from "@/components/providers/locale-provider";
import type { RenterWithUser } from "@/types";

interface RenterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renter?: RenterWithUser | null;
  onSuccess?: () => void;
}

export function RenterFormDialog({
  open,
  onOpenChange,
  renter,
  onSuccess,
}: RenterFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslations();
  const isEdit = !!renter;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RenterInput>({
    resolver: zodResolver(renterSchema),
    defaultValues: renter
      ? {
          name: renter.user.name,
          email: renter.user.email,
          password: "",
          meterNumber: renter.meterNumber,
          address: renter.address,
          mobile: renter.mobile,
        }
      : {
          name: "",
          email: "",
          password: "",
          meterNumber: "",
          address: "",
          mobile: "",
        },
  });

  const onSubmit = async (data: RenterInput) => {
    setLoading(true);
    try {
      const result = isEdit
        ? await updateRenter(renter!.id, data)
        : await createRenter(data);

      if (result.success) {
        toast.success(isEdit ? t("admin.renters.updated") : t("admin.renters.created"));
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error ?? t("toast.error"));
      }
    } catch {
      toast.error(t("admin.renters.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("admin.renters.editRenter") : t("admin.renters.addRenter")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("admin.renters.name")}</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("admin.renters.email")}</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              {t("admin.renters.password")}{" "}
              {isEdit && t("admin.renters.passwordHint")}
            </Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="meterNumber">{t("admin.renters.meterNumber")}</Label>
            <Input id="meterNumber" {...register("meterNumber")} />
            {errors.meterNumber && (
              <p className="text-sm text-destructive">{errors.meterNumber.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">{t("admin.renters.mobile")}</Label>
            <Input id="mobile" {...register("mobile")} />
            {errors.mobile && (
              <p className="text-sm text-destructive">{errors.mobile.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t("admin.renters.address")}</Label>
            <Input id="address" {...register("address")} />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            {isEdit ? t("admin.renters.updateRenter") : t("admin.renters.createRenter")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
