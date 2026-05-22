import type { Locale } from "./config";
import { defaultLocale } from "./config";

import en from "./messages/en.json";
import hi from "./messages/hi.json";
import mr from "./messages/mr.json";
import gu from "./messages/gu.json";

const dictionaries = { en, hi, mr, gu } as const;

export type Messages = typeof en;

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function resolveMessage(
  messages: Messages,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split(".");
  let value: unknown = messages;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  if (typeof value !== "string") return key;

  if (!params) return value;

  return value.replace(/\{(\w+)\}/g, (_, paramKey: string) => {
    return String(params[paramKey] ?? `{${paramKey}}`);
  });
}

export function getMonthNameFromMessages(messages: Messages, month: number): string {
  const months = messages.months as Record<string, string>;
  return months[String(month)] ?? String(month);
}
