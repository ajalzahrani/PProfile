// src/config/nav.config.ts

export type NavItem = {
  label: string;
  href?: string; // Optional if item has children
  icon?: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  children?: NavItem[]; // 👈 Support nested items
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    requiredPermissions: ["manage:dashboard"],
  },

  {
    label: "Documents",
    href: "/documents",
    requiredPermissions: ["manage:documents"],
  },
  {
    label: "Reports",
    href: "/reports",
    requiredPermissions: ["manage:reports"],
  },
  {
    label: "Management",
    requiredPermissions: ["manage:management"],
    children: [
      {
        label: "Users",
        href: "/users",
        requiredPermissions: ["manage:users"],
      },
      {
        label: "Roles",
        href: "/roles",
        requiredPermissions: ["manage:roles"],
      },
      {
        label: "Permissions",
        href: "/permissions",
        requiredPermissions: ["manage:permissions"],
      },
      {
        label: "Departments",
        href: "/departments",
        requiredPermissions: ["manage:departments"],
      },
    ],
  },

  // Add more items here...
];
