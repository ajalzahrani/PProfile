"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  DepartmentFormValues,
  departmentSchema,
} from "./departments.validation";
import { revalidatePath } from "next/cache";
/**
 * Get all departments
 */
export async function getDepartments() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, departments };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return { success: false, error: "Error fetching departments" };
  }
}

/**
 * Get department by ID
 */
export async function getDepartmentById(departmentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        users: true,
      },
    });

    return { success: true, department };
  } catch (error) {
    console.error("Error fetching department:", error);
    return { success: false, error: "Error fetching department" };
  }
}

/**
 * Get departments for select
 */
export async function getDepartmentsForSelect() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return { success: true, departments };
  } catch (error) {
    console.error("Error fetching department:", error);
    return { success: false, error: "Error fetching department" };
  }
}

/**
 * Create a new department
 */
export async function createDepartment(department: DepartmentFormValues) {
  const session = await getServerSession(authOptions);

  const validatedFields = departmentSchema.safeParse(department);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const newDepartment = await prisma.department.create({
      data: department,
    });

    return { success: true, department: newDepartment };
  } catch (error) {
    console.error("Error creating department:", error);
    return { success: false, error: "Error creating department" };
  }
}

/**
 * Update a department
 */
export async function updateDepartment(
  departmentId: string,
  department: DepartmentFormValues
) {
  const session = await getServerSession(authOptions);

  const validatedFields = departmentSchema.safeParse(department);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: department,
    });

    revalidatePath("/departments");

    return { success: true, department: updatedDepartment };
  } catch (error) {
    console.error("Error updating department:", error);
    return { success: false, error: "Error updating department" };
  }
}

/**
 * Delete a department
 */
export async function deleteDepartment(departmentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.department.delete({
      where: { id: departmentId },
    });

    revalidatePath("/departments");

    return { success: true };
  } catch (error) {
    console.error("Error deleting department:", error);
    return { success: false, error: "Error deleting department" };
  }
}

/**
 * Get document departments
 */
export async function getDocumentDepartmentsForSelect(documentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const departments = await prisma.department.findMany({
      where: { documents: { some: { id: documentId } } },
    });

    return { success: true, departments };
  } catch (error) {
    console.error("Error fetching document departments:", error);
    return { success: false, error: "Error fetching document departments" };
  }
}
