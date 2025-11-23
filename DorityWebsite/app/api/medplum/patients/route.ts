import { NextRequest, NextResponse } from 'next/server';
import { getMedplumClient } from '@/lib/medplum-client';
import { Patient, Organization, Address } from '@medplum/fhirtypes';

interface SimplifiedPatient {
  patientId: string;
  patientFirstName: string | undefined;
  patientLastName: string | undefined;
  generalPractitioner: string | undefined;
  patientAddress: string;
  preferredPharmacy: string;
  organizationAddress?: string;
};

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

export async function GET(request: NextRequest) {
  try {
    console.log('[Patients] Fetching patients from Medplum...');
    
    const medplum = await getMedplumClient();
    
    // Fetch up to 100 patients from Medplum FHIR API
    const patients = await medplum.searchResources('Patient', {
      _count: '100',
    });


    console.log(`[Patients] Found ${patients.length} patients`);

    const simplifiedPatients: SimplifiedPatient[] = patients.map((patient: Patient) => {
      const patientAddress = formatAddress(patient.address?.[0]);
      const preferredPharmacy = findPreferredPharmacy(patient);

      return {
        patientId: patient.id || '',
        patientFirstName: patient.name?.[0]?.given?.[0],
        patientLastName: patient.name?.[0]?.family,
        generalPractitioner: patient.generalPractitioner?.[0]?.display,
        patientAddress,
        preferredPharmacy,
      };
    });

    const orgs = await medplum.searchResources('Organization', {
      _count: '100',
    });

    const orgAddressMap = orgs.reduce<Record<string, string>>((acc, org) => {
      const address = formatAddress(org.address?.[0]);
      if (!address) {
        return acc;
      }

      if (org.id) {
        acc[`Organization/${org.id}`] = address;
      }
      if (org.name) {
        acc[org.name] = address;
      }
      return acc;
    }, {});

    const finalPatientInfo = simplifiedPatients.map((patient) => {
      // Find organization address by checking both reference and display name
      // We need to look at the original patient object's generalPractitioner field
      // matching the current simplified patient by ID
      const originalPatient = patients.find(p => p.id === patient.patientId);
      
      let organizationAddress = '';
      if (originalPatient?.generalPractitioner) {
        for (const ref of originalPatient.generalPractitioner) {
          if (ref.reference && orgAddressMap[ref.reference]) {
            organizationAddress = orgAddressMap[ref.reference];
            break;
          }
          if (ref.display && orgAddressMap[ref.display]) {
            organizationAddress = orgAddressMap[ref.display];
            break;
          }
        }
      }

      return {
        ...patient,
        organizationAddress,
      };
    });
    console.log('All Patient Info:');
    console.log(finalPatientInfo);
    return NextResponse.json({
      patients: finalPatientInfo
    });
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
