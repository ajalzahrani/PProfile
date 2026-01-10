-- DropForeignKey
ALTER TABLE "DocumentVersion" DROP CONSTRAINT "DocumentVersion_statusId_fkey";

-- AlterTable
ALTER TABLE "DocumentVersion" ALTER COLUMN "statusId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "DocumentStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
