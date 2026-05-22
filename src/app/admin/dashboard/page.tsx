import { DashboardClient } from "./dashboard-client";
import { getDashboardStats, getBills } from "@/actions/bills";

export default async function AdminDashboardPage() {
  const [stats, { bills }] = await Promise.all([
    getDashboardStats(),
    getBills({ limit: 5 }),
  ]);

  return <DashboardClient stats={stats} bills={bills} />;
}
