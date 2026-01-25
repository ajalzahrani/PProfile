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
    label: "Compliance Documents",
    href: "/user-documents",
    requiredPermissions: ["manage-compliance:documents"],
  },
  {
    label: "Profile",
    href: "/person-profile",
    requiredPermissions: ["manage:profiles"],
  },
  {
    label: "Document Config",
    href: "/documents-config",
    requiredPermissions: ["manage:document-configs"],
  },
  {
    label: "Admin Dashboard",
    href: "/admin-dashboard",
    requiredPermissions: ["manage:admin-dashboards"],
  },
  {
    label: "Certificates",
    href: "/categories",
    requiredPermissions: ["manage:categories"],
  },
  {
    label: "Job Titles",
    href: "/jobtitles",
    requiredPermissions: ["manage:jobtitles"],
  },
  {
    label: "Others",
    requiredPermissions: ["manage:management"],
    children: [
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
    ],
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
