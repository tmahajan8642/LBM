"use client";

import { Zap, Target, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/components/providers/locale-provider";

export default function AboutPage() {
  const { t } = useTranslations();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Zap className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">{t("about.title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("about.subtitle")}</p>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Target className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>{t("about.missionTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">{t("about.missionDesc")}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Zap className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>{t("about.whatTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">{t("about.whatDesc")}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Heart className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>{t("about.builtTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">{t("about.builtDesc")}</CardContent>
        </Card>
      </div>

      <div className="mx-auto mt-16 max-w-3xl rounded-xl border bg-card p-8">
        <h2 className="text-2xl font-bold">{t("about.calcTitle")}</h2>
        <p className="mt-4 text-muted-foreground">{t("about.calcIntro")}</p>
        <div className="mt-6 space-y-2 rounded-lg bg-muted p-4 font-mono text-sm">
          <p>{t("about.calcLine1")}</p>
          <p>{t("about.calcLine2")}</p>
        </div>
      </div>
    </div>
  );
}
