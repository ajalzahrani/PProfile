/*
  Warnings:

  - You are about to drop the column `tags` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "CertificateRequirement" (
    "id" TEXT NOT NULL,
    "jobTitleId" TEXT NOT NULL,
    "documentCategoryId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "requiresExpiry" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CertificateRequirement_jobTitleId_documentCategoryId_key" ON "CertificateRequirement"("jobTitleId", "documentCategoryId");

-- AddForeignKey
ALTER TABLE "CertificateRequirement" ADD CONSTRAINT "CertificateRequirement_jobTitleId_fkey" FOREIGN KEY ("jobTitleId") REFERENCES "JobTitle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateRequirement" ADD CONSTRAINT "CertificateRequirement_documentCategoryId_fkey" FOREIGN KEY ("documentCategoryId") REFERENCES "DocumentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
