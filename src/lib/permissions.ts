// src/lib/permissions.ts
export function hasPermission(
  userPermissions: string[],
  required: string | string[]
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  // Check for admin permission first (full access)
  if (userPermissions.includes("admin:all")) {
    return true;
  }

  // If a single permission is required
  if (typeof required === "string") {
    return userPermissions.includes(required);
  }

  // If any of the required permissions is sufficient (OR logic)
  return required.some((perm) => userPermissions.includes(perm));
}
