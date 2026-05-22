"use client";

import { Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useTranslations } from "@/components/providers/locale-provider";

export default function AdminSettingsPage() {
  const { t } = useTranslations();

  return (
    <div>
      <DashboardHeader
        title={t("admin.settings.title")}
        description={t("admin.settings.description")}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("admin.settings.billingDefaults")}
            </CardTitle>
            <CardDescription>{t("admin.settings.billingDefaultsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span>{t("admin.settings.defaultRate")}</span>
              <span className="font-medium">₹8.50</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span>{t("admin.settings.defaultFixed")}</span>
              <span className="font-medium">₹150.00</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.settings.systemInfo")}</CardTitle>
            <CardDescription>{t("admin.settings.systemInfoDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span>{t("admin.settings.version")}</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span>{t("admin.settings.framework")}</span>
              <span className="font-medium">Next.js 15</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span>{t("admin.settings.database")}</span>
              <span className="font-medium">PostgreSQL</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
