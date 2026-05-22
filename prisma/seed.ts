import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const renterPassword = await bcrypt.hash("renter123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@lightbill.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@lightbill.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const renterUser1 = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john@example.com",
      password: renterPassword,
      role: "RENTER",
      renter: {
        create: {
          meterNumber: "MTR-001",
          address: "123 Main Street, Apartment 4B, Mumbai",
          mobile: "9876543210",
        },
      },
    },
    include: { renter: true },
  });

  const renterUser2 = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "jane@example.com",
      password: renterPassword,
      role: "RENTER",
      renter: {
        create: {
          meterNumber: "MTR-002",
          address: "456 Oak Avenue, Unit 12, Delhi",
          mobile: "9876543211",
        },
      },
    },
    include: { renter: true },
  });

  const renters = [renterUser1.renter, renterUser2.renter].filter(Boolean);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  for (const renter of renters) {
    if (!renter) continue;

    let previousReading = 1000;

    for (let i = 5; i >= 1; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      const currentReading = previousReading + Math.floor(Math.random() * 150) + 50;
      const units = currentReading - previousReading;
      const ratePerUnit = 8.5;
      const fixedCharge = 150;
      const totalAmount = units * ratePerUnit + fixedCharge;

      await prisma.bill.upsert({
        where: {
          renterId_month_year: {
            renterId: renter.id,
            month,
            year,
          },
        },
        update: {},
        create: {
          renterId: renter.id,
          month,
          year,
          previousReading,
          currentReading,
          units,
          ratePerUnit,
          fixedCharge,
          totalAmount,
          status: i === 1 ? "PENDING" : i === 2 ? "OVERDUE" : "PAID",
        },
      });

      previousReading = currentReading;
    }
  }

  console.log("Seed completed!");
  console.log("\n--- Demo Credentials ---");
  console.log("Admin:  admin@lightbill.com / admin123");
  console.log("Renter: john@example.com / renter123");
  console.log("Renter: jane@example.com / renter123");
  console.log(`Admin ID: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
