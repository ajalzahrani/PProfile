"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { JobTitleFormValues, jobTitleSchema } from "./jobtitles.validation";
import { revalidatePath } from "next/cache";
/**
 * Get all jobTitles
 */
export async function getJobTitles() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const jobTitles = await prisma.jobTitle.findMany();

    return { success: true, jobTitles };
  } catch (error) {
    console.error("Error fetching jobTitles:", error);
    return { success: false, error: "Error fetching jobTitles" };
  }
}

/**
 * Get jobTitle by ID
 */
export async function getJobTitleById(jobTitleId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const jobTitle = await prisma.jobTitle.findUnique({
      where: { id: jobTitleId },
    });

    return { success: true, jobTitle };
  } catch (error) {
    console.error("Error fetching jobTitle:", error);
    return { success: false, error: "Error fetching jobTitle" };
  }
}

/**
 * Get jobTitles for select
 */
export async function getJobTitlesForSelect() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const jobTitles = await prisma.jobTitle.findMany({
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
      },
    });

    return { success: true, jobTitles };
  } catch (error) {
    console.error("Error fetching jobTitle:", error);
    return { success: false, error: "Error fetching jobTitle" };
  }
}

/**
 * Create a new jobTitle
 */
export async function createJobTitle(jobTitle: JobTitleFormValues) {
  const session = await getServerSession(authOptions);

  const validatedFields = jobTitleSchema.safeParse(jobTitle);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const newJobTitle = await prisma.jobTitle.create({
      data: jobTitle,
    });

    return { success: true, jobTitle: newJobTitle };
  } catch (error) {
    console.error("Error creating jobTitle:", error);
    return { success: false, error: "Error creating jobTitle" };
  }
}

/**
 * Update a jobTitle
 */
export async function updateJobTitle(jobTitle: JobTitleFormValues) {
  const session = await getServerSession(authOptions);

  const validatedFields = jobTitleSchema.safeParse(jobTitle);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updatedJobTitle = await prisma.jobTitle.update({
      where: { id: jobTitle.id! },
      data: jobTitle,
    });

    revalidatePath("/jobTitles");

    return { success: true, jobTitle: updatedJobTitle };
  } catch (error) {
    console.error("Error updating jobTitle:", error);
    return { success: false, error: "Error updating jobTitle" };
  }
}

/**
 * Delete a jobTitle
 */
export async function deleteJobTitle(jobTitleId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.jobTitle.delete({
      where: { id: jobTitleId },
    });

    revalidatePath("/jobTitles");

    return { success: true };
  } catch (error) {
    console.error("Error deleting jobTitle:", error);
    return { success: false, error: "Error deleting jobTitle" };
  }
}

/**
 * Get document jobTitles
 */
export async function getDocumentJobTitlesForSelect(documentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const jobTitles = await prisma.jobTitle.findMany({
      where: { certificateRequirement: { some: { id: documentId } } },
    });

    return { success: true, jobTitles };
  } catch (error) {
    console.error("Error fetching document jobTitles:", error);
    return { success: false, error: "Error fetching document jobTitles" };
  }
}
