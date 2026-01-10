/*
  Warnings:

  - Added the required column `statusId` to the `DocumentVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentVersion" ADD COLUMN     "statusId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "DocumentStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
