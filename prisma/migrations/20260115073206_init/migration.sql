/*
  Warnings:

  - A unique constraint covering the columns `[nameEn]` on the table `JobTitle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nameEn]` on the table `Nationality` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Person` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nameEn` on table `JobTitle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dob` on table `Person` required. This step will fail if there are existing NULL values in that column.
  - Made the column `jobTitleId` on table `Person` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_jobTitleId_fkey";

-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_nationalityId_fkey";

-- AlterTable
ALTER TABLE "JobTitle" ALTER COLUMN "nameEn" SET NOT NULL,
ALTER COLUMN "nameAr" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Person" ALTER COLUMN "dob" SET NOT NULL,
ALTER COLUMN "citizenship" DROP NOT NULL,
ALTER COLUMN "nationalityId" DROP NOT NULL,
ALTER COLUMN "noriqama" DROP NOT NULL,
ALTER COLUMN "jobTitleId" SET NOT NULL,
ALTER COLUMN "cardExpiryAt" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "JobTitle_nameEn_key" ON "JobTitle"("nameEn");

-- CreateIndex
CREATE UNIQUE INDEX "Nationality_nameEn_key" ON "Nationality"("nameEn");

-- CreateIndex
CREATE UNIQUE INDEX "Person_userId_key" ON "Person"("userId");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_nationalityId_fkey" FOREIGN KEY ("nationalityId") REFERENCES "Nationality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_jobTitleId_fkey" FOREIGN KEY ("jobTitleId") REFERENCES "JobTitle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
