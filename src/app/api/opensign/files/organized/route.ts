// src/app/api/opensign/files/organized/route.ts
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const {
      documentId,
      filename,
      base64,
      fileType = "versions",
    } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // base64 may include data URL header – strip if necessary
    const payload = (
      base64.includes(",") ? base64.split(",")[1] : base64
    ).trim();
    const buffer = Buffer.from(payload, "base64");

    // Organized file structure: /uploads/{documentId}/{fileType}/{filename}
    const documentDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      documentId
    );
    const fileTypeDir = path.join(documentDir, fileType);

    // Create directory if it doesn't exist
    await mkdir(fileTypeDir, { recursive: true });

    // Add timestamp to filename to avoid collisions
    const timestamp = Date.now();
    const finalFilename = `${fileType}_${timestamp}_${filename}`;
    const filePath = path.join(fileTypeDir, finalFilename);

    // Write the file
    await writeFile(filePath, buffer);

    // Return the relative path
    const relativePath = `/uploads/${documentId}/${fileType}/${finalFilename}`;

    return NextResponse.json({ url: relativePath });
  } catch (error) {
    console.error("Error saving organized file:", error);
    return NextResponse.json(
      {
        error:
          "Failed to save file: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
