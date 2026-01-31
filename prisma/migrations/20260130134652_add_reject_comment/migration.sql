-- AlterTable
ALTER TABLE "CertificateRequirement" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "rejectComment" TEXT;
