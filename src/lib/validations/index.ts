import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const renterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  meterNumber: z.string().min(1, "Meter number is required"),
  roomNumber: z.string().min(1, "Room number is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  mobile: z.string().min(10, "Valid mobile number required"),
});

export const propertyOwnerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const billSchema = z
  .object({
    renterId: z.string().min(1, "Renter is required"),
    month: z.number().min(1).max(12),
    year: z.number().min(2020).max(2100),
    previousReading: z.number().min(0, "Previous reading must be 0 or more"),
    currentReading: z.number().min(0, "Current reading must be 0 or more"),
    ratePerUnit: z.number().min(0, "Rate must be 0 or more"),
    fixedCharge: z.number().min(0, "Fixed charge must be 0 or more"),
    roomRent: z.number().min(0, "Room rent must be 0 or more"),
    status: z.enum(["PENDING", "PAID", "OVERDUE"]),
  })
  .refine((data) => data.currentReading >= data.previousReading, {
    message: "Current reading must be greater than or equal to previous reading",
    path: ["currentReading"],
  });

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().min(10, "Valid mobile number required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RenterInput = z.infer<typeof renterSchema>;
export type BillInput = z.infer<typeof billSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PropertyOwnerInput = z.infer<typeof propertyOwnerSchema>;
