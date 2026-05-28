"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { renterSchema } from "@/lib/validations";

async function requirePropertyOwner() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROPERTY_OWNER") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getRenters() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where =
    session.user.role === "PROPERTY_OWNER"
      ? { propertyOwnerId: session.user.propertyOwnerId ?? "__none__" }
      : session.user.role === "ADMIN"
        ? {}
        : { id: "__none__" };

  return prisma.renter.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { bills: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRenterById(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.renter.findFirst({
    where:
      session.user.role === "PROPERTY_OWNER"
        ? { id, propertyOwnerId: session.user.propertyOwnerId ?? "__none__" }
        : { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      bills: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 12 },
    },
  });
}

export async function createRenter(data: unknown) {
  const session = await requirePropertyOwner();
  const parsed = renterSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const { name, email, password, meterNumber, roomNumber, address, mobile } = parsed.data;

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
      renter: {
        create: {
          meterNumber,
          roomNumber,
          address,
          mobile,
          propertyOwnerId: session.user.propertyOwnerId ?? undefined,
        },
      },
    },
  });

  revalidatePath("/admin/renters");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function updateRenter(id: string, data: unknown) {
  const session = await requirePropertyOwner();
  const parsed = renterSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const renter = await prisma.renter.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!renter || renter.propertyOwnerId !== session.user.propertyOwnerId) {
    return { success: false, error: "Renter not found" };
  }

  const { name, email, password, meterNumber, roomNumber, address, mobile } = parsed.data;

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
    data: { meterNumber, roomNumber, address, mobile },
  });

  revalidatePath("/admin/renters");
  return { success: true };
}

export async function deleteRenter(id: string) {
  const session = await requirePropertyOwner();
  const renter = await prisma.renter.findUnique({ where: { id } });
  if (!renter || renter.propertyOwnerId !== session.user.propertyOwnerId) {
    return { success: false, error: "Renter not found" };
  }

  await prisma.user.delete({ where: { id: renter.userId } });
  revalidatePath("/admin/renters");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function getRentersForSelect() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "PROPERTY_OWNER"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return prisma.renter.findMany({
    where:
      session.user.role === "PROPERTY_OWNER"
        ? { propertyOwnerId: session.user.propertyOwnerId ?? "__none__" }
        : undefined,
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  });
}
