"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/components/providers/locale-provider";
import { getYearsList } from "@/lib/utils";

export function BillFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, getMonthName } = useTranslations();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="relative md:col-span-2 xl:col-span-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("admin.bills.searchPlaceholder")}
          className="pl-9"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const timer = setTimeout(() => updateParam("search", e.target.value), 300);
            return () => clearTimeout(timer);
          }}
        />
      </div>
      <Select
        value={searchParams.get("year") ?? "all"}
        onValueChange={(v) => updateParam("year", v)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("admin.bills.year")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("admin.bills.allYears")}</SelectItem>
          {getYearsList(5).map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("month") ?? "all"}
        onValueChange={(v) => updateParam("month", v)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("admin.bills.month")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("admin.bills.allMonths")}</SelectItem>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <SelectItem key={m} value={String(m)}>
              {getMonthName(m)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) => updateParam("status", v)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("admin.bills.status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("admin.bills.allStatus")}</SelectItem>
          <SelectItem value="PENDING">{t("status.PENDING")}</SelectItem>
          <SelectItem value="PAID">{t("status.PAID")}</SelectItem>
          <SelectItem value="OVERDUE">{t("status.OVERDUE")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
