// src/app/api/opensign/users/me/route.ts
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
// import { auth } from "@/lib/auth"; // if you have auth
// import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  return NextResponse.json({
    objectId: session.user.id, // replace with user.id
    TourStatus: [{ placeholder: false }], // replace with user.tourStatus - this enables the tour
  });
}
