"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";

export async function getProfile() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { renter: true },
  });

  return user;
}

export async function updateProfile(data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RENTER") {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const { name, mobile, address } = parsed.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  if (session.user.renterId) {
    await prisma.renter.update({
      where: { id: session.user.renterId },
      data: { mobile, address },
    });
  }

  revalidatePath("/renter/profile");
  return { success: true };
}
