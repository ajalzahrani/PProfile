"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/permissions";
import { useEffect, useState } from "react";

interface PermissionButtonProps extends ButtonProps {
  permission: string | string[];
  fallback?: React.ReactNode;
  asChild?: boolean;
  children?: React.ReactNode;
}

export function PermissionButton({
  permission,
  children,
  fallback = null,
  asChild = false,
  ...props
}: PermissionButtonProps) {
  const { data: session, status } = useSession();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const userPermissions = session?.user?.permissions || [];
      const canAccess = hasPermission(userPermissions, permission);
      setCanAccess(canAccess);
    }
  }, [session, status, permission]);

  if (!canAccess) {
    // If asChild is true, we need to return something that accepts asChild
    if (asChild && fallback) {
      // If there's a fallback and asChild is true, wrap fallback in Button with asChild
      return (
        <Button {...props} asChild>
          {fallback}
        </Button>
      );
    }
    // Otherwise just return the fallback
    return <>{fallback}</>;
  }

  return <Button {...props}>{children}</Button>;
}
