"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  userFormSchema,
  type UserFormValuesWithRolesAndDepartments,
} from "./users.validations";
import { nullToUndefined } from "@/lib/utils";

// Get all users with their roles
export async function getUsers() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const userRole = users.map((user) => user.role);
    const userDepartment = users.map((user) => user.department);

    return {
      success: true,
      users: users.map((user) => ({
        ...user,
      })),
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

// Get a single user by ID
export async function getUserById(userId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        department: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      user: {
        ...user,
        role: user.role,
        department: user.department,
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

// Create a new user
export async function createUser(data: UserFormValuesWithRolesAndDepartments) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Validate data
    const validatedData = userFormSchema.parse(data);

    // Hash password if provided
    const hashedPassword = validatedData.password
      ? await bcrypt.hash(validatedData.password, 10)
      : undefined;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { success: false, error: "Email already in use" };
    }

    // Create the user with roles and departments
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        username: validatedData.name,
        email: validatedData.email,
        password: hashedPassword || "",
        role: {
          connect: { id: validatedData.role.id },
        },
        ...(validatedData.department
          ? {
              department: {
                connect: { id: validatedData.department.id },
              },
            }
          : {}),
      },
      include: {
        role: true,
        department: true,
      },
    });

    // Revalidate users pages
    revalidatePath("/users");

    return { success: true, user };
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to create user" };
  }
}

// Update an existing user
export async function updateUser(
  userId: string,
  data: UserFormValuesWithRolesAndDepartments,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Validate data
    const validatedData = userFormSchema.parse(data);

    // Hash password if provided and not empty
    let hashedPassword: string | undefined;
    if (validatedData.password) {
      hashedPassword = await bcrypt.hash(validatedData.password, 10);
    }

    // Check if email already exists (for another user)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return { success: false, error: "Email already in use by another user" };
    }

    // Start a transaction to handle the user update
    await prisma.$transaction(async (tx) => {
      // Update basic user info
      const userData: any = {
        name: validatedData.name,
        email: validatedData.email,
      };

      // Only update password if provided
      if (hashedPassword) {
        userData.password = hashedPassword;
      }

      // Update the user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: userData,
      });

      // Update department assignments
      if (validatedData.department)
        await tx.user.update({
          where: { id: userId },
          data: {
            department: {
              connect: { id: validatedData.department.id },
            },
          },
        });

      // Update role assignments
      await tx.user.update({
        where: { id: userId },
        data: {
          role: {
            connect: { id: validatedData.role.id },
          },
        },
      });

      return updatedUser;
    });

    // Revalidate users pages
    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to update user" };
  }
}

// Delete a user
export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Get user details for audit log
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Delete the user (cascades to userRoles)
    await prisma.user.delete({
      where: { id: userId },
    });

    // // Log audit
    // await prisma.auditLog.create({
    //   data: {
    //     userId: session.user.id,
    //     action: "DELETE",
    //     entity: "USER",
    //     entityId: userId,
    //     details: `Deleted user: ${user.name} (${user.email})`,
    //   },
    // });

    // Revalidate users page
    revalidatePath("/users");

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export const getTestingEmails = async () => {
  const emails = await prisma.user.findMany({
    select: {
      email: true,
    },
  });

  return emails.map((email) => email.email);
};
