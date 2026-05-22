import { cookies } from "next/headers";
import { defaultLocale, isValidLocale, type Locale } from "./config";

const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value && isValidLocale(value)) return value;
  return defaultLocale;
}

export { LOCALE_COOKIE };
