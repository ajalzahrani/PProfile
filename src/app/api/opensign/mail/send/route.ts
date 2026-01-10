import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email";

interface EmailRequest {
  // OpenSign format fields
  recipient: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyto?: string;
  extUserId?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
    contentType?: string;
  }>;
}

export async function POST(req: Request) {
  try {
    const body: EmailRequest = await req.json();

    // Validate required fields
    if (!body.recipient || !body.subject || !body.html) {
      return NextResponse.json(
        { error: "Missing required fields: recipient, subject, html" },
        { status: 400 }
      );
    }

    // Convert base64 attachments to Buffer if present
    const processedAttachments = body.attachments?.map((attachment) => ({
      filename: attachment.filename,
      content: Buffer.from(attachment.content, "base64"),
      contentType: attachment.contentType,
    }));

    // Send email using the email service
    const result = await emailService.sendEmail({
      to: body.recipient,
      subject: body.subject,
      html: body.html,
      text: body.text,
      from: body.from,
      replyTo: body.replyto,
      attachments: processedAttachments,
    });

    if (result.success) {
      return NextResponse.json({
        status: "success",
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error:
          "Internal server error: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
