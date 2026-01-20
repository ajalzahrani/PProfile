"use server";

import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { authOptions, getCurrentUser } from "@/lib/auth";

export async function updateCertificateRequirement(formData: FormData) {
  const user = getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const jobTitleId = formData.get("jobTitleId") as string;
    const categoryId = formData.get("categoryId") as string;
    const isRequired = formData.get("isRequired") === "true";
    const requiresExpiry = formData.get("requiresExpiry") === "true";
    const active = formData.get("active") === "true";

    // Use upsert to create or update the rule
    // Note: Ensure you added the CertificateRequirement model to your schema first
    await prisma.certificateRequirement.upsert({
      where: {
        jobTitleId_documentCategoryId: {
          jobTitleId,
          documentCategoryId: categoryId,
        },
      },
      update: {
        isRequired,
        requiresExpiry,
        // active state logic
      },
      create: {
        jobTitleId,
        documentCategoryId: categoryId,
        isRequired,
        requiresExpiry,
      },
    });

    revalidatePath("/app/documents-config");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update requirement" };
  }
}
