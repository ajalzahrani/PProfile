/*
  Warnings:

  - You are about to drop the column `typeId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the `DocumentType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_typeId_fkey";

-- AlterTable
ALTER TABLE "public"."Document" DROP COLUMN "typeId";

-- DropTable
DROP TABLE "public"."DocumentType";
