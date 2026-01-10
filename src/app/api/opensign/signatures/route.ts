// src/app/api/opensign/signatures/route.ts (POST)
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json(); // { docId, widgetKey, signerId, signUrl }
  await db.signature.create({
    data: {
      documentId: body.docId,
      widgetKey: body.widgetKey,
      signerId: body.signerId,
      signUrl: body.signUrl,
    },
  });
  return NextResponse.json({ ok: true });
}
