import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Document Categories
  const categories = [
    { name: "Medical License", requiresExpiry: true },
    { name: "BLS Certificate", requiresExpiry: true },
    { name: "ACLS Certificate", requiresExpiry: true },
    { name: "University Degree", requiresExpiry: false },
    { name: "Professional Indemnity", requiresExpiry: true },
  ];

  const catMap: any = {};
  for (const cat of categories) {
    const record = await prisma.documentCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
    catMap[cat.name] = record;
  }

  // 2. Updated Seed Job Titles
  const jobs = [
    { en: "Doctor", ar: "طبيب" },
    { en: "Nurse", ar: "ممرض" },
    { en: "Technician", ar: "فني" },
  ];

  const jobMap: any = {};

  for (const job of jobs) {
    const record = await prisma.jobTitle.upsert({
      where: { nameEn: job.en }, // Ensure nameEn is marked as @unique in schema
      update: {},
      create: {
        nameEn: job.en,
        nameAr: job.ar,
      },
    });
    jobMap[job.en] = record;
  }

  // 3. Seed Certificate Requirements (The Rules Engine)
  const requirements = [
    // Requirements for Doctors
    { job: "Doctor", cat: "Medical License", mandatory: true, expiry: true },
    { job: "Doctor", cat: "BLS Certificate", mandatory: true, expiry: true },
    { job: "Doctor", cat: "ACLS Certificate", mandatory: true, expiry: true },
    { job: "Doctor", cat: "University Degree", mandatory: true, expiry: false },
    {
      job: "Doctor",
      cat: "Professional Indemnity",
      mandatory: true,
      expiry: true,
    },

    // Requirements for Nurses
    { job: "Nurse", cat: "Medical License", mandatory: true, expiry: true },
    { job: "Nurse", cat: "BLS Certificate", mandatory: true, expiry: true },
    { job: "Nurse", cat: "University Degree", mandatory: true, expiry: false },

    // Requirements for Technicians
    {
      job: "Technician",
      cat: "BLS Certificate",
      mandatory: true,
      expiry: true,
    },
    {
      job: "Technician",
      cat: "University Degree",
      mandatory: true,
      expiry: false,
    },
  ];

  for (const req of requirements) {
    await prisma.certificateRequirement.upsert({
      where: {
        jobTitleId_documentCategoryId: {
          jobTitleId: jobMap[req.job].id,
          documentCategoryId: catMap[req.cat].id,
        },
      },
      update: {
        isRequired: req.mandatory,
        requiresExpiry: req.expiry,
      },
      create: {
        jobTitleId: jobMap[req.job].id,
        documentCategoryId: catMap[req.cat].id,
        isRequired: req.mandatory,
        requiresExpiry: req.expiry,
      },
    });
  }

  console.log("✅ Seeded 3 Job Titles and 10 Certificate Requirements.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
