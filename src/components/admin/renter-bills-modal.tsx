"use client";

import { useEffect, useMemo, useState } from "react";
import type { BillStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { getRenterBillsForModal, updateBillStatus } from "@/actions/bills";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, getMonthName, getYearsList } from "@/lib/utils";

type ModalData = Awaited<ReturnType<typeof getRenterBillsForModal>>;

interface RenterBillsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renterId: string | null;
}

export function RenterBillsModal({ open, onOpenChange, renterId }: RenterBillsModalProps) {
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<string>("all");
  const [month, setMonth] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [data, setData] = useState<ModalData | null>(null);
  const [updatingBillId, setUpdatingBillId] = useState<string | null>(null);

  const yearOptions = useMemo(() => getYearsList(8), []);

  useEffect(() => {
    if (!open || !renterId) return;

    const load = async () => {
      setLoading(true);
      try {
        const response = await getRenterBillsForModal({
          renterId,
          year: year === "all" ? undefined : Number(year),
          month: month === "all" ? undefined : Number(month),
          status: status === "all" ? undefined : (status as BillStatus),
        });
        setData(response);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open, renterId, year, month, status]);

  useEffect(() => {
    if (!open) {
      setYear("all");
      setMonth("all");
      setStatus("all");
      setData(null);
    }
  }, [open]);

  const handleStatusUpdate = async (billId: string, newStatus: BillStatus) => {
    setUpdatingBillId(billId);
    try {
      const result = await updateBillStatus(billId, newStatus);
      if (!result.success) {
        return;
      }

      setData((prev) =>
        prev
          ? {
              ...prev,
              bills: prev.bills.map((bill) =>
                bill.id === billId ? { ...bill, status: newStatus } : bill
              ),
            }
          : prev
      );
    } finally {
      setUpdatingBillId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[96vw] max-w-6xl overflow-hidden p-0">
        <div className="flex h-full flex-col">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-xl">
              {data?.renter.name ? `${data.renter.name} - Monthly Bills` : "Renter Bills"}
            </DialogTitle>
            <DialogDescription>
              {data?.renter
                ? `${data.renter.email} • ${data.renter.meterNumber}${data.renter.roomNumber ? ` • Room ${data.renter.roomNumber}` : ""}`
                : "View month-wise bills with filters"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto px-6 py-4">
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {getMonthName(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading bills...
              </div>
            ) : !data || data.bills.length === 0 ? (
              <div className="rounded-lg border p-8 text-center text-muted-foreground">
                No bills found for selected filters.
              </div>
            ) : (
              <div className="rounded-lg border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Previous</TableHead>
                        <TableHead>Current</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Room Rent</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>{getMonthName(bill.month)} {bill.year}</TableCell>
                          <TableCell>{bill.previousReading}</TableCell>
                          <TableCell>{bill.currentReading}</TableCell>
                          <TableCell>{bill.units.toFixed(2)}</TableCell>
                          <TableCell>{formatCurrency(bill.roomRent)}</TableCell>
                          <TableCell>{formatCurrency(bill.totalAmount)}</TableCell>
                          <TableCell>
                            <Select
                              value={bill.status}
                              onValueChange={(value) =>
                                handleStatusUpdate(bill.id, value as BillStatus)
                              }
                              disabled={updatingBillId === bill.id}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="OVERDUE">Overdue</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
