import { notFound } from "next/navigation";
import { getBillById } from "@/actions/bills";
import { BillDetailClient } from "./bill-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RenterBillDetailPage({ params }: PageProps) {
  const { id } = await params;
  const bill = await getBillById(id);

  if (!bill) notFound();

  return <BillDetailClient bill={bill} />;
}
