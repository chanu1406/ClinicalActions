import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, email, summary } = await request.json();

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // In production, this would integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`[Mock Email] Sending aftercare summary to: ${email}`);
    console.log(`[Mock Email] Summary length: ${summary.length} characters`);

    return NextResponse.json({
      success: true,
      message: `After-care summary sent to ${email}`,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send aftercare email" },
      { status: 500 }
    );
  }
}
