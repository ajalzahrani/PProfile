import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust if your prisma client path differs

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const tagsParam = searchParams.get("tags") || "";
  const tags = tagsParam
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  try {
    const documents = await prisma.document.findMany({
      where: {
        isArchived: false,
        title: {
          contains: q,
          mode: "insensitive",
        },
        ...(tags.length > 0 && {
          tags: {
            hasSome: tags,
          },
        }),
      },
      include: {
        versions: true,
        creator: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        currentVersion: true,
      },
      take: 20,
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching document:", error);
    return { success: false, error: "Error fetching document" };
  }
}
