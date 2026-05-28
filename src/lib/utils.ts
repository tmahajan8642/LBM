import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function getMonthName(month: number): string {
  return MONTHS[month - 1] ?? "Unknown";
}

export function calculateBillAmount(
  previousReading: number,
  currentReading: number,
  ratePerUnit: number,
  fixedCharge: number,
  roomRent = 0
) {
  const units = Math.max(0, currentReading - previousReading);
  const totalAmount = units * ratePerUnit + fixedCharge + roomRent;
  return { units, totalAmount };
}

export function getYearsList(count = 5): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => currentYear - i);
}
