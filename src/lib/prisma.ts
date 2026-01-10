// lib/prisma.ts
import { PrismaClient } from "../../generated/prisma/client";

const prismaClientSingleton = () => {
  const prisma = new PrismaClient();

  prisma.$use(async (params, next) => {
    // Auto-generate occurrenceId when creating new occurrences
    if (params.model === "Occurrence" && params.action === "create") {
      // Get current year (last 2 digits)
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const yearPrefix = `OCC${currentYear}-`;

      // Get the current highest occurrenceId for this year
      const highestOccurrence = await prisma.occurrence.findFirst({
        where: {
          occurrenceNo: {
            startsWith: yearPrefix,
          },
        },
        orderBy: { occurrenceNo: "desc" },
      });

      // Extract number and increment
      const currentNumber = highestOccurrence
        ? parseInt(highestOccurrence.occurrenceNo.split("-")[1])
        : 0;
      const nextNumber = currentNumber + 1;

      // Format with leading zeros (OCC25-0001, OCC25-0002, etc.)
      params.args.data.occurrenceNo = `${yearPrefix}${nextNumber
        .toString()
        .padStart(4, "0")}`;
    }

    return next(params);
  });

  return prisma;
};

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton>;
};
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
