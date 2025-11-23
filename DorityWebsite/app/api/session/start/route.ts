import { NextRequest, NextResponse } from "next/server";
import { getMedplumClient } from "@/lib/medplum-client";
import { Patient, Address } from "@medplum/fhirtypes";

const formatAddress = (address?: Address) => {
  if (!address) {
    return '';
  }

  return [
    address.line?.[0],
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
};

const findPreferredPharmacy = (patient: Patient) => {
  const matchesPharmacy = (text?: string) =>
    !!text && text.toLowerCase().includes('pharm');

  const contact = patient.contact?.find((c) => {
    const relationshipMatches = c.relationship?.some((relationship) =>
      relationship.coding?.some(
        (coding) =>
          coding.code?.toLowerCase().includes('pharm') ||
          coding.display?.toLowerCase().includes('pharm')
      )
    );

    return (
      relationshipMatches ||
      matchesPharmacy(c.name?.text) ||
      matchesPharmacy(c.organization?.display)
    );
  });

  if (contact) {
    if (contact.organization?.display) {
      return contact.organization.display;
    }

    if (contact.name) {
      const nameParts = [
        contact.name.text,
        contact.name.given?.join(' '),
        contact.name.family,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      if (nameParts) {
        return nameParts;
      }
    }
  }

  return patient.generalPractitioner?.[0]?.display || '';
};

interface PatientSelection {
  patientAddress?: string;
  preferredPharmacy?: string;
  generalPractitioner?: string;
  organizationAddress?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { patientId, patientSelection } = await request.json();

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
    const patientAddress =
      formatAddress(patient.address?.[0]) || patientSelection?.patientAddress || "Not provided";
    const preferredPharmacy =
      findPreferredPharmacy(patient) || patientSelection?.preferredPharmacy || "Not specified";
    const generalPractitioner =
      patientSelection?.generalPractitioner ||
      patient.generalPractitioner?.[0]?.display ||
      "Not specified";
    const organizationAddress = patientSelection?.organizationAddress || "";

    // Build patient summary
    const patientSummary = {
      id: patient.id!,
      name: fullName,
      mrn: mrn,
      dob: dob,
      keyProblems: "Loading from medical history...",
      currentMeds: "Loading from medication list...",
      allergies: [] as string[],
      preferredPharmacy,
      address: patientAddress,
      generalPractitioner,
      organizationAddress,
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
