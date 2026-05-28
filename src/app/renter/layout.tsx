import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function RenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RENTER") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role="RENTER" />
      <main className="flex-1 overflow-auto">
        <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
