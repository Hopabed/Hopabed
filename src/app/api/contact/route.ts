import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, subject, message, phone } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: { message: "Name is required." } },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim() || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { success: false, error: { message: "A valid email address is required." } },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { success: false, error: { message: "Subject is required." } },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: { message: "Message description is required." } },
        { status: 400 }
      );
    }

    console.log("[Contact API] Received enquiry submission:", {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      phone: phone ? String(phone).trim() : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your request has been submitted successfully.",
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: { message: errorMsg } },
      { status: 500 }
    );
  }
}
