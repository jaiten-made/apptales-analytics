import { PrismaClient } from "@prisma/client";

const createPrisma = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

type PrismaWithEvents = ReturnType<typeof createPrisma>;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaWithEvents };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
