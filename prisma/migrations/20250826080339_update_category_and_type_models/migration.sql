/*
  Warnings:

  - You are about to drop the column `type` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `typeId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_categoryId_fkey";

-- AlterTable
ALTER TABLE "public"."Document" DROP COLUMN "type",
ADD COLUMN     "typeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Category";

-- DropEnum
DROP TYPE "public"."DocumentType";

-- CreateTable
CREATE TABLE "public"."DocumentCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DocumentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentCategory_name_key" ON "public"."DocumentCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_name_key" ON "public"."DocumentType"("name");

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."DocumentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentCategory" ADD CONSTRAINT "DocumentCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."DocumentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
