// src/components/auth/permission-check.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { useSession } from "next-auth/react";

interface PermissionCheckProps {
  required: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionCheck({
  required,
  children,
  fallback = null,
}: PermissionCheckProps) {
  const { data: session, status } = useSession();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const userPermissions = session?.user?.permissions || [];
      const canAccess = hasPermission(userPermissions, required);
      setCanAccess(canAccess);
    }
  }, [session, status, required]);

  if (status === "loading") {
    return null;
  }

  return canAccess ? <>{children}</> : <>{fallback}</>;
}
