import type { Bill, BillStatus, Renter, Role, User } from "@prisma/client";

export type { Role, BillStatus };

export type UserWithRenter = User & {
  renter: Renter | null;
};

export type BillWithRenter = Bill & {
  renter: Renter & {
    user: Pick<User, "id" | "name" | "email">;
  };
};

export type RenterWithUser = Renter & {
  user: Pick<User, "id" | "name" | "email">;
  _count?: { bills: number };
};

export interface DashboardStats {
  totalRenters: number;
  totalBills: number;
  pendingBills: number;
  paidBills: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; amount: number }[];
}

export interface BillFilters {
  search?: string;
  year?: number;
  month?: number;
  status?: BillStatus;
  page?: number;
  limit?: number;
}
