"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useTranslations } from "@/components/providers/locale-provider";

export function PublicFooter() {
  const { t } = useTranslations();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Zap className="h-5 w-5" />
            <span>LightBill Management</span>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              {t("nav.home")}
            </Link>
            <Link href="/about" className="hover:text-primary">
              {t("nav.about")}
            </Link>
            <Link href="/contact" className="hover:text-primary">
              {t("nav.contact")}
            </Link>
            <Link href="/login" className="hover:text-primary">
              {t("common.login")}
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            {t("common.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
