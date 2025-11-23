import { NextRequest, NextResponse } from "next/server";
import { getMedplumClient } from "@/lib/medplum-client";
import { Patient } from "@medplum/fhirtypes";
import { extractPatientData } from "@/lib/patient-utils";

export async function POST(request: NextRequest) {
  try {
    const { patientId } = await request.json();

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Fetch real patient from Medplum with ALL fields
    const medplum = await getMedplumClient();
    const patient = await medplum.readResource("Patient", patientId);

    // Extract comprehensive patient data using utility
    const patientData = extractPatientData(patient);
    
    console.log('[Session Start] Extracted patient data:', {
      id: patientData.id,
      name: patientData.fullName,
      hasPhone: !!patientData.primaryPhone,
      hasEmail: !!patientData.email,
      hasAddress: !!patientData.address,
      emergencyContacts: patientData.emergencyContacts.length
    });

    // Build patient summary for session context
    const patientSummary = {
      id: patientData.id,
      name: patientData.fullName,
      mrn: patientData.mrn,
      dob: patientData.dateOfBirth,
      keyProblems: "Loading from medical history...",
      currentMeds: "Loading from medication list...",
      allergies: [] as string[],
      preferredPharmacy: "Not specified",
      insurance: "Not specified",
      // Include additional fields for questionnaire autofill
      gender: patientData.gender,
      age: patientData.age,
      phone: patientData.primaryPhone || patientData.mobilePhone,
      email: patientData.email,
      address: patientData.address?.full,
      emergencyContactName: patientData.emergencyContacts[0]?.name,
      emergencyContactPhone: patientData.emergencyContacts[0]?.phone,
    };

    // Build detailed history summary
    const historySummary = [
      `Patient: ${patientData.fullName}`,
      patientData.age ? `Age: ${patientData.age} years` : '',
      `Date of Birth: ${patientData.dateOfBirth}`,
      `MRN: ${patientData.mrn}`,
      patientData.gender ? `Gender: ${patientData.gender}` : '',
      patientData.maritalStatus ? `Marital Status: ${patientData.maritalStatus}` : '',
      '',
      patientData.primaryPhone ? `Phone: ${patientData.primaryPhone}` : '',
      patientData.email ? `Email: ${patientData.email}` : '',
      patientData.address ? `Address: ${patientData.address.full}` : '',
      '',
      patientData.emergencyContacts.length > 0 ? `Emergency Contact: ${patientData.emergencyContacts[0].name}${patientData.emergencyContacts[0].phone ? ` (${patientData.emergencyContacts[0].phone})` : ''}` : '',
      '',
      'Note: Full medical history available in EMR'
    ].filter(Boolean).join('\n');

    return NextResponse.json({
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patient: patientSummary,
      patientData: patientData, // Full patient data for questionnaire autofill
      historySummary,
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
