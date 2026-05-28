"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { propertyOwnerSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getPropertyOwners() {
  await requireAdmin();
  return prisma.propertyOwner.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { renters: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPropertyOwner(data: unknown) {
  await requireAdmin();
  const parsed = propertyOwnerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Email already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "PROPERTY_OWNER",
      propertyOwner: { create: {} },
    },
  });

  revalidatePath("/admin/property-owners");
  return { success: true };
}
