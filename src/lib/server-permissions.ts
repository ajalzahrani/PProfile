import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function checkServerPermission(required: string | string[]) {
  // Fetch user with role and permissions
  const user = await getCurrentUser();

  // If user has no session, redirect to login page
  if (!user) {
    redirect("/login");
  }

  // Check for admin permission first
  const userPermissions = user.permissions;

  if (userPermissions.includes("admin:all")) {
    return true;
  }

  // Check specific permissions
  const requiredArray = typeof required === "string" ? [required] : required;
  const hasRequiredPermission = requiredArray.some((perm) =>
    userPermissions.includes(perm)
  );

  if (!hasRequiredPermission) {
    redirect("/unauthorized");
  }

  return true;
}
