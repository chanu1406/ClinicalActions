import { NextRequest, NextResponse } from "next/server";
import { getMedplumClient } from "@/lib/medplum-client";
import { Patient } from "@medplum/fhirtypes";

export async function POST(request: NextRequest) {
  try {
    const { patientId } = await request.json();

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Fetch real patient from Medplum
    const medplum = await getMedplumClient();
    const patient = await medplum.readResource("Patient", patientId);

    // Extract patient details
    const firstName = patient.name?.[0]?.given?.[0] || "";
    const lastName = patient.name?.[0]?.family || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Unknown Patient";
    const dob = patient.birthDate || "Unknown";
    const mrn = patient.identifier?.find(id => id.type?.coding?.[0]?.code === "MR")?.value || "N/A";

    // Build patient summary
    const patientSummary = {
      id: patient.id!,
      name: fullName,
      mrn: mrn,
      dob: dob,
      keyProblems: "Loading from medical history...",
      currentMeds: "Loading from medication list...",
      allergies: [] as string[],
      preferredPharmacy: "Not specified",
      insurance: "Not specified",
    };

    return NextResponse.json({
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patient: patientSummary,
      historySummary: `Patient: ${fullName}\nDate of Birth: ${dob}\nMRN: ${mrn}\n\nNote: Full medical history available in EMR`,
    });
  } catch (error) {
    console.error("[Session Start] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to start session",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
