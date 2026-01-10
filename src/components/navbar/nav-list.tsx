"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NavItem } from "@/config/nav.config";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NavList({ items }: { items: NavItem[] }) {
  const { data: session } = useSession();

  const pathname = usePathname();

  if (!session) return null;

  return (
    <>
      {items.map((item) => (
        <div key={item.label}>
          {item.href ? (
            <Link
              key={item.href}
              href={item.href || ""}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}>
              {item.label}
            </Link>
          ) : (
            <></>
          )}
          {item.children && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  pathname.startsWith("/users") || pathname.startsWith("/roles")
                    ? "text-primary"
                    : "text-muted-foreground"
                )}>
                <>
                  {item.label}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {item.children?.map((child) => (
                  <DropdownMenuItem key={child.href} asChild>
                    <Link href={child.href || ""}>{child.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ))}
    </>
  );
}
