import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, getMonthName } from "./utils";
import type { BillWithRenter } from "@/types";

export function generateBillPDF(bill: BillWithRenter): jsPDF {
  const doc = new jsPDF();
  const renter = bill.renter;

  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text("Light Bill Management", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Electricity Bill Statement", 105, 30, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Bill Period: ${getMonthName(bill.month)} ${bill.year}`, 20, 45);
  doc.text(`Bill ID: ${bill.id.slice(-8).toUpperCase()}`, 20, 52);
  doc.text(`Status: ${bill.status}`, 20, 59);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 20, 66);

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 72, 190, 72);

  doc.setFontSize(11);
  doc.text("Customer Details", 20, 82);
  doc.setFontSize(10);
  doc.text(`Name: ${renter.user.name}`, 20, 90);
  doc.text(`Email: ${renter.user.email}`, 20, 97);
  doc.text(`Meter No: ${renter.meterNumber}`, 20, 104);
  doc.text(`Mobile: ${renter.mobile}`, 20, 111);
  doc.text(`Address: ${renter.address}`, 20, 118);

  autoTable(doc, {
    startY: 128,
    head: [["Description", "Value"]],
    body: [
      ["Previous Reading", `${bill.previousReading} units`],
      ["Current Reading", `${bill.currentReading} units`],
      ["Units Consumed", `${bill.units} units`],
      ["Rate per Unit", formatCurrency(bill.ratePerUnit)],
      ["Fixed Charge", formatCurrency(bill.fixedCharge)],
      ["Total Amount", formatCurrency(bill.totalAmount)],
    ],
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 10 },
  });

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Formula: Units = Current Reading - Previous Reading | Amount = (Units × Rate) + Fixed Charge",
    20,
    finalY + 15
  );
  doc.text("Thank you for your payment!", 105, finalY + 25, { align: "center" });

  return doc;
}

export function downloadBillPDF(bill: BillWithRenter, filename?: string) {
  const doc = generateBillPDF(bill);
  const name =
    filename ??
    `bill-${bill.renter.user.name.replace(/\s+/g, "-")}-${bill.month}-${bill.year}.pdf`;
  doc.save(name);
}
