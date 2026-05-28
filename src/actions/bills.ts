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

async function requirePropertyOwner() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROPERTY_OWNER") {
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
  const andConditions: Prisma.BillWhereInput[] = [];

  if (session.user.role === "RENTER" && session.user.renterId) {
    where.renterId = session.user.renterId;
  }
  if (session.user.role === "PROPERTY_OWNER") {
    andConditions.push({
      renter: { is: { propertyOwnerId: session.user.propertyOwnerId ?? "__none__" } },
    });
  }

  if (year) where.year = year;
  if (month) where.month = month;
  if (status) where.status = status;

  if (search) {
    andConditions.push({
      renter: {
        is: {
          OR: [
            { user: { name: { contains: search, mode: "insensitive" } } },
            { user: { email: { contains: search, mode: "insensitive" } } },
            { meterNumber: { contains: search, mode: "insensitive" } },
          ],
        },
      },
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
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
  if (
    session.user.role === "PROPERTY_OWNER" &&
    bill.renter.propertyOwnerId !== session.user.propertyOwnerId
  ) {
    throw new Error("Unauthorized");
  }

  return bill;
}

export async function createBill(data: unknown) {
  const session = await requirePropertyOwner();
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
    roomRent,
    status,
  } = parsed.data;

  const renter = await prisma.renter.findFirst({
    where: {
      id: renterId,
      propertyOwnerId: session.user.propertyOwnerId ?? "__none__",
    },
    select: { id: true },
  });
  if (!renter) {
    return { success: false, error: "Unauthorized renter access" };
  }

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
    fixedCharge,
    roomRent
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
  const session = await requirePropertyOwner();
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
    roomRent,
    status,
  } = parsed.data;

  const existingBill = await prisma.bill.findUnique({
    where: { id },
    include: { renter: { select: { propertyOwnerId: true } } },
  });
  if (!existingBill || existingBill.renter.propertyOwnerId !== session.user.propertyOwnerId) {
    return { success: false, error: "Bill not found" };
  }

  const renter = await prisma.renter.findFirst({
    where: {
      id: renterId,
      propertyOwnerId: session.user.propertyOwnerId ?? "__none__",
    },
    select: { id: true },
  });
  if (!renter) {
    return { success: false, error: "Unauthorized renter access" };
  }

  const { units, totalAmount } = calculateBillAmount(
    previousReading,
    currentReading,
    ratePerUnit,
    fixedCharge,
    roomRent
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
  const session = await requirePropertyOwner();
  const bill = await prisma.bill.findUnique({
    where: { id },
    include: { renter: { select: { propertyOwnerId: true } } },
  });
  if (!bill || bill.renter.propertyOwnerId !== session.user.propertyOwnerId) {
    return { success: false, error: "Bill not found" };
  }

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
  const session = await requirePropertyOwner();
  const lastBill = await prisma.bill.findFirst({
    where: {
      renterId,
      renter: { propertyOwnerId: session.user.propertyOwnerId ?? "__none__" },
    },
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
  } else if (session.user.role === "PROPERTY_OWNER") {
    where.renter = { is: { propertyOwnerId: session.user.propertyOwnerId ?? "__none__" } };
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
  } else if (session.user.role === "PROPERTY_OWNER") {
    where.renter = { is: { propertyOwnerId: session.user.propertyOwnerId ?? "__none__" } };
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

export async function getRenterBillsForModal(filters: {
  renterId: string;
  year?: number;
  month?: number;
  status?: BillStatus;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { renterId, year, month, status } = filters;
  if (!renterId) throw new Error("Renter is required");

  const renter = await prisma.renter.findUnique({
    where: { id: renterId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!renter) throw new Error("Renter not found");

  if (
    session.user.role === "PROPERTY_OWNER" &&
    renter.propertyOwnerId !== session.user.propertyOwnerId
  ) {
    throw new Error("Unauthorized");
  }

  if (session.user.role === "RENTER" && session.user.renterId !== renterId) {
    throw new Error("Unauthorized");
  }

  const where: Prisma.BillWhereInput = { renterId };
  if (year) where.year = year;
  if (month) where.month = month;
  if (status) where.status = status;

  let bills: Array<{
    id: string;
    month: number;
    year: number;
    previousReading: number;
    currentReading: number;
    units: number;
    ratePerUnit: number;
    fixedCharge: number;
    roomRent: number;
    totalAmount: number;
    status: BillStatus;
    createdAt: Date;
  }> = [];

  try {
    const rows = await prisma.bill.findMany({
      where,
      orderBy: [{ year: "desc" }, { month: "desc" }],
      select: {
        id: true,
        month: true,
        year: true,
        previousReading: true,
        currentReading: true,
        units: true,
        ratePerUnit: true,
        fixedCharge: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    });
    bills = rows.map((bill) => ({ ...bill, roomRent: 0 }));
  } catch {
    // Backward-compatible fallback when roomRent is not yet available in runtime schema/client.
    const legacyBills = await prisma.bill.findMany({
      where,
      orderBy: [{ year: "desc" }, { month: "desc" }],
      select: {
        id: true,
        month: true,
        year: true,
        previousReading: true,
        currentReading: true,
        units: true,
        ratePerUnit: true,
        fixedCharge: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      } as Prisma.BillSelect,
    });
    bills = legacyBills.map((bill) => ({ ...bill, roomRent: 0 })) as typeof bills;
  }

  return {
    renter: {
      id: renter.id,
      name: renter.user.name,
      email: renter.user.email,
      meterNumber: renter.meterNumber,
      roomNumber: renter.roomNumber,
    },
    bills,
  };
}

export async function updateBillStatus(billId: string, status: BillStatus) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROPERTY_OWNER") {
    return { success: false, error: "Unauthorized" };
  }

  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: { renter: { select: { propertyOwnerId: true } } },
  });

  if (!bill || bill.renter.propertyOwnerId !== session.user.propertyOwnerId) {
    return { success: false, error: "Bill not found" };
  }

  await prisma.bill.update({
    where: { id: billId },
    data: { status },
  });

  revalidatePath("/admin/bills");
  revalidatePath("/renter/bills");
  return { success: true };
}
