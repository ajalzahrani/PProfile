import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import {
  generateDocumentVersionTx,
  saveOrganizedFile,
} from "@/actions/documents";
import { FileType } from "@/actions/documents.validation";

// Helper function to get or create "SIGNED" status
async function getSignedStatusId(): Promise<string> {
  let status = await prisma.documentStatus.findUnique({
    where: { name: "SIGNED" },
  });

  if (!status) {
    status = await prisma.documentStatus.create({
      data: {
        name: "SIGNED",
        description: "Document has been signed by all required signers",
        variant: "success",
      },
    });
  }

  return status.id;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pdfFile, docId, userId, isCustomCompletionMail, signature } = body;

    console.log("PDF Sign API called with:", {
      docId,
      userId,
      isCustomCompletionMail,
    });

    // Validate required parameters
    if (!pdfFile || !docId || !userId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required parameters: pdfFile, docId, or userId",
        },
        { status: 400 }
      );
    }

    // For now, we'll create a simple implementation that marks the document as signed
    // and returns the signed PDF URL. In a full implementation, you would:
    // 1. Process the PDF with signatures
    // 2. Generate a digitally signed PDF
    // 3. Store the signed PDF
    // 4. Update document status
    // 5. Send completion emails if needed

    try {
      // First, get the document with all signers to check completion status
      const document = await prisma.document.findUnique({
        where: { id: docId },
        include: {
          openSignSigners: true,
          currentVersion: true,
          status: true,
        },
      });

      if (!document) {
        return NextResponse.json(
          { status: "error", message: "Document not found" },
          { status: 404 }
        );
      }

      // Find the current signer - userId is actually signerObjectId from frontend
      const currentSigner = document.openSignSigners.find(
        (signer) =>
          signer.id === userId ||
          signer.signerObjId === userId ||
          signer.userId === userId
      );

      if (!currentSigner) {
        console.error("Signer not found:", {
          userId,
          availableSigners: document.openSignSigners.map((s) => ({
            id: s.id,
            signerObjId: s.signerObjId,
            userId: s.userId,
            email: s.email,
          })),
        });
        return NextResponse.json(
          { status: "error", message: "Signer not found for this document" },
          { status: 403 }
        );
      }

      // Check if this signer has already signed
      const existingSignature = await prisma.auditLog.findFirst({
        where: {
          documentId: docId,
          action: "SIGN_DOCUMENT",
          details: {
            contains: `"signerId":"${currentSigner.id}"`,
          },
        },
      });

      if (existingSignature) {
        return NextResponse.json(
          {
            status: "error",
            message: "This signer has already signed the document",
          },
          { status: 400 }
        );
      }

      // Create audit trail entry for this signer
      await prisma.auditLog.create({
        data: {
          userId: userId,
          action: "SIGN_DOCUMENT",
          documentId: docId,
          details: JSON.stringify({
            activity: "Signed",
            signerId: currentSigner.id,
            signerEmail: currentSigner.email,
            signature: signature ? "provided" : "not_provided",
            isCustomCompletionMail,
          }),
        },
      });

      // Check if all signers have signed by getting unique signer entries from audit log
      const signatureEntries = await prisma.auditLog.findMany({
        where: {
          documentId: docId,
          action: "SIGN_DOCUMENT",
          details: {
            contains: "Signed",
          },
        },
      });

      // Parse the details to get unique signer IDs who have signed
      const signedSignerIds = new Set<string>();
      signatureEntries.forEach((entry) => {
        try {
          if (entry.details) {
            const details = JSON.parse(entry.details);
            if (details.signerId) {
              signedSignerIds.add(details.signerId);
            }
          }
        } catch (e) {
          console.warn("Could not parse audit log details:", entry.details);
        }
      });

      // Determine if document should be marked as completed
      const totalSigners = document.openSignSigners.length;
      const signedCount = signedSignerIds.size;
      const allSignersSigned = signedCount >= totalSigners;

      // Handle signing order if sendInOrder is enabled
      let shouldComplete = allSignersSigned;

      if (document.sendInOrder && !allSignersSigned) {
        // Check if this signer is next in the signing order
        const currentSignerOrder = currentSigner.order;
        const hasSignersBeforeCurrentOrder = document.openSignSigners.some(
          (signer) =>
            signer.order < currentSignerOrder && !signedSignerIds.has(signer.id)
        );

        if (hasSignersBeforeCurrentOrder) {
          return NextResponse.json(
            {
              status: "error",
              message:
                "Please wait for signers with earlier order to sign first",
            },
            { status: 400 }
          );
        }
      }

      // If all signers have signed, persist the final PDF under organized structure
      let finalSignedUrl: string | undefined;
      if (shouldComplete && pdfFile) {
        try {
          // Determine payload type and get a Buffer
          let buffer: Buffer | undefined;
          // If pdfFile is base64 (with or without data URI)
          const isDataUri =
            typeof pdfFile === "string" && pdfFile.includes(",");
          const isLikelyBase64 =
            typeof pdfFile === "string" &&
            !pdfFile.startsWith("http") &&
            !pdfFile.startsWith("/");
          if (isDataUri) {
            const payload = (pdfFile as string).split(",")[1].trim();
            buffer = Buffer.from(payload, "base64");
          } else if (isLikelyBase64) {
            buffer = Buffer.from(pdfFile as string, "base64");
          } else if (typeof pdfFile === "string") {
            // Treat as URL - fetch and convert to buffer
            const resp = await fetch(pdfFile);
            const arrBuf = await resp.arrayBuffer();
            buffer = Buffer.from(arrBuf);
          }

          if (buffer) {
            // // Derive a suitable base name from current version, fallback to default
            // const currentVersion = await prisma.documentVersion.findFirst({
            //   where: { documentId: docId },
            //   orderBy: { versionNumber: "desc" },
            // });
            // const baseName = (() => {
            //   const p = currentVersion?.filePath || "";
            //   const justName = p
            //     ? p.split("/").pop() || "document.pdf"
            //     : "document.pdf";
            //   return justName.replace(/^v\d+_\d+_/, "");
            // })();
            // // Save using organized file helper under /final with standardized naming
            // const { relativePath, error } = await saveOrganizedFile(
            //   docId,
            //   baseName,
            //   buffer,
            //   FileType.FINAL
            // );
            // if (!error && relativePath) {
            //   finalSignedUrl = relativePath;
            // }
            const hash = crypto
              .createHash("sha256")
              .update(buffer)
              .digest("hex");

            const result = await generateDocumentVersionTx(
              document.id,
              "signed.pdf", // fileName
              buffer,
              hash,
              userId, // uploaderId
              "", // changeNote
              null, // expirationDate
              "SIGNED"
            );
            if (result.success && result.version) {
              finalSignedUrl = result.version.filePath;
            } else {
              console.error(
                "Failed to generate document signedversion:",
                result.error
              );
            }
          }
        } catch (saveErr) {
          console.error("Failed to persist final signed PDF:", saveErr);
        }
      }

      // Update document status and optionally set the persisted final URL
      const updatedDocument = await prisma.document.update({
        where: { id: docId },
        data: {
          isCompleted: shouldComplete,
          signedUrl: shouldComplete && finalSignedUrl ? finalSignedUrl : null,
          ...(shouldComplete && {
            statusId: await getSignedStatusId(),
          }),
        },
        include: {
          currentVersion: true,
          openSignSigners: true,
        },
      });

      // Return success response with completion info
      return NextResponse.json({
        status: "success",
        data: updatedDocument.signedUrl,
        message: shouldComplete
          ? "Document completed - all signers have signed"
          : "Document signed successfully - waiting for other signers",
        isCompleted: shouldComplete,
        signedCount,
        totalSigners: document.openSignSigners.length,
      });
    } catch (dbError) {
      console.error("Database error in PDF signing:", dbError);
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to update document status",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in PDF signing API:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
