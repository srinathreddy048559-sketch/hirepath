// app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaGlobal?: PrismaClient;
};

function makePrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// ✅ single Prisma instance for dev + prod
const prisma = globalForPrisma.prismaGlobal ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}

// default export used everywhere:  import prisma from "@/lib/prisma"
export default prisma;
