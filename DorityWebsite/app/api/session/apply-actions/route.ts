import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, actions } = await request.json();

    // Simulate EMR write delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mark all actions as successfully applied
    const appliedActions = actions.map((action: any) => ({
      ...action,
      status: "approved",
      appliedAt: new Date().toISOString(),
      appliedToEMR: true,
    }));

    return NextResponse.json({
      success: true,
      appliedActions,
      message: `Successfully applied ${appliedActions.length} action(s) to Medplum EMR`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to apply actions to EMR" },
      { status: 500 }
    );
  }
}
