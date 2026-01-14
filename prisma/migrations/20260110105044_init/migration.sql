/*
  Warnings:

  - You are about to drop the column `expiryDate` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `isDeclined` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `isOrganizationWide` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `requestBody` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `requestSubject` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `sendInOrder` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `sendMail` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `sentToOthers` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `signatureType` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `signedUrl` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `timeToCompleteDays` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `signatureType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tourStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `DocumentAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OpenSignPlaceholder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OpenSignSignature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OpenSignSigner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DocumentAssignment" DROP CONSTRAINT "DocumentAssignment_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentAssignment" DROP CONSTRAINT "DocumentAssignment_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentMessage" DROP CONSTRAINT "DocumentMessage_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentMessage" DROP CONSTRAINT "DocumentMessage_recipientDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentMessage" DROP CONSTRAINT "DocumentMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "OpenSignPlaceholder" DROP CONSTRAINT "OpenSignPlaceholder_documentId_fkey";

-- DropForeignKey
ALTER TABLE "OpenSignPlaceholder" DROP CONSTRAINT "OpenSignPlaceholder_signerId_fkey";

-- DropForeignKey
ALTER TABLE "OpenSignSignature" DROP CONSTRAINT "OpenSignSignature_documentId_fkey";

-- DropForeignKey
ALTER TABLE "OpenSignSignature" DROP CONSTRAINT "OpenSignSignature_signerId_fkey";

-- DropForeignKey
ALTER TABLE "OpenSignSigner" DROP CONSTRAINT "OpenSignSigner_documentId_fkey";

-- DropForeignKey
ALTER TABLE "OpenSignSigner" DROP CONSTRAINT "OpenSignSigner_userId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "expiryDate",
DROP COLUMN "isCompleted",
DROP COLUMN "isDeclined",
DROP COLUMN "isOrganizationWide",
DROP COLUMN "note",
DROP COLUMN "requestBody",
DROP COLUMN "requestSubject",
DROP COLUMN "sendInOrder",
DROP COLUMN "sendMail",
DROP COLUMN "sentToOthers",
DROP COLUMN "signatureType",
DROP COLUMN "signedUrl",
DROP COLUMN "timeToCompleteDays";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "company",
DROP COLUMN "phone",
DROP COLUMN "signatureType",
DROP COLUMN "tourStatus",
ADD COLUMN     "mobileNo" TEXT;

-- DropTable
DROP TABLE "DocumentAssignment";

-- DropTable
DROP TABLE "DocumentMessage";

-- DropTable
DROP TABLE "OpenSignPlaceholder";

-- DropTable
DROP TABLE "OpenSignSignature";

-- DropTable
DROP TABLE "OpenSignSigner";

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "secondName" TEXT,
    "thirdName" TEXT,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'Male',
    "dob" TIMESTAMP(3),
    "citizenship" TEXT NOT NULL,
    "nationalityId" TEXT NOT NULL,
    "noriqama" TEXT NOT NULL,
    "mrn" TEXT,
    "employeeNo" TEXT,
    "unitId" TEXT,
    "rankId" TEXT,
    "jobTitleId" TEXT,
    "sponsorId" TEXT,
    "pictureLink" TEXT,
    "cardExpiryAt" TIMESTAMP(3) NOT NULL,
    "lastRenewalAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nationality" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT NOT NULL,

    CONSTRAINT "Nationality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rank" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT NOT NULL,

    CONSTRAINT "Rank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobTitle" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT NOT NULL,

    CONSTRAINT "JobTitle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_nationalityId_fkey" FOREIGN KEY ("nationalityId") REFERENCES "Nationality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_jobTitleId_fkey" FOREIGN KEY ("jobTitleId") REFERENCES "JobTitle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
