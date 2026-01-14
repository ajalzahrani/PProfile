import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import fs from "fs";
import { getCurrentUser } from "@/lib/auth";
import { documentSchema } from "@/actions/documents.validation";
import { createDocumentWithVersion } from "@/actions/documents";

export async function validateDocumentUpload(documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { status: true },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // Only allow uploads in these statuses
  const allowedStatuses = ["DRAFT", "UNDER_REVISION"];

  if (!allowedStatuses.includes(document.status.name)) {
    throw new Error(
      `Cannot upload new version. Document is in ${document.status.name} status.`
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" });
    }

    const formData = await req.formData();

    const parseDepartmentIds = (): string[] => {
      const direct = formData.get("departmentIds");
      if (direct && typeof direct === "string") {
        try {
          const parsed = JSON.parse(direct);
          if (Array.isArray(parsed)) return parsed.map(String);
        } catch {}
      }
      const arr = formData.getAll("departmentIds[]");
      return arr && arr.length > 0 ? arr.map(String) : [];
    };

    const isUpdate = !!(formData.get("id") || "");
    const categoryIdRaw = (formData.get("categoryId") as string) || "";
    const dto = {
      id: isUpdate ? (formData.get("id") as string) : undefined,
      title: formData.get("title") as string,
      categoryId: categoryIdRaw.trim() ? categoryIdRaw : undefined,
      description: (formData.get("description") as string) || undefined,
      departmentIds: parseDepartmentIds() || [],
      isArchived: JSON.parse((formData.get("isArchived") as string) ?? "false"),
      expirationDate: formData.get("expirationDate") as string,
      changeNote: (formData.get("changeNote") as string) || undefined,
    };

    const validation = documentSchema.safeParse(dto);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid fields: " + validation.error.message,
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;

    // For updates without new file, we need to handle this differently
    if (!file && isUpdate) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No file provided for update. Use PUT /api/documents/[id] for metadata-only updates.",
        },
        { status: 400 }
      );
    }

    if (!file || !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Invalid PDF file." },
        { status: 400 }
      );
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await createDocumentWithVersion({
      ...validation.data,
      isArchived: validation.data.isArchived || false,
      fileName: file.name,
      fileBuffer: buffer,
      documentStatus: validation.data.documentStatus || "DRAFT",
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json({ success: true, documentId: result.documentId });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
