import { RentersPageClient } from "./renters-client";
import { getRenters } from "@/actions/renters";

export default async function AdminRentersPage() {
  const renters = await getRenters();
  return <RentersPageClient renters={renters} />;
}
