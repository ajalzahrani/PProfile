"use server";
import { prisma } from "@/lib/prisma";
import { authOptions, getCurrentUser } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { unstable_cache as cache, revalidateTag } from "next/cache";
import { getPermissionsByRoleId } from "./permissions";

// Cached function to get user data by ID
const getCachedUserById = cache(
  async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    return user;
  },
  ["user-by-id"],
  { tags: ["user-session"], revalidate: 300 } // Cache for 5 minutes
);

// Get current user by first getting session outside cache, then using cached function
export async function getCurrentUserFromDB(userId: string) {
  return getCachedUserById(userId);
}

// Create a cache function factory that generates unique cache functions per user
function createUserPermissionsCache(userId: string) {
  return cache(
    async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { roleId: true },
      });

      if (!user?.roleId) return [];

      const permissions = await prisma.rolePermission.findMany({
        where: { roleId: user.roleId },
        include: { permission: true },
      });

      return permissions.map((rp) => rp.permission.code);
    },
    [`user-permissions-${userId}`],
    { tags: ["permissions", `user-${userId}`], revalidate: 300 }
  );
}

export const getUserPermissions = async (userId: string) => {
  if (!userId) return [];
  const permissionsCache = createUserPermissionsCache(userId);
  return await permissionsCache();
};

export const checkServerPermission = async (required: string | string[]) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userPermissions = await getUserPermissions(user.id);

  if (userPermissions.includes("admin:all")) {
    return true;
  }

  const requiredArray = typeof required === "string" ? [required] : required;
  const hasRequiredPermission = requiredArray.some((perm) =>
    userPermissions.includes(perm)
  );

  if (!hasRequiredPermission) {
    redirect("/unauthorized");
  }

  return true;
};

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      role: {
        select: { id: true, name: true },
      },
      department: {
        select: { id: true },
      },
    },
  });

  if (!user || !user.password) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return null;
  }

  const permissions = await prisma.permission.findMany({
    where: { roles: { some: { roleId: user.role.id } } },
  });

  if (!permissions) {
    return null;
  }

  console.log("user", {
    ...user,
    permissions: permissions.map((p) => p.code),
  });

  return {
    ...user,
    permissions: permissions.map((p) => p.code),
  };
}
