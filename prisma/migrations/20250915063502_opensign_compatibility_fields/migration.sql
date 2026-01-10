-- DropIndex
DROP INDEX "public"."OpenSignSigner_signerObjId_key";

-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDeclined" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "requestBody" TEXT,
ADD COLUMN     "requestSubject" TEXT,
ADD COLUMN     "sendInOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sendMail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sentToOthers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "signatureType" JSONB,
ADD COLUMN     "signedUrl" TEXT,
ADD COLUMN     "timeToCompleteDays" INTEGER DEFAULT 15;

-- AlterTable
ALTER TABLE "public"."OpenSignPlaceholder" ADD COLUMN     "blockColor" TEXT,
ADD COLUMN     "isStamp" BOOLEAN DEFAULT false,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "signerObjId" TEXT;

-- AlterTable
ALTER TABLE "public"."OpenSignSigner" ADD COLUMN     "className" TEXT DEFAULT 'contracts_Contactbook',
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "company" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "signatureType" JSONB,
ADD COLUMN     "tourStatus" JSONB;

-- CreateIndex
CREATE INDEX "OpenSignSigner_documentId_idx" ON "public"."OpenSignSigner"("documentId");

-- CreateIndex
CREATE INDEX "OpenSignSigner_email_idx" ON "public"."OpenSignSigner"("email");
