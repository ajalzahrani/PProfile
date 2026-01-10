import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("API: Looking for document with ID:", id);

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
        departments: true,
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
          orderBy: { order: "asc" },
        },
        openSignPlaceholders: {
          orderBy: [{ pageNumber: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!document) {
      console.log("API: Document not found for ID:", id);
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    console.log("API: Document found:", document.id);

    // Transform signers to OpenSign format - ADD DEFAULT SIGNER IF NONE EXIST
    let signers: any[] = [];
    if (document.openSignSigners.length > 0) {
      signers = document.openSignSigners.map((signer) => ({
        objectId: signer.signerObjId || signer.id,
        Name: signer.name || signer.user?.name || "",
        Email: signer.email,
        Phone: signer.phone || signer.user?.phone || "",
        Company: signer.user?.company || "",
        className: signer.className || "contracts_Contactbook",
        Role: signer.role,
        Id: signer.id,
        blockColor: signer.blockColor || "#23b3e8",
      }));
    }
    // else {
    //   // CREATE A DEFAULT SIGNER WHEN NONE EXIST
    //   const defaultSignerId = "default-signer-" + Date.now();
    //   signers = [
    //     {
    //       objectId: defaultSignerId,
    //       Name: "Default Signer",
    //       Email: "signer@example.com",
    //       Phone: "",
    //       Company: "",
    //       className: "contracts_Contactbook",
    //       Role: "Signer 1",
    //       Id: defaultSignerId,
    //       blockColor: "#23b3e8",
    //     },
    //   ];
    // }
    else {
      // Find all users attached document departments
      const users = await prisma.user.findMany({
        // get all users attached to any of the document departments
        where: {
          departmentId: {
            in: document.departments.map((d) => d.id),
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
        },
      });
      if (users.length > 0) {
        signers = users.map((user) => ({
          objectId: user.id,
          Name: user.name,
          Email: user.email,
          Phone: user.phone || "",
          Company: user.company || "",
          className: "contracts_Contactbook",
          Role: "Signer " + (signers.length + 1),
          Id: user.id,
          blockColor: "#23b3e8",
        }));
      }
    }

    // Group placeholders by signer and transform to OpenSign format
    const placeholdersBySignerId: { [key: string]: any[] } = {};

    document.openSignPlaceholders.forEach((placeholder) => {
      const signerId =
        placeholder.signerId || placeholder.signerObjId || "prefill";
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
        scale: placeholder.scale || 1,
        zIndex: placeholder.zIndex || 1,
        isStamp: placeholder.isStamp || false,
        isMobile: placeholder.isMobile || false,
        options: placeholder.options || {},
      });
    });

    // Transform placeholders to OpenSign format - CREATE DEFAULT PLACEHOLDER STRUCTURE
    let placeholders = [];
    if (Object.keys(placeholdersBySignerId).length > 0) {
      placeholders = Object.entries(placeholdersBySignerId).map(
        ([signerId, pageGroups]) => {
          const signer = signers.find(
            (s) => s.Id === signerId || s.objectId === signerId
          );
          return {
            Id: signerId,
            Role:
              signer?.Role ||
              (signerId === "prefill" ? "prefill" : `Signer ${signerId}`),
            blockColor: signer?.blockColor || "#23b3e8",
            signerPtr: signer
              ? {
                  __type: "Pointer",
                  className: signer.className || "contracts_Contactbook",
                  objectId: signer.objectId || signer.Id,
                }
              : {},
            signerObjId: signer?.objectId || signer?.Id || signerId,
            placeHolder: pageGroups,
          };
        }
      );
    } else {
      // CREATE DEFAULT PLACEHOLDER STRUCTURE FOR EACH SIGNER
      placeholders = signers.map((signer) => ({
        Id: signer.Id,
        Role: signer.Role,
        blockColor: signer.blockColor,
        signerPtr: {
          __type: "Pointer",
          className: signer.className,
          objectId: signer.objectId,
        },
        signerObjId: signer.objectId,
        placeHolder: [], // Empty array means no widgets placed yet
      }));
    }

    // Response in OpenSign format (wrapped in array as expected)
    const response = [
      {
        objectId: document.id,
        Name: document.title,
        URL: document.currentVersion?.filePath || "",
        SignedUrl: document.signedUrl,
        IsCompleted: document.isCompleted || false,
        IsDeclined: document.isDeclined || false,
        ExpiryDate: {
          iso:
            document.expiryDate?.toISOString() ||
            new Date(
              Date.now() +
                (document.timeToCompleteDays || 15) * 24 * 60 * 60 * 1000
            ).toISOString(),
        },
        SendinOrder: document.sendInOrder || false,
        SentToOthers: document.sentToOthers || false,
        SendMail: document.sendMail || false,
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
          Company: document.creator.company || "",
          Phone: document.creator.phone || "",
          SignatureType: document.creator.signatureType,
        },
        // Ensure Signers is always an array with at least one signer
        Signers: signers,
        // Ensure Placeholders is always an array with placeholder structure for each signer
        Placeholders: placeholders,
        RequestBody: document.requestBody,
        RequestSubject: document.requestSubject,
        Note: document.note,
      },
    ];

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error },
      { status: 500 }
    );
  }
}

/**
 * PUT endpoint:
 * Handles document updates from frontend
 * Currently commented out but ready for implementation
 * Accepts document fields for updates
 * Updates document fields in database
 */

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Start a transaction for all updates
    await prisma.$transaction(async (tx) => {
      // Update document fields
      const updateData: any = {};

      if (body.Name && typeof body.Name === "string") {
        updateData.title = body.Name;
      }
      if (body.SignedUrl) {
        updateData.signedUrl = body.SignedUrl;
      }
      if (typeof body.SentToOthers === "boolean") {
        updateData.sentToOthers = body.SentToOthers;
      }
      if (typeof body.SendMail === "boolean") {
        updateData.sendMail = body.SendMail;
      }
      if (typeof body.IsCompleted === "boolean") {
        updateData.isCompleted = body.IsCompleted;
      }
      if (typeof body.IsDeclined === "boolean") {
        updateData.isDeclined = body.IsDeclined;
      }
      if (typeof body.SendinOrder === "boolean") {
        updateData.sendInOrder = body.SendinOrder;
      }
      if (body.ExpiryDate) {
        updateData.expiryDate =
          typeof body.ExpiryDate === "string"
            ? new Date(body.ExpiryDate)
            : new Date(body.ExpiryDate.iso || body.ExpiryDate);
      }
      if (body.RequestBody) {
        updateData.requestBody = body.RequestBody;
      }
      if (body.RequestSubject) {
        updateData.requestSubject = body.RequestSubject;
      }
      if (body.SignatureType) {
        updateData.signatureType = body.SignatureType;
      }
      if (body.Note) {
        updateData.note = body.Note;
      }
      if (
        body.TimeToCompleteDays &&
        typeof body.TimeToCompleteDays === "number"
      ) {
        updateData.timeToCompleteDays = body.TimeToCompleteDays;
      }
      if (body.Status) {
        updateData.status = { connect: { name: body.Status } };
      }

      // Update document if there are changes
      if (Object.keys(updateData).length > 0) {
        await tx.document.update({
          where: { id },
          data: updateData,
        });
      }

      // Handle Signers update
      if (body.Signers && Array.isArray(body.Signers)) {
        // Delete existing signers
        await tx.openSignSigner.deleteMany({
          where: { documentId: id },
        });

        // Create new signers
        for (let i = 0; i < body.Signers.length; i++) {
          const signer = body.Signers[i];
          await tx.openSignSigner.create({
            data: {
              documentId: id,
              userId: signer.objectId, // Map to internal user if exists
              email: signer.Email || "",
              name: signer.Name || "",
              phone: signer.Phone || "",
              role: signer.Role || `Signer ${i + 1}`,
              order: i + 1,
              blockColor: signer.blockColor || getColorForIndex(i),
              signerObjId: signer.objectId || signer.Id,
              className: signer.className || "contracts_Contactbook",
            },
          });
        }
      }

      // Handle Placeholders update
      if (body.Placeholders && Array.isArray(body.Placeholders)) {
        // Delete existing placeholders
        await tx.openSignPlaceholder.deleteMany({
          where: { documentId: id },
        });

        // Create new placeholders
        for (const placeholder of body.Placeholders) {
          // Find the corresponding signer
          const signer = await tx.openSignSigner.findFirst({
            where: {
              documentId: id,
              OR: [
                { id: String(placeholder.Id) },
                { signerObjId: placeholder.signerObjId },
                { signerObjId: String(placeholder.Id) },
              ],
            },
          });

          if (
            placeholder.placeHolder &&
            Array.isArray(placeholder.placeHolder)
          ) {
            for (const pageGroup of placeholder.placeHolder) {
              if (pageGroup.pos && Array.isArray(pageGroup.pos)) {
                for (const pos of pageGroup.pos) {
                  await tx.openSignPlaceholder.create({
                    data: {
                      documentId: id,
                      signerId: signer?.id,
                      signerObjId: String(
                        placeholder.signerObjId || placeholder.Id
                      ),
                      role: placeholder.Role,
                      blockColor: placeholder.blockColor,
                      pageNumber: pageGroup.pageNumber,
                      key: String(pos.key),
                      type: pos.type,
                      xPosition: pos.xPosition,
                      yPosition: pos.yPosition,
                      width: pos.Width,
                      height: pos.Height,
                      scale: pos.scale || 1,
                      zIndex: pos.zIndex || 1,
                      isStamp: pos.isStamp || false,
                      isMobile: pos.isMobile || false,
                      options: pos.options || {},
                    },
                  });
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Internal server error " + error },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.name) updateData.title = body.name;
    if (body.title) updateData.title = body.title;

    await prisma.document.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get consistent colors for signers
function getColorForIndex(index: number): string {
  const colors = [
    "#23b3e8",
    "#f39c12",
    "#e74c3c",
    "#2ecc71",
    "#9b59b6",
    "#1abc9c",
    "#34495e",
    "#f1c40f",
    "#e67e22",
    "#95a5a6",
  ];
  return colors[index % colors.length];
}
