"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { RoleFormValues, roleSchema } from "./roles.validation";

// Get all roles with their permissions
export async function getRoles() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      roles: roles,
    };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { success: false, error: "Failed to fetch roles" };
  }
}

// Get all roles with their permissions
export async function getRolesWithPermissions() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        permissions: true,
      },
    });

    return {
      success: true,
      roles: roles,
    };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { success: false, error: "Failed to fetch roles" };
  }
}

// Get a single role by ID
export async function getRoleById(roleId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return { success: false, error: "Role not found" };
    }

    return {
      success: true,
      role: {
        ...role,
      },
    };
  } catch (error) {
    console.error("Error fetching role:", error);
    return { success: false, error: "Failed to fetch role" };
  }
}

// Create a new role
export async function createRole(data: RoleFormValues) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Validate data
    const validatedData = roleSchema.parse(data);

    // Check if name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: validatedData.name },
    });

    if (existingRole) {
      return { success: false, error: "Role name already exists" };
    }

    // Create the role with permissions
    const role = await prisma.role.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
      },
    });

    // Revalidate roles pages
    revalidatePath("/roles");

    return { success: true, role };
  } catch (error) {
    console.error("Error creating role:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to create role" };
  }
}

// Update an existing role
export async function updateRole(
  roleId: string,
  data: RoleFormValues,
  permissionIds: string[]
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Validate data
    const validatedData = roleSchema.parse(data);

    // Check if name already exists (for another role)
    const existingRole = await prisma.role.findFirst({
      where: {
        name: validatedData.name,
        NOT: { id: roleId },
      },
    });

    if (existingRole) {
      return { success: false, error: "Role name already in use" };
    }

    // Start a transaction to handle the role update
    const role = await prisma.$transaction(async (tx) => {
      // Update basic role info
      const updatedRole = await tx.role.update({
        where: { id: roleId },
        data: {
          name: validatedData.name,
          description: validatedData.description || null,
        },
      });

      // Update role permissions
      // First, remove all existing permissions for this role
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // Then, add the new permissions
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }

      return updatedRole;
    });

    // Revalidate user & role permissions
    revalidateTag(`user-session`);
    revalidateTag(`user-permissions-${session.user.id}`);

    // Revalidate roles pages
    revalidatePath("/roles");
    revalidatePath(`/roles/${roleId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating role:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to update role" };
  }
}

// Delete a role
export async function deleteRole(roleId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Get role details for audit log
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return { success: false, error: "Role not found" };
    }

    // Check if role is in use
    const userRolesCount = await prisma.user.count({
      where: { roleId },
    });

    if (userRolesCount > 0) {
      return {
        success: false,
        error: "Cannot delete role as it is assigned to users",
      };
    }

    // Delete the role (cascades to rolePermissions)
    await prisma.role.delete({
      where: { id: roleId },
    });

    // Revalidate roles page
    revalidatePath("/roles");

    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    return { success: false, error: "Failed to delete role" };
  }
}
