"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { renterSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getRenters() {
  await requireAdmin();
  return prisma.renter.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { bills: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRenterById(id: string) {
  await requireAdmin();
  return prisma.renter.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      bills: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 12 },
    },
  });
}

export async function createRenter(data: unknown) {
  await requireAdmin();
  const parsed = renterSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const { name, email, password, meterNumber, address, mobile } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Email already exists" };
  }

  const hashedPassword = await bcrypt.hash(password || "renter123", 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "RENTER",
      renter: { create: { meterNumber, address, mobile } },
    },
  });

  revalidatePath("/admin/renters");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function updateRenter(id: string, data: unknown) {
  await requireAdmin();
  const parsed = renterSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const renter = await prisma.renter.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!renter) return { success: false, error: "Renter not found" };

  const { name, email, password, meterNumber, address, mobile } = parsed.data;

  const updateData: { name: string; email: string; password?: string } = { name, email };
  if (password) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({
    where: { id: renter.userId },
    data: updateData,
  });

  await prisma.renter.update({
    where: { id },
    data: { meterNumber, address, mobile },
  });

  revalidatePath("/admin/renters");
  return { success: true };
}

export async function deleteRenter(id: string) {
  await requireAdmin();
  const renter = await prisma.renter.findUnique({ where: { id } });
  if (!renter) return { success: false, error: "Renter not found" };

  await prisma.user.delete({ where: { id: renter.userId } });
  revalidatePath("/admin/renters");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function getRentersForSelect() {
  await requireAdmin();
  return prisma.renter.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  });
}
