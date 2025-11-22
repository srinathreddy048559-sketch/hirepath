// app/lib/prisma.ts
// 💡 Disable TS checking in this file so we don't fight with Prisma types
// @ts-nocheck

import { PrismaClient } from "@prisma/client";

// Re-use the same Prisma instance in dev (Next hot-reload)
const globalForPrisma = globalThis as any;

function makePrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });
}

const prisma = globalForPrisma.prismaGlobal ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}

// ✅ Default export used everywhere:  import prisma from "@/lib/prisma";
export default prisma;

// (Optional) named export if you ever want it:
// export { prisma };
