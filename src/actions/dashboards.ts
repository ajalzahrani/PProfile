"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { checkServerPermission } from "@/lib/server-permissions";
import { getCurrentUser } from "@/lib/auth";

export async function getDashboardData() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    const totalDocuments = await prisma.document.count();

    return {
      success: true,
      data: {
        totalDocuments,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to fetch dashboard data",
    };
  }
}
