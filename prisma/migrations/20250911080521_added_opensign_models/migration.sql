-- CreateTable
CREATE TABLE "public"."OpenSignSigner" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "blockColor" TEXT,
    "signerObjId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenSignSigner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OpenSignPlaceholder" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "signerId" TEXT,
    "pageNumber" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "xPosition" DOUBLE PRECISION NOT NULL,
    "yPosition" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "options" JSONB,
    "isMobile" BOOLEAN DEFAULT false,
    "scale" DOUBLE PRECISION,
    "zIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenSignPlaceholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OpenSignSignature" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "signerId" TEXT NOT NULL,
    "widgetKey" TEXT NOT NULL,
    "signUrl" TEXT,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpenSignSignature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpenSignSigner_signerObjId_key" ON "public"."OpenSignSigner"("signerObjId");

-- CreateIndex
CREATE INDEX "OpenSignPlaceholder_documentId_pageNumber_idx" ON "public"."OpenSignPlaceholder"("documentId", "pageNumber");

-- CreateIndex
CREATE UNIQUE INDEX "OpenSignPlaceholder_documentId_key_key" ON "public"."OpenSignPlaceholder"("documentId", "key");

-- CreateIndex
CREATE INDEX "OpenSignSignature_documentId_widgetKey_idx" ON "public"."OpenSignSignature"("documentId", "widgetKey");

-- AddForeignKey
ALTER TABLE "public"."OpenSignSigner" ADD CONSTRAINT "OpenSignSigner_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OpenSignSigner" ADD CONSTRAINT "OpenSignSigner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OpenSignPlaceholder" ADD CONSTRAINT "OpenSignPlaceholder_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OpenSignPlaceholder" ADD CONSTRAINT "OpenSignPlaceholder_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "public"."OpenSignSigner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OpenSignSignature" ADD CONSTRAINT "OpenSignSignature_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OpenSignSignature" ADD CONSTRAINT "OpenSignSignature_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "public"."OpenSignSigner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
