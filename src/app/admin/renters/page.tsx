import { RentersPageClient } from "./renters-client";
import { getRenters } from "@/actions/renters";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminRentersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROPERTY_OWNER") {
    redirect("/admin/dashboard");
  }
  const renters = await getRenters();
  return <RentersPageClient renters={renters} />;
}
