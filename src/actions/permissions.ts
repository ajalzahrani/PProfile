"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  PermissionFormValues,
  permissionSchema,
} from "./permissions.validation";

// Get all permissions
export async function getPermissions() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const permissions = await prisma.permission.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      permissions,
    };
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return { success: false, error: "Failed to fetch permissions" };
  }
}

// Get a single permission by ID
export async function getPermissionById(permissionId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      return { success: false, error: "Permission not found" };
    }

    return {
      success: true,
      permission,
    };
  } catch (error) {
    console.error("Error fetching permission:", error);
    return { success: false, error: "Failed to fetch permission" };
  }
}

// Create a new permission
export async function createPermission(data: PermissionFormValues) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Validate data
    const validatedData = permissionSchema.parse(data);

    // Check if code already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { code: validatedData.code },
    });

    if (existingPermission) {
      return { success: false, error: "Permission code already exists" };
    }

    // Create the permission
    const permission = await prisma.permission.create({
      data: {
        code: validatedData.code,
        name: validatedData.name,
        description: validatedData.description || null,
      },
    });

    // Revalidate permissions pages
    revalidatePath("/permissions");

    return { success: true, permission };
  } catch (error) {
    console.error("Error creating permission:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to create permission" };
  }
}

// Update an existing permission
export async function updatePermission(
  permissionId: string,
  data: PermissionFormValues
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Validate data
    const validatedData = permissionSchema.parse(data);

    // Check if code already exists (for another permission)
    const existingPermission = await prisma.permission.findFirst({
      where: {
        code: validatedData.code,
        NOT: { id: permissionId },
      },
    });

    if (existingPermission) {
      return { success: false, error: "Permission code already in use" };
    }

    // Update permission info
    const permission = await prisma.permission.update({
      where: { id: permissionId },
      data: {
        code: validatedData.code,
        name: validatedData.name,
        description: validatedData.description || null,
      },
    });

    // Revalidate permissions pages
    revalidatePath("/permissions");
    revalidatePath(`/permissions/${permissionId}`);

    return { success: true, permission };
  } catch (error) {
    console.error("Error updating permission:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to update permission" };
  }
}

// Delete a permission
export async function deletePermission(permissionId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Get permission details
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
      include: {
        roles: true,
      },
    });

    if (!permission) {
      return { success: false, error: "Permission not found" };
    }

    // Check if permission is in use
    if (permission.roles.length > 0) {
      return {
        success: false,
        error: "Cannot delete permission as it is assigned to roles",
      };
    }

    // Delete the permission
    await prisma.permission.delete({
      where: { id: permissionId },
    });

    // Revalidate permissions page
    revalidatePath("/permissions");

    return { success: true };
  } catch (error) {
    console.error("Error deleting permission:", error);
    return { success: false, error: "Failed to delete permission" };
  }
}

// Get permissions by role id
export async function getPermissionsByRoleId(roleId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Get permission details
    const permissions = await prisma.permission.findMany({
      where: { roles: { some: { roleId } } },
    });

    return { success: true, permissions };
  } catch (error) {
    console.error("Error fetching permissions by role id:", error);
    return { success: false, error: "Failed to fetch permissions by role id" };
  }
}
