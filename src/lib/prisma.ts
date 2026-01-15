// lib/prisma.ts
import { PrismaClient } from "../../generated/prisma/client";

const prismaClientSingleton = () => {
  const prisma = new PrismaClient();
  return prisma;
};

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton>;
};
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
