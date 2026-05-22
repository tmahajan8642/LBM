"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import { updateProfile } from "@/actions/profile";
import { useTranslations } from "@/components/providers/locale-provider";
import type { UserWithRenter } from "@/types";

interface ProfilePageClientProps {
  user: UserWithRenter;
}

export function ProfilePageClient({ user }: ProfilePageClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      mobile: user.renter?.mobile ?? "",
      address: user.renter?.address ?? "",
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    setLoading(true);
    try {
      const result = await updateProfile(data);
      if (result.success) {
        toast.success(t("renter.profile.updated"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DashboardHeader
        title={t("renter.profile.title")}
        description={t("renter.profile.description")}
      />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("renter.profile.personalInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("renter.profile.email")}</Label>
              <Input value={user.email} disabled />
              <p className="text-xs text-muted-foreground">{t("renter.profile.emailHint")}</p>
            </div>
            {user.renter && (
              <div className="space-y-2">
                <Label>{t("renter.profile.meterNumber")}</Label>
                <Input value={user.renter.meterNumber} disabled />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">{t("renter.profile.fullName")}</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">{t("renter.profile.mobile")}</Label>
              <Input id="mobile" {...register("mobile")} />
              {errors.mobile && (
                <p className="text-sm text-destructive">{errors.mobile.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t("renter.profile.address")}</Label>
              <Input id="address" {...register("address")} />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingSpinner className="mr-2" /> : null}
              {t("renter.profile.saveChanges")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
