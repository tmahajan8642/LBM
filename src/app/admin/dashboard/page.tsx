import { DashboardClient } from "./dashboard-client";
import { getDashboardStats, getBills } from "@/actions/bills";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/renters");
  }

  const [stats, { bills }] = await Promise.all([
    getDashboardStats(),
    getBills({ limit: 5 }),
  ]);

  return <DashboardClient stats={stats} bills={bills} />;
}
