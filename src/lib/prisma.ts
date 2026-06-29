import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Detect unconfigured/placeholder DB URL so we skip connection attempts entirely
const dbUrl = process.env.DATABASE_URL ?? "";
export const isDatabaseConfigured =
  dbUrl.length > 0 &&
  !dbUrl.includes("[project-ref]") &&
  !dbUrl.includes("[password]") &&
  !dbUrl.includes("[region]") &&
  !dbUrl.includes("placeholder");

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
