"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  DocumentConfigFormValues,
  documentConfigSchema,
} from "./document-configs.validation";

export async function getUserComplianceStatus(userId: string) {
  const user = getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 1. Get user's job title
    const person = await prisma.person.findFirst({
      where: { userId },
      select: { jobTitleId: true },
    });

    if (!person?.jobTitleId)
      return { success: false, error: "No job title found" };

    // 2. Get requirements for that job title
    const requirements = await prisma.certificateRequirement.findMany({
      where: { jobTitleId: person.jobTitleId, isActive: true },
      include: { documentCategory: true },
    });

    // 3. Get user's existing documents for these categories
    const userDocs = await prisma.document.findMany({
      where: {
        createdBy: userId,
        categoryId: { in: requirements.map((r) => r.documentCategoryId) },
      },
      include: {
        status: true,
        currentVersion: true,
      },
    });

    // 4. Map them together
    const data = requirements.map((req: any) => {
      const doc = userDocs.find((d) => d.categoryId === req.documentCategoryId);
      // Add filePath to your mapping in documents.ts -> getUserComplianceStatus
      return {
        requirement: req,
        categoryName: req.documentCategory.name,
        status: doc ? doc.status.name : "Missing",
        expiryDate: doc?.currentVersion?.expirationDate,
        documentId: doc?.id,
        filePath: doc?.currentVersion?.filePath, // Added for direct viewing
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch requirements" };
  }
}

export async function getCertificateRequirements() {
  const user = getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const requirements = await prisma.certificateRequirement.findMany();
    return { success: true, data: requirements };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch requirements" };
  }
}

export async function updateCertificateRequirement(
  formData: DocumentConfigFormValues,
) {
  const user = getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const validatedFields = documentConfigSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid form data" };
  }

  try {
    await prisma.certificateRequirement.upsert({
      where: {
        jobTitleId_documentCategoryId: {
          jobTitleId: validatedFields.data.jobTitleId,
          documentCategoryId: validatedFields.data.documentCategoryId,
        },
      },
      update: {
        isRequired: validatedFields.data.isRequired,
        requiresExpiry: validatedFields.data.requiresExpiry,
        isActive: validatedFields.data.isActive,
      },
      create: {
        jobTitleId: validatedFields.data.jobTitleId,
        documentCategoryId: validatedFields.data.documentCategoryId,
        isRequired: validatedFields.data.isRequired,
        requiresExpiry: validatedFields.data.requiresExpiry,
        isActive: validatedFields.data.isActive,
      },
    });

    revalidatePath("/app/documents-config");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update requirement" };
  }
}

export async function addCertificateRequirement(formData: FormData) {
  const user = getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const jobTitleId = formData.get("jobTitleId") as string;
    const categoryId = formData.get("categoryId") as string;
    const isRequired = formData.get("isRequired") === "true";
    const requiresExpiry = formData.get("requiresExpiry") === "true";

    await prisma.certificateRequirement.create({
      data: {
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
    return { success: false, error: "Failed to add requirement" };
  }
}
