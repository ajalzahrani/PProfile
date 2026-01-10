import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
PUT endpoint:
Handles tour status updates from frontend
Currently commented out but ready for implementation
Accepts TourStatus array for tracking user tutorial progress

GET endpoint (added):
Fetches user details in OpenSign format
Returns user data as array (OpenSign expectation)

 */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        currentVersion: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
            signatureType: true,
          },
        },
        openSignSigners: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                company: true,
              },
            },
          },
        },
        openSignPlaceholders: {
          orderBy: [{ pageNumber: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Transform signers to OpenSign format
    const signers = document.openSignSigners.map((signer) => ({
      objectId: signer.signerObjId || signer.id,
      Name: signer.name || signer.user?.name,
      Email: signer.email,
      Phone: signer.phone || signer.user?.phone,
      Company: signer.user?.company,
      className: signer.className || "contracts_Contactbook",
      Role: signer.role,
      Id: signer.id,
      blockColor: signer.blockColor,
    }));

    // Group placeholders by signer and transform to OpenSign format
    const placeholdersBySignerId: { [key: string]: any[] } = {};

    document.openSignPlaceholders.forEach((placeholder) => {
      const signerId = placeholder.signerId || "prefill";
      if (!placeholdersBySignerId[signerId]) {
        placeholdersBySignerId[signerId] = [];
      }

      // Group by page number
      let pageGroup = placeholdersBySignerId[signerId].find(
        (p) => p.pageNumber === placeholder.pageNumber
      );
      if (!pageGroup) {
        pageGroup = { pageNumber: placeholder.pageNumber, pos: [] };
        placeholdersBySignerId[signerId].push(pageGroup);
      }

      pageGroup.pos.push({
        key: placeholder.key,
        xPosition: placeholder.xPosition,
        yPosition: placeholder.yPosition,
        Width: placeholder.width,
        Height: placeholder.height,
        type: placeholder.type,
        scale: placeholder.scale,
        zIndex: placeholder.zIndex,
        isStamp: placeholder.isStamp,
        isMobile: placeholder.isMobile,
        options: placeholder.options || {},
      });
    });

    // Transform placeholders to OpenSign format
    const placeholders = Object.entries(placeholdersBySignerId).map(
      ([signerId, pageGroups]) => {
        const signer = document.openSignSigners.find((s) => s.id === signerId);
        return {
          Id: signerId,
          Role:
            signer?.role ||
            (signerId === "prefill" ? "prefill" : `Signer ${signerId}`),
          blockColor: signer?.blockColor || "#23b3e8",
          signerPtr: signer
            ? {
                __type: "Pointer",
                className: signer.className || "contracts_Contactbook",
                objectId: signer.signerObjId || signer.id,
              }
            : {},
          signerObjId: signer?.signerObjId || signer?.id,
          placeHolder: pageGroups,
        };
      }
    );

    // Response in OpenSign format
    const response = {
      objectId: document.id,
      Name: document.title,
      URL: document.currentVersion?.filePath,
      SignedUrl: document.signedUrl,
      IsCompleted: document.isCompleted,
      IsDeclined: document.isDeclined,
      ExpiryDate: {
        iso:
          document.expiryDate?.toISOString() ||
          new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      SendinOrder: document.sendInOrder,
      SentToOthers: document.sentToOthers,
      SendMail: document.sendMail,
      TimeToCompleteDays: document.timeToCompleteDays || 15,
      SignatureType: document.signatureType ||
        document.creator.signatureType || [
          { name: "draw", enabled: true },
          { name: "type", enabled: true },
          { name: "upload", enabled: true },
        ],
      ExtUserPtr: {
        objectId: document.creator.id,
        Email: document.creator.email,
        Name: document.creator.name,
        Company: document.creator.company,
        Phone: document.creator.phone,
        SignatureType: document.creator.signatureType,
      },
      Signers: signers,
      Placeholders: placeholders,
      RequestBody: document.requestBody,
      RequestSubject: document.requestSubject,
      Note: document.note,
    };

    return NextResponse.json([response]); // OpenSign expects an array
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Update document fields
    const updateData: any = {};

    if (body.Name) updateData.title = body.Name;
    if (body.SignedUrl) updateData.signedUrl = body.SignedUrl;
    if (typeof body.SentToOthers === "boolean")
      updateData.sentToOthers = body.SentToOthers;
    if (typeof body.SendMail === "boolean") updateData.sendMail = body.SendMail;
    if (body.ExpiryDate) {
      updateData.expiryDate =
        typeof body.ExpiryDate === "string"
          ? new Date(body.ExpiryDate)
          : new Date(body.ExpiryDate.iso || body.ExpiryDate);
    }
    if (body.RequestBody) updateData.requestBody = body.RequestBody;
    if (body.RequestSubject) updateData.requestSubject = body.RequestSubject;
    if (body.SignatureType) updateData.signatureType = body.SignatureType;
    if (typeof body.IsCompleted === "boolean")
      updateData.isCompleted = body.IsCompleted;
    if (typeof body.IsDeclined === "boolean")
      updateData.isDeclined = body.IsDeclined;

    // Update document
    if (Object.keys(updateData).length > 0) {
      await prisma.document.update({
        where: { id },
        data: updateData,
      });
    }

    // Handle Signers update
    if (body.Signers && Array.isArray(body.Signers)) {
      // Delete existing signers
      await prisma.openSignSigner.deleteMany({
        where: { documentId: id },
      });

      // Create new signers
      for (const signer of body.Signers) {
        await prisma.openSignSigner.create({
          data: {
            documentId: id,
            userId: signer.objectId, // Assuming objectId maps to userId
            email: signer.Email || "",
            name: signer.Name,
            phone: signer.Phone,
            role: signer.Role || "signer",
            order: signer.order || 1,
            blockColor: signer.blockColor,
            signerObjId: signer.objectId,
            className: signer.className || "contracts_Contactbook",
          },
        });
      }
    }

    // Handle Placeholders update
    if (body.Placeholders && Array.isArray(body.Placeholders)) {
      // Delete existing placeholders
      await prisma.openSignPlaceholder.deleteMany({
        where: { documentId: id },
      });

      // Create new placeholders
      for (const placeholder of body.Placeholders) {
        const signer = await prisma.openSignSigner.findFirst({
          where: {
            documentId: id,
            OR: [
              { id: String(placeholder.Id) },
              { signerObjId: placeholder.signerObjId },
            ],
          },
        });

        if (placeholder.placeHolder && Array.isArray(placeholder.placeHolder)) {
          for (const pageGroup of placeholder.placeHolder) {
            if (pageGroup.pos && Array.isArray(pageGroup.pos)) {
              for (const pos of pageGroup.pos) {
                await prisma.openSignPlaceholder.create({
                  data: {
                    documentId: id,
                    signerId: signer?.id,
                    signerObjId: placeholder.signerObjId,
                    role: placeholder.Role,
                    blockColor: placeholder.blockColor,
                    pageNumber: pageGroup.pageNumber,
                    key: String(pos.key),
                    type: pos.type,
                    xPosition: pos.xPosition,
                    yPosition: pos.yPosition,
                    width: pos.Width,
                    height: pos.Height,
                    scale: pos.scale,
                    zIndex: pos.zIndex,
                    isStamp: pos.isStamp,
                    isMobile: pos.isMobile,
                    options: pos.options || {},
                  },
                });
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
