import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { search } = await req.json();

    // Search users by name or email
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search || "", mode: "insensitive" } },
          { email: { contains: search || "", mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
      },
      take: 20, // Increased limit for better selection
    });

    // Transform to OpenSign format
    const result = users.map((user) => ({
      objectId: user.id,
      Name: user.name,
      Email: user.email,
      Phone: user.phone || "",
      Company: user.company || "",
      className: "contracts_Contactbook",
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching signers:", error);
    return NextResponse.json([], { status: 500 });
  }
}
