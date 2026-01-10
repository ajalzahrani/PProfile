-- DropForeignKey
ALTER TABLE "public"."DocumentAssignment" DROP CONSTRAINT "DocumentAssignment_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DocumentMessage" DROP CONSTRAINT "DocumentMessage_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DocumentVersion" DROP CONSTRAINT "DocumentVersion_documentId_fkey";

-- AddForeignKey
ALTER TABLE "public"."DocumentAssignment" ADD CONSTRAINT "DocumentAssignment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentMessage" ADD CONSTRAINT "DocumentMessage_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
