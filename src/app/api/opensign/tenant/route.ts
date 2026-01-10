import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/*
Purpose: Provides tenant configuration for OpenSign


// Main functionality:
- GET endpoint for tenant settings
- Returns default signature types (draw, typed, upload, default)
- Provides email template defaults (RequestBody, RequestSubject)
- Accepts optional userId parameter for tenant-specific settings

*/
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updateData: any = {};

    if (body.TourStatus) {
      updateData.tourStatus = body.TourStatus;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: params.id },
        data: updateData,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" + error },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";

    // For now, return default tenant settings
    // You can expand this to fetch from a tenant configuration table
    const defaultTenantSettings = {
      RequestBody: `<p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}}&nbsp;has requested you to review and sign&nbsp;{{document_title}}.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p><a href='{{signing_url}}' rel='noopener noreferrer' target='_blank'>Sign here</a></p><br><br><p>If you have any questions or need further clarification regarding the document or the signing process,  please contact the sender.</p><br><p>Thanks</p><p> Team OpenSign™</p><br>`,
      RequestSubject: `{{sender_name}} has requested you to sign {{document_title}}`,
      SignatureType: [
        { name: "draw", enabled: true },
        { name: "type", enabled: true },
        { name: "upload", enabled: true },
      ],
    };

    return NextResponse.json(defaultTenantSettings);
  } catch (error) {
    console.error("Error fetching tenant details:", error);
    return NextResponse.json(
      { error: "Internal server error" + error },
      { status: 500 }
    );
  }
}
