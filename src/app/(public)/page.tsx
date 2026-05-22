"use client";

import Link from "next/link";
import { Zap, Shield, FileText, BarChart3, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/components/providers/locale-provider";

export default function HomePage() {
  const { t } = useTranslations();

  const features = [
    { icon: FileText, title: t("home.feature1Title"), description: t("home.feature1Desc") },
    { icon: Users, title: t("home.feature2Title"), description: t("home.feature2Desc") },
    { icon: BarChart3, title: t("home.feature3Title"), description: t("home.feature3Desc") },
    { icon: Shield, title: t("home.feature4Title"), description: t("home.feature4Desc") },
  ];

  return (
    <div>
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {t("home.heroTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("home.heroSubtitle")}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/login">
              {t("home.getStarted")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/about">{t("home.learnMore")}</Link>
          </Button>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">{t("home.featuresTitle")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">{t("home.ctaTitle")}</h2>
        <p className="mt-4 text-muted-foreground">{t("home.ctaSubtitle")}</p>
        <Button asChild className="mt-6" size="lg">
          <Link href="/login">{t("home.ctaButton")}</Link>
        </Button>
      </section>
    </div>
  );
}
