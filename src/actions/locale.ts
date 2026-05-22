"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidLocale, type Locale } from "@/i18n/config";
import { LOCALE_COOKIE } from "@/i18n/get-locale";

export async function setLocale(locale: string) {
  if (!isValidLocale(locale)) {
    return { success: false, error: "Invalid locale" };
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale as Locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  return { success: true };
}
