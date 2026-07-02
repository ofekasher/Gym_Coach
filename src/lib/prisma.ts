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

// Constructing PrismaClient without a valid DATABASE_URL throws immediately,
// which would crash every request in demo mode. Only construct it when configured.
export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  (isDatabaseConfigured
    ? new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      })
    : (new Proxy(
        {},
        {
          get() {
            throw new Error("Prisma is not configured (DATABASE_URL missing) — this code path should be guarded by isDatabaseConfigured");
          },
        }
      ) as PrismaClient));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
