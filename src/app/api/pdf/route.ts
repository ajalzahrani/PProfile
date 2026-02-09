// API route to serve PDF files with proper headers
// This ensures PDFs are accessible even in standalone mode
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { getStorageFilePath, validateStoragePath } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 },
      );
    }

    // Security: Only allow paths starting with /uploads/
    if (!filePath.startsWith("/uploads/")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 403 });
    }

    // Get the absolute path from storage (supports external storage)
    const absolutePath = getStorageFilePath(filePath);

    // Security: Validate that the path is within the storage directory
    if (!validateStoragePath(absolutePath)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 403 });
    }

    // Check if file exists
    if (!existsSync(absolutePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(absolutePath);

    // Return with proper headers
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(fileBuffer);
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*", // Allow CORS
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Disposition": `inline; filename="${path.basename(
          absolutePath,
        )}"`,
      },
    });
  } catch (error) {
    console.error("Error serving PDF file:", error);
    return NextResponse.json(
      {
        error: "Failed to serve PDF file",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
