"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createDocumentCategorySchema,
  updateDocumentCategorySchema,
  CreateDocumentCategoryFormValues,
  UpdateDocumentCategoryFormValues,
} from "@/actions/categories.validation";

/**
 * Get all category by id
 */
export async function getCategoryById(id: string) {
  const user = getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const category = await prisma.documentCategory.findUnique({
      where: { id: id },
    });
    return { success: true, category };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: "Error fetching category" };
  }
}

/**
 * Get all categories
 */
export async function getCategories() {
  const user = getCurrentUser();

  if (!user) {
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
  const user = getCurrentUser();

  if (!user) {
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

export async function createCategory(
  formData: CreateDocumentCategoryFormValues,
) {
  const user = getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const parsed = createDocumentCategorySchema.safeParse({
      name: formData.name,
      description: formData.description,
      parentId: formData.parentId,
    });

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten() };
    }

    await prisma.documentCategory.create({
      data: parsed.data,
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Error creating category" };
  }
}

export async function updateCategory(
  formData: UpdateDocumentCategoryFormValues,
) {
  const user = getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const id = formData.id;

    const parsed = updateDocumentCategorySchema.safeParse({
      id,
      name: formData.name,
      description: formData.description,
      parentId: formData.parentId,
    });

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten() };
    }

    await prisma.documentCategory.update({
      where: { id },
      data: parsed.data,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Error updating category" };
  }
}

export async function deleteCategory(categoryId: string) {
  const user = getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.documentCategory.delete({
      where: { id: categoryId },
    });

    revalidatePath("/categories");

    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Error deleting category" };
  }
}
