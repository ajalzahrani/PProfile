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

  const doctorRole = await prisma.role.upsert({
    where: { name: "DOCTOR" },
    update: {},
    create: {
      name: "DOCTOR",
      description: "Access to view and manage documents",
    },
  });

  const nurseRole = await prisma.role.upsert({
    where: { name: "NURSE" },
    update: {},
    create: {
      name: "NURSE",
      description: "Access to view and manage documents",
    },
  });

  const technicianRole = await prisma.role.upsert({
    where: { name: "TECHNICIAN" },
    update: {},
    create: {
      name: "TECHNICIAN",
      description: "Access to view and manage documents",
    },
  });

  const auditorRole = await prisma.role.upsert({
    where: { name: "AUDITOR" },
    update: {},
    create: {
      name: "AUDITOR",
      description: "Ability to view, approve, and reject uploaded documents",
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

  const familyMedicineDepartment = await prisma.department.upsert({
    where: { name: "Family Medicine" },
    update: {
      name: "Family Medicine",
    },
    create: {
      name: "Family Medicine",
    },
  });

  const pediatricsDepartment = await prisma.department.upsert({
    where: { name: "Pediatrics" },
    update: {
      name: "Pediatrics",
    },
    create: {
      name: "Pediatrics",
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
    
    const auditorUser = await prisma.user.upsert({
      where: { email: "auditor@docbox.com" },
      update: {
        email: "auditor@docbox.com",
        name: "Auditor User",
        username: "auditor",
        password: hashedPassword,
        roleId: auditorRole.id,
        departmentId: hrDepartment.id,
      },
      create: {
        email: "auditor@docbox.com",
        name: "Auditor User",
        username: "auditor",
        password: hashedPassword,
        roleId: auditorRole.id,
        departmentId: hrDepartment.id,
      },
    });

  const doctorUser = await prisma.user.upsert({
    where: { email: "fmc-doctor@docbox.com" },
    update: {
      email: "fmc-doctor@docbox.com",
      name: "Family Medicine Doctor User",
      username: "fmc-doctor",
      password: hashedPassword,
      roleId: doctorRole.id,
      departmentId: familyMedicineDepartment.id,
    },
    create: {
      email: "fmc-doctor@docbox.com",
      name: "Family Medicine Doctor User",
      username: "fmc-doctor",
      password: hashedPassword,
      roleId: doctorRole.id,
      departmentId: familyMedicineDepartment.id,
    },
  });

  const nurseUser = await prisma.user.upsert({
    where: { email: "ped-nurse@docbox.com" },
    update: {
      email: "ped-nurse@docbox.com",
      name: "Pediatrics Nurse User",
      username: "ped-nurse",
      password: hashedPassword,
      roleId: nurseRole.id,
      departmentId: pediatricsDepartment.id,
    },
    create: {
      email: "ped-nurse@docbox.com",
      name: "Pediatrics Nurse User",
      username: "ped-nurse",
      password: hashedPassword,
      roleId: nurseRole.id,
      departmentId: pediatricsDepartment.id,
    },
  });

  const nationalities = [
    {
      nameEn: "Saudi",
      nameAr: "سعودي",
    },
    {
      nameEn: "Egyptian",
      nameAr: "مصري",
    },
    {
      nameEn: "American",
      nameAr: "أمريكي",
    },
    {
      nameEn: "Indian",
      nameAr: "هندي",
    },
  ];

  console.log("Creating nationalities...");
  const createdNationalities = [];

  for (const nationality of nationalities) {
    const createdNationality = await prisma.nationality.upsert({
      where: { nameEn: nationality.nameEn },
      update: nationality,
      create: nationality,
    });
    createdNationalities.push(createdNationality);
  }

  console.log("Nationalities created successfully");

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

  const statusRejected = await prisma.documentStatus.upsert({
    where: { name: "REJECTED" },
    update: {
      name: "REJECTED",
      variant: "destructive",
      description: "Document rejected by the auditor with a comment",
    },
    create: {
      name: "REJECTED",
      variant: "destructive",
      description: "Document rejected by the auditor with a comment",
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
    /* 
    
              Document Permissions 
    
    */
    {
      code: "manage:documents",
      name: "Manage Documents",
      description: "Ability to view documents pages",
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
    {
      code: "reject:document",
      name: "Reject Document",
      description: "Ability to reject documents",
    },
    {
      code: "manage:document-configs",
      name: "Manage documents configurations",
      description: "Ability to view document configuration",
    },
    {
      code: "add-new-requirement:document",
      name: "Add New Requirement for Document",
      description:
        "Ability to add new requirements for document configurations",
    },
    {
      code: "manage-compliance:documents",
      name: "Manage Compliance Documents",
      description: "Ability to view compliance documents",
    },
    {
      code: "manage:profiles",
      name: "Manage profiles",
      description: "Ability to view profile page",
    },
    /* 
    
              Sysetm ADministrator 
    
    */
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
    AUDITOR: [
      "review:document",
      "approve:document",
      "reject:document",
      "manage:documents",
      "manage:dashboards",
      "create:document",
      "edit:document",
      "manage:management",
    ],
    DOCTOR: [
      "manage-compliance:documents",
      "manage:profiles",
      "manage:dashboards",
    ],
    NURSE: [
      "manage-compliance:documents",
      "manage:profiles",
      "manage:dashboards",
    ],
    TECHNICIAN: [
      "manage-compliance:documents",
      "manage:profiles",
      "manage:dashboards",
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
