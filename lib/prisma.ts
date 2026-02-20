// app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Helper to create a new client (with Accelerate)
function getPrismaClient() {
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());
}

// Tell TypeScript what lives on globalThis
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof getPrismaClient>;
};

// Re-use a single Prisma instance in dev, and a fresh one in prod
export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
