import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("adminpassword", 10);

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Full system access",
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: "EMPLOYEE" },
    update: {},
    create: {
      name: "EMPLOYEE",
      description: "Basic access to report incidents and view own reports",
    },
  });

  const qualityAssuranceRole = await prisma.role.upsert({
    where: { name: "QUALITY_ASSURANCE" },
    update: {},
    create: {
      name: "QUALITY_ASSURANCE",
      description: "Basic access to review documents and placeholder documents",
    },
  });

  // Create sample departments
  const itDepartment = await prisma.department.upsert({
    where: { name: "Information Technology" },
    update: {
      name: "Information Technology",
    },
    create: {
      name: "Information Technology",
    },
  });

  const securityDepartment = await prisma.department.upsert({
    where: { name: "Security" },
    update: {
      name: "Security",
    },
    create: {
      name: "Security",
    },
  });

  const qualityAssuranceDepartment = await prisma.department.upsert({
    where: { name: "Quality Assurance" },
    update: {
      name: "Quality Assurance",
    },
    create: {
      name: "Quality Assurance",
    },
  });

  const hrDepartment = await prisma.department.upsert({
    where: { name: "Human Resources" },
    update: {
      name: "Human Resources",
    },
    create: {
      name: "Human Resources",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@docbox.com" },
    update: {
      email: "admin@docbox.com",
      name: "Admin User",
      username: "admin",
      password: hashedPassword,
      roleId: adminRole.id,
    },
    create: {
      email: "admin@docbox.com",
      name: "Admin User",
      username: "admin",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  const itUser = await prisma.user.upsert({
    where: { email: "salem@docbox.com" },
    update: {
      email: "salem@docbox.com",
      name: "Salem Ali",
      username: "salem",
      password: hashedPassword,
      roleId: employeeRole.id,
      departmentId: itDepartment.id,
    },
    create: {
      email: "salem@docbox.com",
      name: "Salem Ali",
      username: "salem",
      password: hashedPassword,
      roleId: employeeRole.id,
      departmentId: itDepartment.id,
    },
  });

  const hrUser = await prisma.user.upsert({
    where: { email: "hr@docbox.com" },
    update: {
      email: "hr@docbox.com",
      name: "HR User",
      username: "hr",
      password: hashedPassword,
      roleId: employeeRole.id,
      departmentId: hrDepartment.id,
    },
    create: {
      email: "hr@docbox.com",
      name: "HR User",
      username: "hr",
      password: hashedPassword,
      roleId: employeeRole.id,
      departmentId: hrDepartment.id,
    },
  });

  const qualityAssuranceUser = await prisma.user.upsert({
    where: { email: "sara@docbox.com" },
    update: {
      email: "sara@docbox.com",
      name: "Sara Ali",
      username: "sara",
      password: hashedPassword,
      roleId: qualityAssuranceRole.id,
      departmentId: qualityAssuranceDepartment.id,
    },
    create: {
      email: "sara@docbox.com",
      name: "Sara Ali",
      username: "sara",
      password: hashedPassword,
      roleId: qualityAssuranceRole.id,
      departmentId: qualityAssuranceDepartment.id,
    },
  });

  const securityUser = await prisma.user.upsert({
    where: { email: "sec@docbox.com" },
    update: {
      email: "sec@docbox.com",
      name: "Security User",
      username: "security",
      password: hashedPassword,
      roleId: employeeRole.id,
      departmentId: securityDepartment.id,
    },
    create: {
      email: "sec@docbox.com",
      name: "Security User",
      username: "security",
      password: hashedPassword,
      roleId: employeeRole.id,
      departmentId: securityDepartment.id,
    },
  });

  await prisma.documentCategory.upsert({
    where: { name: "HR" },
    update: {
      name: "HR",
      description: "Human Resources",
    },
    create: {
      name: "HR",
      description: "Human Resources",
    },
  });

  await prisma.documentCategory.upsert({
    where: { name: "Legal" },
    update: {
      name: "Legal",
      description: "Legal",
    },
    create: {
      name: "Legal",
      description: "Legal",
    },
  });

  await prisma.documentCategory.upsert({
    where: { name: "PPG" },
    update: {
      name: "PPG",
      description: "PPG",
    },
    create: {
      name: "PPG",
      description: "PPG",
    },
  });

  const statusDraft = await prisma.documentStatus.upsert({
    where: { name: "DRAFT" },
    update: {
      name: "DRAFT",
      variant: "outline",
      description: "Draft",
    },
    create: {
      name: "DRAFT",
      variant: "outline",
      description: "Draft",
    },
  });

  const statusReview = await prisma.documentStatus.upsert({
    where: { name: "REVIEW" },
    update: {
      name: "REVIEW",
      variant: "secondary",
      description: "Document sent for review",
    },
    create: {
      name: "REVIEW",
      variant: "secondary",
      description: "Document sent for review",
    },
  });

  const statusUnderRevision = await prisma.documentStatus.upsert({
    where: { name: "UNDER_REVISION" },
    update: {
      name: "UNDER_REVISION",
      variant: "secondary",
      description: "Document needs changes after review",
    },
    create: {
      name: "UNDER_REVISION",
      variant: "secondary",
      description: "Document needs changes after review",
    },
  });

  const statusPartialApproved = await prisma.documentStatus.upsert({
    where: { name: "PARTIAL_APPROVED" },
    update: {
      name: "PARTIAL_APPROVED",
      variant: "secondary",
      description: "Document partially approved by the reviewer",
    },
    create: {
      name: "PARTIAL_APPROVED",
      variant: "secondary",
      description: "Document partially approved by the reviewer",
    },
  });

  const statusDeclined = await prisma.documentStatus.upsert({
    where: { name: "DECLINED" },
    update: {
      name: "DECLINED",
      variant: "secondary",
      description: "Document declined by the reviewer",
    },
    create: {
      name: "DECLINED",
      variant: "secondary",
      description: "Document declined by the reviewer",
    },
  });

  const statusApproved = await prisma.documentStatus.upsert({
    where: { name: "APPROVED" },
    update: {
      name: "APPROVED",
      variant: "secondary",
      description: "Document approved after review but not yet signed",
    },
    create: {
      name: "APPROVED",
      variant: "secondary",
      description: "Document approved after review but not yet signed",
    },
  });

  const statusUnderProcessing = await prisma.documentStatus.upsert({
    where: { name: "UNDER_PROCESSING" },
    update: {
      name: "UNDER_PROCESSING",
      variant: "secondary",
      description: "Document under processing placing signers and placeholders",
    },
    create: {
      name: "UNDER_PROCESSING",
      variant: "secondary",
      description: "Document under processing placing signers and placeholders",
    },
  });

  const statusPendingSignatures = await prisma.documentStatus.upsert({
    where: { name: "PENDING_SIGNATURES" },
    update: {
      name: "PENDING_SIGNATURES",
      variant: "secondary",
      description: "Document sent for signatures",
    },
    create: {
      name: "PENDING_SIGNATURES",
      variant: "secondary",
      description: "Document sent for signatures",
    },
  });

  const statusSigned = await prisma.documentStatus.upsert({
    where: { name: "SIGNED" },
    update: {
      name: "SIGNED",
      variant: "secondary",
      description: "Document signed by the signers but not yet published",
    },
    create: {
      name: "SIGNED",
      variant: "secondary",
      description: "Document signed by the signers but not yet published",
    },
  });

  const statusPublished = await prisma.documentStatus.upsert({
    where: { name: "PUBLISHED" },
    update: {
      name: "PUBLISHED",
      variant: "secondary",
      description: "Document published by creator",
    },
    create: {
      name: "PUBLISHED",
      variant: "secondary",
      description: "Document published by creator",
    },
  });

  const statusExpired = await prisma.documentStatus.upsert({
    where: { name: "EXPIRED" },
    update: {
      name: "EXPIRED",
      variant: "destructive",
      description: "Document expired",
    },
    create: {
      name: "EXPIRED",
      variant: "destructive",
      description: "Document expired",
    },
  });

  const statusArchived = await prisma.documentStatus.upsert({
    where: { name: "ARCHIVED" },
    update: {
      name: "ARCHIVED",
      variant: "destructive",
      description: "Document archived",
    },
    create: {
      name: "ARCHIVED",
      variant: "destructive",
      description: "Document archived",
    },
  });

  const statusDeleted = await prisma.documentStatus.upsert({
    where: { name: "DELETED" },
    update: {
      name: "DELETED",
      variant: "destructive",
      description: "Document deleted",
    },
    create: {
      name: "DELETED",
      variant: "destructive",
      description: "Document deleted",
    },
  });

  const permissions = [
    // Admin permissions
    {
      code: "admin:all",
      name: "Manage All",
      description: "Ability to view all pages",
    },
    {
      code: "manage:management",
      name: "Manage System",
      description: "Ability to view management and users pages",
    },
    {
      code: "manage:users",
      name: "Manage users",
      description: "Ability to view users pages",
    },
    {
      code: "manage:roles",
      name: "Manage roles",
      description: "Ability to view roles pages",
    },
    {
      code: "manage:departments",
      name: "Manage Departments",
      description: "Ability to view departments pages",
    },
    {
      code: "manage:permissions",
      name: "Manage Permissions",
      description: "Ability to view permissions pages",
    },
    {
      code: "manage:documents",
      name: "Manage Documents",
      description: "Ability to view documents pages",
    },
    // HR Employee permissions
    {
      code: "manage:employees",
      name: "Manage Employees",
      description: "Ability to view employees pages",
    },
    {
      code: "manage:reports",
      name: "Manage Reports",
      description: "Ability to view reports pages",
    },
    {
      code: "manage:dashboards",
      name: "Manage Dashboards",
      description: "Ability to view dashboards pages",
    },
    {
      code: "create:document",
      name: "Create Document",
      description: "Ability to create documents",
    },
    {
      code: "edit:document",
      name: "Edit Document",
      description: "Ability to edit documents",
    },
    {
      code: "refer:document",
      name: "Refer Document",
      description: "Ability to refer documents to departments",
    },
    {
      code: "review:document",
      name: "Review Document",
      description: "Ability to review documents",
    },
    {
      code: "placeholder:document",
      name: "Placeholder Document",
      description: "Ability to placeholder documents",
    },
    {
      code: "sign:document",
      name: "Sign Document",
      description: "Ability to sign documents",
    },
    {
      code: "approve:document",
      name: "Approve Document",
      description: "Ability to approve documents",
    },
  ];

  console.log("Creating permissions...");
  const createdPermissions = [];

  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: { code: perm.code },
      update: perm,
      create: perm,
    });
    createdPermissions.push(permission);
  }

  const rolePermissions = {
    ADMIN: ["admin:all"],
    EMPLOYEE: [
      "manage:reports",
      "manage:documents",
      "manage:dashboards",
      "sign:document",
      "review:document",
      "approve:document",
    ],
    QUALITY_ASSURANCE: [
      "refer:document",
      "review:document",
      "placeholder:document",
      "manage:documents",
      "manage:dashboards",
      "create:document",
      "edit:document",
    ],
  };

  console.log("Assigning permissions to roles...");

  // Clear existing role-permission associations first to avoid duplicates
  await prisma.rolePermission.deleteMany({});

  // Create role-permission associations
  for (const [roleName, permCodes] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      console.log(`Role ${roleName} not found, skipping permission assignment`);
      continue;
    }

    for (const permCode of permCodes) {
      const permission = await prisma.permission.findUnique({
        where: { code: permCode },
      });

      if (!permission) {
        console.log(`Permission ${permCode} not found, skipping`);
        continue;
      }

      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("Permissions assigned successfully");

  console.log("Seeding completed successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
