// src/app/api/opensign/documents/[id]/placeholders/route.ts (GET, PUT)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ph = await prisma.openSignPlaceholder.findMany({
    where: { documentId: id },
    orderBy: [{ pageNumber: "asc" }],
  });
  return NextResponse.json(ph);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { placeholders } = await req.json();
  // Upsert strategy; adjust to your schema
  await prisma.$transaction([
    prisma.openSignPlaceholder.deleteMany({ where: { documentId: id } }),
    prisma.openSignPlaceholder.createMany({
      data: placeholders.map((p: any) => ({ ...p, documentId: id })),
    }),
  ]);
  return NextResponse.json({ ok: true });
}
