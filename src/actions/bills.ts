"use server";

import { revalidatePath } from "next/cache";
import type { BillStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { billSchema } from "@/lib/validations";
import { calculateBillAmount, getMonthName, MONTHS } from "@/lib/utils";
import type { BillFilters, DashboardStats } from "@/types";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

async function requireRenter() {
  const session = await auth();
  if (!session?.user || session.user.role !== "RENTER") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getBills(filters: BillFilters = {}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { search, year, month, status, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.BillWhereInput = {};

  if (session.user.role === "RENTER" && session.user.renterId) {
    where.renterId = session.user.renterId;
  }

  if (year) where.year = year;
  if (month) where.month = month;
  if (status) where.status = status;

  if (search) {
    where.renter = {
      OR: [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { meterNumber: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [bills, total] = await Promise.all([
    prisma.bill.findMany({
      where,
      include: {
        renter: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      skip,
      take: limit,
    }),
    prisma.bill.count({ where }),
  ]);

  return { bills, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getBillById(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const bill = await prisma.bill.findUnique({
    where: { id },
    include: {
      renter: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!bill) return null;

  if (
    session.user.role === "RENTER" &&
    session.user.renterId !== bill.renterId
  ) {
    throw new Error("Unauthorized");
  }

  return bill;
}

export async function createBill(data: unknown) {
  await requireAdmin();
  const parsed = billSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const {
    renterId,
    month,
    year,
    previousReading,
    currentReading,
    ratePerUnit,
    fixedCharge,
    status,
  } = parsed.data;

  const existing = await prisma.bill.findUnique({
    where: { renterId_month_year: { renterId, month, year } },
  });
  if (existing) {
    return { success: false, error: "Bill already exists for this month and year" };
  }

  const { units, totalAmount } = calculateBillAmount(
    previousReading,
    currentReading,
    ratePerUnit,
    fixedCharge
  );

  await prisma.bill.create({
    data: {
      renterId,
      month,
      year,
      previousReading,
      currentReading,
      units,
      ratePerUnit,
      fixedCharge,
      totalAmount,
      status: status as BillStatus,
    },
  });

  revalidatePath("/admin/bills");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/reports");
  return { success: true };
}

export async function updateBill(id: string, data: unknown) {
  await requireAdmin();
  const parsed = billSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const {
    renterId,
    month,
    year,
    previousReading,
    currentReading,
    ratePerUnit,
    fixedCharge,
    status,
  } = parsed.data;

  const { units, totalAmount } = calculateBillAmount(
    previousReading,
    currentReading,
    ratePerUnit,
    fixedCharge
  );

  await prisma.bill.update({
    where: { id },
    data: {
      renterId,
      month,
      year,
      previousReading,
      currentReading,
      units,
      ratePerUnit,
      fixedCharge,
      totalAmount,
      status: status as BillStatus,
    },
  });

  revalidatePath("/admin/bills");
  revalidatePath("/renter/bills");
  return { success: true };
}

export async function deleteBill(id: string) {
  await requireAdmin();
  await prisma.bill.delete({ where: { id } });
  revalidatePath("/admin/bills");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const [totalRenters, totalBills, pendingBills, paidBills, revenueAgg, bills] =
    await Promise.all([
      prisma.renter.count(),
      prisma.bill.count(),
      prisma.bill.count({ where: { status: "PENDING" } }),
      prisma.bill.count({ where: { status: "PAID" } }),
      prisma.bill.aggregate({ _sum: { totalAmount: true } }),
      prisma.bill.findMany({
        where: { status: "PAID" },
        select: { month: true, year: true, totalAmount: true },
        orderBy: [{ year: "asc" }, { month: "asc" }],
      }),
    ]);

  const monthlyMap = new Map<string, number>();
  for (const bill of bills) {
    const key = `${getMonthName(bill.month).slice(0, 3)} ${bill.year}`;
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + bill.totalAmount);
  }

  const monthlyRevenue = Array.from(monthlyMap.entries())
    .slice(-6)
    .map(([month, amount]) => ({ month, amount }));

  return {
    totalRenters,
    totalBills,
    pendingBills,
    paidBills,
    totalRevenue: revenueAgg._sum.totalAmount ?? 0,
    monthlyRevenue,
  };
}

export async function getRenterDashboardStats() {
  const session = await requireRenter();
  const renterId = session.user.renterId;
  if (!renterId) throw new Error("Renter profile not found");

  const [totalBills, pendingBills, paidBills, totalDue, latestBill] =
    await Promise.all([
      prisma.bill.count({ where: { renterId } }),
      prisma.bill.count({ where: { renterId, status: "PENDING" } }),
      prisma.bill.count({ where: { renterId, status: "PAID" } }),
      prisma.bill.aggregate({
        where: { renterId, status: { in: ["PENDING", "OVERDUE"] } },
        _sum: { totalAmount: true },
      }),
      prisma.bill.findFirst({
        where: { renterId },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      }),
    ]);

  return {
    totalBills,
    pendingBills,
    paidBills,
    totalDue: totalDue._sum.totalAmount ?? 0,
    latestBill,
  };
}

export async function getLastReading(renterId: string) {
  await requireAdmin();
  const lastBill = await prisma.bill.findFirst({
    where: { renterId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    select: { currentReading: true },
  });
  return lastBill?.currentReading ?? 0;
}

export async function getYearlyBillSummary(renterId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Prisma.BillWhereInput = {};
  if (session.user.role === "RENTER" && session.user.renterId) {
    where.renterId = session.user.renterId;
  } else if (renterId) {
    where.renterId = renterId;
  }

  const bills = await prisma.bill.findMany({
    where,
    select: { year: true, month: true, totalAmount: true, status: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const yearlyMap = new Map<number, { total: number; count: number; paid: number }>();
  for (const bill of bills) {
    const existing = yearlyMap.get(bill.year) ?? { total: 0, count: 0, paid: 0 };
    existing.total += bill.totalAmount;
    existing.count += 1;
    if (bill.status === "PAID") existing.paid += 1;
    yearlyMap.set(bill.year, existing);
  }

  return Array.from(yearlyMap.entries()).map(([year, data]) => ({
    year,
    ...data,
  }));
}

export async function getMonthlyHistory(year: number, renterId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Prisma.BillWhereInput = { year };
  if (session.user.role === "RENTER" && session.user.renterId) {
    where.renterId = session.user.renterId;
  } else if (renterId) {
    where.renterId = renterId;
  }

  const bills = await prisma.bill.findMany({
    where,
      select: {
        month: true,
        totalAmount: true,
        units: true,
        status: true,
      },
    orderBy: { month: "desc" },
  });

  return MONTHS.map((name, index) => {
    const month = index + 1;
    const bill = bills.find((b) => b.month === month);
    return { month, monthName: name, bill };
  });
}
