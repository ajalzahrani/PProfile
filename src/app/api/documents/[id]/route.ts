import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { documentSchema } from "@/actions/documents.validation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" });
    }

    const body = await req.json();
    const { id: documentId } = await params;

    // Validate the input
    const validation = documentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid fields",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      title,
      description,
      categoryId,
      departmentIds,
      isArchived,
      expirationDate,
    } = validation.data;

    // Check if document exists
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 },
      );
    }

    // Update the document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        title,
        description,
        isArchived,
        departments: false
          ? { set: [] }
          : { set: departmentIds.map((id) => ({ id })) },
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
    });

    // Update the current version's expiration date if provided
    if (expirationDate) {
      await prisma.documentVersion.updateMany({
        where: { documentId },
        data: { expirationDate: new Date(expirationDate) },
      });
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument,
    });
  } catch (error: any) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
