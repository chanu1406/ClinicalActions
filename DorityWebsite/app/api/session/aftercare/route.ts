import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, approvedActions, historySummary } = await request.json();

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Generate summary based on approved actions
    const medications = approvedActions.filter((a: any) => a.type === "medication");
    const labs = approvedActions.filter((a: any) => a.type === "lab");
    const imaging = approvedActions.filter((a: any) => a.type === "imaging");
    const referrals = approvedActions.filter((a: any) => a.type === "referral");
    const followups = approvedActions.filter((a: any) => a.type === "followup");

    let summary = "Dear Patient,\n\n";
    summary += "Thank you for your visit today. Here's a summary of our consultation and the next steps for your care:\n\n";

    if (medications.length > 0) {
      summary += "MEDICATIONS:\n";
      medications.forEach((med: any) => {
        summary += `• ${med.title}\n`;
        summary += `  ${med.details}\n`;
        if (med.doseInfo) summary += `  Dosage: ${med.doseInfo}\n`;
        if (med.pharmacy) summary += `  Pharmacy: ${med.pharmacy}\n`;
        summary += "\n";
      });
    }

    if (labs.length > 0 || imaging.length > 0) {
      summary += "TESTS & PROCEDURES:\n";
      [...labs, ...imaging].forEach((test: any) => {
        summary += `• ${test.title}\n`;
        summary += `  ${test.details}\n\n`;
      });
    }

    if (referrals.length > 0) {
      summary += "REFERRALS:\n";
      referrals.forEach((ref: any) => {
        summary += `• ${ref.title}\n`;
        summary += `  ${ref.details}\n`;
        if (ref.safetyMessage) summary += `  Note: ${ref.safetyMessage}\n`;
        summary += "\n";
      });
    }

    summary += "NEXT STEPS:\n";
    if (medications.length > 0) {
      summary += "• Pick up your prescriptions at your preferred pharmacy\n";
      summary += "• Follow all medication instructions carefully\n";
    }
    if (labs.length > 0 || imaging.length > 0) {
      summary += "• Complete the recommended tests at your earliest convenience\n";
      summary += "• You can schedule these through the lab or imaging center directly\n";
    }
    if (followups.length > 0) {
      summary += `• Schedule your follow-up appointment as discussed\n`;
    } else {
      summary += "• Schedule a follow-up appointment in 4-6 weeks\n";
    }
    summary += "• Contact our office if you have any questions or concerns\n\n";

    summary += "IMPORTANT SAFETY INFORMATION:\n";
    const safetyActions = approvedActions.filter((a: any) => a.safetyFlag && a.safetyMessage);
    if (safetyActions.length > 0) {
      safetyActions.forEach((action: any) => {
        summary += `• ${action.title}: ${action.safetyMessage}\n`;
      });
    } else {
      summary += "• Take all medications as prescribed\n";
      summary += "• Report any side effects or concerns immediately\n";
      summary += "• Keep all follow-up appointments\n";
    }

    summary += "\n";
    summary += "If you have any questions about this plan or experience any concerning symptoms, please contact our office immediately.\n\n";
    summary += "Best regards,\n";
    summary += "Your Healthcare Team";

    return NextResponse.json({
      aftercareSummary: summary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate aftercare summary" },
      { status: 500 }
    );
  }
}
