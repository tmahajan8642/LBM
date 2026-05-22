"use client";

import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/components/providers/locale-provider";
import { locales, localeNames, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, changeLocale, t } = useTranslations();

  return (
    <Select value={locale} onValueChange={(v) => changeLocale(v as Locale)}>
      <SelectTrigger className={className ?? "w-[130px]"} aria-label={t("common.language")}>
        <Globe className="mr-2 h-4 w-4 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {localeNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
