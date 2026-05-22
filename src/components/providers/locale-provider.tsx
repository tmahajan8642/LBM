"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { resolveMessage, getMonthNameFromMessages } from "@/i18n/get-dictionary";
import { setLocale } from "@/actions/locale";

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
  t: (key: string, params?: Record<string, string | number>) => string;
  getMonthName: (month: number) => string;
  changeLocale: (locale: Locale) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      resolveMessage(messages, key, params),
    [messages]
  );

  const getMonthName = useCallback(
    (month: number) => getMonthNameFromMessages(messages, month),
    [messages]
  );

  const changeLocale = useCallback(
    async (newLocale: Locale) => {
      await setLocale(newLocale);
      router.refresh();
    },
    [router]
  );

  const value = useMemo(
    () => ({ locale, messages, t, getMonthName, changeLocale }),
    [locale, messages, t, getMonthName, changeLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

export function useTranslations() {
  const { t, getMonthName, locale, messages, changeLocale } = useLocale();
  return { t, getMonthName, locale, messages, changeLocale };
}
