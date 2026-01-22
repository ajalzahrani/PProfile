"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Get all categories
 */
export async function getCategories() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const categories = await prisma.documentCategory.findMany();
    return { success: true, categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Error fetching categories" };
  }
}

export async function getCategoriesForSelect() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const categories = await prisma.documentCategory.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return { success: true, categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Error fetching categories" };
  }
}
