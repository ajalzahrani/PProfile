// src/app/api/opensign/files/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { filename, base64 } = await req.json();
  // base64 may include data URL header – strip if necessary
  const payload = (base64.includes(",") ? base64.split(",")[1] : base64).trim();
  const buffer = Buffer.from(payload, "base64");

  // TODO: store buffer somewhere (disk, S3, GCS, etc.). Example local public/ path:
  const fs = await import("fs/promises");
  const path = await import("path");
  const rel = `uploads/${Date.now()}_${filename}`;
  const abs = path.join(process.cwd(), "public", rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, buffer);

  return NextResponse.json({ url: `/${rel}` });
}
