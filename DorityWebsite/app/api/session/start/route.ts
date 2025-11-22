import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { patientId } = await request.json();

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock patient data based on ID
    const mockPatients: Record<string, any> = {
      "patient-001": {
        id: "patient-001",
        name: "John Smith",
        mrn: "MRN-10234",
        dob: "1965-03-15",
        keyProblems: "Type 2 Diabetes Mellitus, Hypertension, Hyperlipidemia",
        currentMeds: "Metformin 1000mg BID, Lisinopril 10mg QD, Atorvastatin 20mg QHS",
        allergies: ["Penicillin", "Sulfa drugs"],
        preferredPharmacy: "CVS Pharmacy - Main Street",
        insurance: "Blue Cross Blue Shield PPO",
      },
      "patient-002": {
        id: "patient-002",
        name: "Sarah Johnson",
        mrn: "MRN-10567",
        dob: "1978-07-22",
        keyProblems: "Asthma (moderate persistent), GERD, Seasonal allergies",
        currentMeds: "Albuterol HFA PRN, Omeprazole 20mg QD, Fluticasone nasal spray QD",
        allergies: ["Latex"],
        preferredPharmacy: "Walgreens - Oak Avenue",
        insurance: "Aetna HMO",
      },
      "patient-003": {
        id: "patient-003",
        name: "Michael Chen",
        mrn: "MRN-10891",
        dob: "1952-11-08",
        keyProblems: "CHF (EF 35%), CKD Stage 3, Atrial Fibrillation",
        currentMeds: "Carvedilol 25mg BID, Furosemide 40mg QD, Apixaban 5mg BID, Spironolactone 25mg QD",
        allergies: [],
        preferredPharmacy: "Costco Pharmacy",
        insurance: "Medicare + Medigap Plan F",
      },
      "patient-004": {
        id: "patient-004",
        name: "Emily Rodriguez",
        mrn: "MRN-11024",
        dob: "1990-02-14",
        keyProblems: "Hypothyroidism, Migraines (chronic), Anxiety disorder",
        currentMeds: "Levothyroxine 75mcg QD, Sumatriptan 100mg PRN, Sertraline 50mg QD",
        allergies: ["Codeine"],
        preferredPharmacy: "Rite Aid - Downtown",
        insurance: "UnitedHealthcare PPO",
      },
    };

    const patient = mockPatients[patientId] || mockPatients["patient-001"];

    return NextResponse.json({
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patient,
      historySummary: `Recent visits:\n• 3 months ago: Annual physical, lab work ordered\n• 6 months ago: Follow-up for ${patient.keyProblems.split(",")[0]}\n\nLast A1C: ${patientId === "patient-001" ? "7.2%" : "N/A"}\nLast BP: ${patientId === "patient-001" || patientId === "patient-003" ? "138/84 mmHg" : "122/78 mmHg"}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}
