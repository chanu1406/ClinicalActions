/**
 * Smart dummy data generator for filling missing questionnaire fields
 * Uses context-aware realistic values based on field type and clinical context
 * Prefers real patient data from Medplum when available
 */

import { QuestionnaireItem } from '@medplum/fhirtypes';

interface DummyDataContext {
  // Real patient data from Medplum (preferred)
  patientName?: string;
  patientAge?: number;
  patientDob?: string;
  patientGender?: string;
  patientMrn?: string;
  patientPhone?: string;
  patientEmail?: string;
  patientAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredPharmacy?: string;
  insurance?: string;
  generalPractitioner?: string;
  // Clinical context
  clinicalContext?: string; // e.g., "subarachnoid hemorrhage", "chest pain"
  urgency?: 'stat' | 'urgent' | 'routine';
  // Metadata
  hasRealPatientData?: boolean;
}

/**
 * Generate smart dummy data for a questionnaire field based on its linkId, type, and context
 * ALWAYS prefers real patient data from Medplum when available
 */
export function generateSmartDummyValue(
  item: QuestionnaireItem,
  context: DummyDataContext = {}
): any {
  const linkId = item.linkId?.toLowerCase() || '';
  const type = item.type;

  // Patient demographic fields - USE REAL MEDPLUM DATA
  if (linkId.includes('patient') && linkId.includes('name')) {
    if (context.patientName) return context.patientName;
    // Generate realistic name for demo purposes
    const firstNames = ['Sarah', 'Michael', 'Jennifer', 'David', 'Emily', 'James', 'Lisa', 'Robert'];
    const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  if (linkId.includes('dob') || linkId.includes('birth')) {
    if (context.patientDob) return context.patientDob;
    // Generate realistic DOB for demo (adult patient, 25-65 years old)
    const age = context.patientAge || (25 + Math.floor(Math.random() * 40));
    const year = new Date().getFullYear() - age;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (linkId.includes('age')) {
    if (context.patientAge) return context.patientAge.toString();
    // Generate realistic age for demo
    return String(25 + Math.floor(Math.random() * 40));
  }

  if (linkId.includes('gender') || linkId.includes('sex')) {
    if (context.patientGender) return context.patientGender;
    // Generate realistic gender for demo
    const genders = ['male', 'female'];
    return genders[Math.floor(Math.random() * genders.length)];
  }

  if (linkId.includes('mrn') || linkId.includes('medical') && linkId.includes('record')) {
    if (context.patientMrn) return context.patientMrn;
    // Generate realistic MRN format for demo
    return `MRN${String(Math.floor(Math.random() * 9000000) + 1000000)}`;
  }

  // Contact information - USE REAL MEDPLUM DATA
  if (linkId.includes('phone') || linkId.includes('telephone')) {
    if (linkId.includes('emergency')) {
      if (context.emergencyContactPhone) return context.emergencyContactPhone;
      if (context.patientPhone) return context.patientPhone;
    }
    if (context.patientPhone) return context.patientPhone;
    // Generate realistic phone number for demo
    const areaCode = String(200 + Math.floor(Math.random() * 799));
    const exchange = String(200 + Math.floor(Math.random() * 799));
    const number = String(1000 + Math.floor(Math.random() * 8999));
    return `(${areaCode}) ${exchange}-${number}`;
  }

  if (linkId.includes('email')) {
    if (context.patientEmail) return context.patientEmail;
    // Generate realistic email for demo
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];
    const firstName = context.patientName?.split(' ')[0]?.toLowerCase() || 'patient';
    const lastName = context.patientName?.split(' ')[1]?.toLowerCase() || String(Math.floor(Math.random() * 999));
    return `${firstName}.${lastName}@${domains[Math.floor(Math.random() * domains.length)]}`;
  }

  if (linkId.includes('address')) {
    if (context.patientAddress) return context.patientAddress;
    // Generate realistic address for demo
    const streetNumbers = [123, 456, 789, 1012, 2345, 3456];
    const streets = ['Oak Street', 'Maple Avenue', 'Pine Drive', 'Cedar Lane', 'Elm Court', 'Birch Way'];
    const cities = ['Springfield', 'Riverside', 'Fairview', 'Georgetown', 'Madison', 'Arlington'];
    const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA'];
    const streetNum = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const zip = String(10000 + Math.floor(Math.random() * 89999));
    return `${streetNum} ${street}, ${city}, ${state} ${zip}`;
  }

  if (linkId.includes('emergency') && linkId.includes('contact')) {
    if (linkId.includes('name')) {
      if (context.emergencyContactName) return context.emergencyContactName;
      // Generate realistic emergency contact name
      const names = ['Jane Smith', 'John Doe', 'Mary Johnson', 'Robert Williams', 'Patricia Brown'];
      return names[Math.floor(Math.random() * names.length)];
    }
    if (linkId.includes('phone')) {
      if (context.emergencyContactPhone) return context.emergencyContactPhone;
      // Generate realistic phone
      const areaCode = String(200 + Math.floor(Math.random() * 799));
      const exchange = String(200 + Math.floor(Math.random() * 799));
      const number = String(1000 + Math.floor(Math.random() * 8999));
      return `(${areaCode}) ${exchange}-${number}`;
    }
  }

  // Clinical fields - Imaging/Procedures
  if (linkId.includes('examtype') || linkId.includes('exam') && linkId.includes('type')) {
    if (context.clinicalContext?.toLowerCase().includes('head') || 
        context.clinicalContext?.toLowerCase().includes('brain')) {
      return 'CT Brain (non-contrast)';
    }
    return 'Standard examination';
  }
  
  if (linkId.includes('bodyregion') || linkId.includes('body') && linkId.includes('region')) {
    if (context.clinicalContext?.toLowerCase().includes('brain') || 
        context.clinicalContext?.toLowerCase().includes('head')) {
      return 'Brain/Head';
    }
    if (context.clinicalContext?.toLowerCase().includes('chest')) {
      return 'Chest';
    }
    return 'See clinical indication';
  }
  
  if (linkId.includes('contrast')) {
    if (type === 'boolean') return false;
    return 'No contrast';
  }
  
  if (linkId.includes('priority')) {
    if (context.urgency === 'stat') return 'STAT';
    if (context.urgency === 'urgent') return 'Urgent';
    return 'Routine';
  }
  
  if (linkId.includes('indication') || linkId.includes('reason') || linkId.includes('diagnosis')) {
    return context.clinicalContext || 'Clinical evaluation required';
  }

  // Safety/Contraindications
  if (linkId.includes('contraindication')) {
    return 'None known';
  }
  
  if (linkId.includes('allerg')) {
    return 'No known allergies';
  }
  
  if (linkId.includes('pregnancy') || linkId.includes('pregnant')) {
    if (type === 'boolean') return false;
    return 'Not pregnant / Not applicable';
  }
  
  if (linkId.includes('implant') || linkId.includes('pacemaker') || 
      linkId.includes('metal') || linkId.includes('claustrophobia')) {
    if (type === 'boolean') return false;
    return 'No';
  }

  // Medication fields
  if (linkId.includes('medication') && linkId.includes('name')) {
    return 'As prescribed';
  }
  
  if (linkId.includes('dosage') || linkId.includes('dose')) {
    return 'Standard dose per protocol';
  }
  
  if (linkId.includes('route')) {
    return 'Oral';
  }
  
  if (linkId.includes('frequency')) {
    return 'As directed';
  }
  
  if (linkId.includes('duration')) {
    return '7 days';
  }
  
  if (linkId.includes('quantity')) {
    if (linkId.includes('refill')) return '0';
    return '30';
  }
  
  if (linkId.includes('refill')) {
    if (type === 'integer' || type === 'decimal') return 0;
    return 'No refills';
  }

  // Provider fields - Generate realistic names
  if (linkId.includes('provider') || linkId.includes('physician') || 
      linkId.includes('prescriber') || linkId.includes('ordering')) {
    // Generate realistic provider names
    const providerNames = [
      'Dr. Sarah Chen, MD',
      'Dr. Michael Johnson, MD',
      'Dr. Emily Rodriguez, MD',
      'Dr. David Kim, MD',
      'Dr. Jennifer Williams, MD',
      'Dr. Robert Thompson, MD'
    ];
    return providerNames[Math.floor(Math.random() * providerNames.length)];
  }
  
  if (linkId.includes('npi')) {
    // Generate realistic NPI number (10 digits)
    return `12345${Math.random().toString().slice(2, 7)}`;
  }
  
  if (linkId.includes('dea')) {
    // Generate realistic DEA number format (2 letters + 7 digits)
    return `AB${Math.random().toString().slice(2, 9)}`;
  }
  
  if (linkId.includes('signature') || linkId.includes('sign')) {
    return 'Electronically signed';
  }

  // Pharmacy fields - USE REAL MEDPLUM DATA
  if (linkId.includes('pharmacy')) {
    if (context.preferredPharmacy) return context.preferredPharmacy;
    // Generate realistic pharmacy name for demo
    const pharmacies = [
      'CVS Pharmacy #5432',
      'Walgreens #8765',
      'Rite Aid Pharmacy',
      'Community Health Pharmacy',
      'MedExpress Pharmacy',
      'HealthPlus Pharmacy'
    ];
    return pharmacies[Math.floor(Math.random() * pharmacies.length)];
  }

  // Scheduling/Logistics
  if (linkId.includes('scheduling') || linkId.includes('appointment')) {
    if (context.urgency === 'stat') {
      return 'Immediate - STAT order';
    }
    return 'Schedule at earliest availability';
  }
  
  if (linkId.includes('transport') || linkId.includes('sedation')) {
    if (type === 'boolean') return false;
    return 'Not required';
  }
  
  if (linkId.includes('fasting')) {
    if (type === 'boolean') return false;
    return 'Not required';
  }

  // Instructions/Notes
  if (linkId.includes('instruction') || linkId.includes('note') || linkId.includes('comment')) {
    return 'See clinical indication for details';
  }
  
  if (linkId.includes('special')) {
    return 'None';
  }

  // Insurance/Billing - USE REAL MEDPLUM DATA
  if (linkId.includes('insurance')) {
    if (context.insurance) return context.insurance;
    // Generate realistic insurance for demo
    const insuranceProviders = [
      'Blue Cross Blue Shield',
      'United Healthcare',
      'Aetna',
      'Cigna',
      'Humana',
      'Kaiser Permanente'
    ];
    return insuranceProviders[Math.floor(Math.random() * insuranceProviders.length)];
  }

  // Primary care provider - USE REAL MEDPLUM DATA
  if ((linkId.includes('primary') || linkId.includes('pcp')) && (linkId.includes('care') || linkId.includes('provider'))) {
    if (context.generalPractitioner) return context.generalPractitioner;
    // Generate realistic PCP name
    const pcpNames = [
      'Dr. Sarah Chen, MD',
      'Dr. Michael Johnson, MD',
      'Dr. Emily Rodriguez, MD',
      'Dr. David Kim, MD',
      'Dr. Jennifer Williams, MD'
    ];
    return pcpNames[Math.floor(Math.random() * pcpNames.length)];
  }

  // Generic fallbacks based on type
  switch (type) {
    case 'boolean':
      return false;
    
    case 'integer':
      return 0;
    
    case 'decimal':
      return 0.0;
    
    case 'date':
      // Use current date for order dates, realistic dates for appointments
      if (linkId.includes('order') || linkId.includes('request')) {
        return new Date().toISOString().split('T')[0];
      }
      if (linkId.includes('appointment') || linkId.includes('schedule')) {
        // Future date (7 days from now)
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        return futureDate.toISOString().split('T')[0];
      }
      return new Date().toISOString().split('T')[0];
    
    case 'dateTime':
      if (linkId.includes('appointment') || linkId.includes('schedule')) {
        // Future datetime (7 days from now at 2 PM)
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        futureDate.setHours(14, 0, 0, 0);
        return futureDate.toISOString();
      }
      return new Date().toISOString();
    
    case 'time':
      // Realistic medical appointment times
      const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
      return times[Math.floor(Math.random() * times.length)];
    
    case 'choice':
      // CRITICAL: Return the actual code/value that the form expects
      // Intelligent selection based on context and field name
      if (item.answerOption && item.answerOption.length > 0) {
        let selectedOption = item.answerOption[0]; // Default to first option

        // Smart selection based on field type and context
        if (linkId.includes('priority')) {
          // Select priority based on urgency context
          const priorityMatch = item.answerOption.find(opt => {
            const display = (opt.valueCoding?.display || opt.valueString || '').toLowerCase();
            if (context.urgency === 'stat' && (display.includes('stat') || display.includes('immediate'))) return true;
            if (context.urgency === 'urgent' && display.includes('urgent')) return true;
            if (context.urgency === 'routine' && (display.includes('routine') || display.includes('normal'))) return true;
            return false;
          });
          if (priorityMatch) selectedOption = priorityMatch;
          else if (context.urgency === 'routine') {
            // If no match, default to first option for routine (usually routine/normal)
            selectedOption = item.answerOption[0];
          }
        } else if (linkId.includes('contrast')) {
          // For contrast, prefer "No" or "Without contrast" options
          const noContrastOption = item.answerOption.find(opt => {
            const display = (opt.valueCoding?.display || opt.valueString || '').toLowerCase();
            return display.includes('no') || display.includes('without') || display.includes('none');
          });
          if (noContrastOption) selectedOption = noContrastOption;
        } else if (linkId.includes('sedation')) {
          // For sedation, prefer "No" or "Not required"
          const noSedationOption = item.answerOption.find(opt => {
            const display = (opt.valueCoding?.display || opt.valueString || '').toLowerCase();
            return display.includes('no') || display.includes('not required') || display.includes('none');
          });
          if (noSedationOption) selectedOption = noSedationOption;
        } else if (linkId.includes('transport')) {
          // For transport, prefer "No" or "Not required"
          const noTransportOption = item.answerOption.find(opt => {
            const display = (opt.valueCoding?.display || opt.valueString || '').toLowerCase();
            return display.includes('no') || display.includes('not required') || display.includes('ambulatory');
          });
          if (noTransportOption) selectedOption = noTransportOption;
        }

        // Return the CODE (for valueCoding) or STRING (for valueString)
        // This is what the select dropdown uses as the option value
        if (selectedOption.valueCoding?.code) {
          return selectedOption.valueCoding.code;
        }
        if (selectedOption.valueCoding?.display) {
          return selectedOption.valueCoding.display;
        }
        if (selectedOption.valueString) {
          return selectedOption.valueString;
        }
      }
      return ''; // Empty string so form shows "Select an option..."
    
    case 'string':
    case 'text':
    default:
      // Check if it's a required field to give it more attention
      if (item.required) {
        return 'To be completed';
      }
      return '';
  }
}

/**
 * Fill all missing fields in a QuestionnaireResponse with smart dummy data
 */
export function fillMissingFields(
  questionnaireResponse: any,
  questionnaire: any,
  context: DummyDataContext = {}
): any {
  // Input validation
  if (!questionnaireResponse || !questionnaire) {
    console.error('[fillMissingFields] Invalid input: questionnaireResponse or questionnaire is null/undefined');
    return questionnaireResponse;
  }

  const filledResponse = JSON.parse(JSON.stringify(questionnaireResponse));

  // Track statistics for logging
  const stats = {
    totalFields: 0,
    alreadyFilled: 0,
    autoFilled: 0,
    usedRealData: 0,
    usedDummyData: 0
  };

  // Helper to check if an item already has an answer
  const hasAnswer = (itemId: string, items: any[]): boolean => {
    if (!items || !Array.isArray(items)) return false;
    for (const item of items) {
      if (item.linkId === itemId && item.answer && item.answer.length > 0) {
        return true;
      }
      if (item.item && hasAnswer(itemId, item.item)) {
        return true;
      }
    }
    return false;
  };
  
  // Helper to add missing items recursively
  const fillItems = (questionnaireItems: any[], responseItems: any[], parentGroup?: any) => {
    if (!questionnaireItems || !Array.isArray(questionnaireItems)) {
      console.warn('[fillMissingFields] Invalid questionnaireItems:', questionnaireItems);
      return;
    }

    for (const qItem of questionnaireItems) {
      // Skip display items
      if (qItem.type === 'display') continue;

      stats.totalFields++;

      // Check if this item already has an answer
      const alreadyAnswered = hasAnswer(qItem.linkId, responseItems);

      if (alreadyAnswered) {
        stats.alreadyFilled++;
      }

      if (!alreadyAnswered && qItem.type !== 'group') {
        // Generate dummy value for this field
        const dummyValue = generateSmartDummyValue(qItem, context);
        stats.autoFilled++;

        // Track if we used real data or dummy data
        const linkIdLower = qItem.linkId?.toLowerCase() || '';
        if (linkIdLower.includes('patient') || linkIdLower.includes('name') ||
            linkIdLower.includes('phone') || linkIdLower.includes('email') ||
            linkIdLower.includes('address') || linkIdLower.includes('mrn')) {
          if (context.hasRealPatientData) {
            stats.usedRealData++;
          } else {
            stats.usedDummyData++;
          }
        }
        
        // Create answer object based on type
        let answer;
        if (qItem.type === 'boolean') {
          answer = [{ valueBoolean: dummyValue }];
        } else if (qItem.type === 'integer') {
          answer = [{ valueInteger: dummyValue }];
        } else if (qItem.type === 'decimal') {
          answer = [{ valueDecimal: dummyValue }];
        } else if (qItem.type === 'date') {
          answer = [{ valueDate: dummyValue }];
        } else if (qItem.type === 'dateTime') {
          answer = [{ valueDateTime: dummyValue }];
        } else if (qItem.type === 'choice' && qItem.answerOption && qItem.answerOption.length > 0) {
          // CRITICAL: For choice fields, create proper answer structure
          const firstOption = qItem.answerOption[0];
          
          if (firstOption.valueCoding) {
            // Use valueCoding if the option has it
            answer = [{ valueCoding: {
              system: firstOption.valueCoding.system,
              code: firstOption.valueCoding.code,
              display: firstOption.valueCoding.display
            }}];
          } else if (firstOption.valueString) {
            // Use valueString if the option has it
            answer = [{ valueString: firstOption.valueString }];
          } else {
            // Fallback to valueString with dummy value
            answer = [{ valueString: dummyValue }];
          }
        } else {
          answer = [{ valueString: dummyValue }];
        }
        
        // Add to response
        const newItem = {
          linkId: qItem.linkId,
          answer
        };
        
        // Find or create the parent group
        if (parentGroup) {
          let parentInResponse = responseItems.find((i: any) => i.linkId === parentGroup.linkId);
          if (!parentInResponse) {
            parentInResponse = {
              linkId: parentGroup.linkId,
              item: []
            };
            responseItems.push(parentInResponse);
          }
          if (!parentInResponse.item) {
            parentInResponse.item = [];
          }
          parentInResponse.item.push(newItem);
        } else {
          responseItems.push(newItem);
        }
      }
      
      // Recursively fill nested items (groups)
      if (qItem.type === 'group' && qItem.item) {
        let groupInResponse = responseItems.find((i: any) => i.linkId === qItem.linkId);
        if (!groupInResponse) {
          groupInResponse = {
            linkId: qItem.linkId,
            item: []
          };
          responseItems.push(groupInResponse);
        }
        if (!groupInResponse.item) {
          groupInResponse.item = [];
        }
        fillItems(qItem.item, groupInResponse.item, qItem);
      }
    }
  };
  
  if (questionnaire.item && filledResponse.item) {
    fillItems(questionnaire.item, filledResponse.item);
  } else {
    console.warn('[fillMissingFields] Missing questionnaire.item or filledResponse.item');
  }

  // Log statistics
  console.log('[fillMissingFields] Autofill Statistics:', {
    totalFields: stats.totalFields,
    alreadyFilled: stats.alreadyFilled,
    autoFilled: stats.autoFilled,
    usedRealData: stats.usedRealData,
    usedDummyData: stats.usedDummyData,
    completionRate: stats.totalFields > 0 ? `${Math.round(((stats.alreadyFilled + stats.autoFilled) / stats.totalFields) * 100)}%` : 'N/A',
    hasRealPatientData: context.hasRealPatientData || false
  });

  // Validate critical fields are filled
  if (filledResponse.item && Array.isArray(filledResponse.item)) {
    const hasPatientName = filledResponse.item.some((item: any) =>
      item.linkId?.toLowerCase().includes('name') && item.answer && item.answer.length > 0
    );

    if (!hasPatientName) {
      console.warn('[fillMissingFields] WARNING: Patient name field may not be filled');
    }
  }

  return filledResponse;
}
