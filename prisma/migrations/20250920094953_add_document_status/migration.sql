/*
  Warnings:

  - Added the required column `statusId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "statusId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."DocumentStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "variant" TEXT,

    CONSTRAINT "DocumentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentStatus_name_key" ON "public"."DocumentStatus"("name");

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "public"."DocumentStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
