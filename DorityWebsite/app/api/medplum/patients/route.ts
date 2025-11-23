import { NextRequest, NextResponse } from 'next/server';

interface SimplifiedPatient {
  patientId: string;
  patientFirstName: string | undefined;
  patientLastName: string | undefined;
}

export async function GET(request: NextRequest) {
  try {
    console.log('[Patients] Fetching mock patients...');
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock patient data
    const mockPatients: SimplifiedPatient[] = [
      {
        patientId: 'patient-001',
        patientFirstName: 'John',
        patientLastName: 'Smith',
      },
      {
        patientId: 'patient-002',
        patientFirstName: 'Sarah',
        patientLastName: 'Johnson',
      },
      {
        patientId: 'patient-003',
        patientFirstName: 'Michael',
        patientLastName: 'Chen',
      },
      {
        patientId: 'patient-004',
        patientFirstName: 'Emily',
        patientLastName: 'Rodriguez',
      },
      {
        patientId: 'patient-005',
        patientFirstName: 'Robert',
        patientLastName: 'Williams',
      },
      {
        patientId: 'patient-006',
        patientFirstName: 'Jennifer',
        patientLastName: 'Brown',
      },
      {
        patientId: 'patient-007',
        patientFirstName: 'David',
        patientLastName: 'Miller',
      },
      {
        patientId: 'patient-008',
        patientFirstName: 'Maria',
        patientLastName: 'Garcia',
      },
    ];

    console.log(`[Patients] Returning ${mockPatients.length} mock patients`);

    return NextResponse.json(mockPatients);

  } catch (error) {
    console.error('[Patients] Error fetching patients:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch patients',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
