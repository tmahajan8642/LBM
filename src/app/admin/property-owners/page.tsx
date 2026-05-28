import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPropertyOwners } from "@/actions/property-owners";
import { PropertyOwnersClient } from "./property-owners-client";

export default async function PropertyOwnersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/renters");
  }

  const owners = await getPropertyOwners();
  return <PropertyOwnersClient owners={owners} />;
}
