-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('HOSPITAL_WIDE', 'DEPARTMENTAL');

-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "type" "public"."DocumentType" NOT NULL DEFAULT 'HOSPITAL_WIDE';

-- CreateTable
CREATE TABLE "public"."_DocumentDepartments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentDepartments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DocumentDepartments_B_index" ON "public"."_DocumentDepartments"("B");

-- AddForeignKey
ALTER TABLE "public"."_DocumentDepartments" ADD CONSTRAINT "_DocumentDepartments_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DocumentDepartments" ADD CONSTRAINT "_DocumentDepartments_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
