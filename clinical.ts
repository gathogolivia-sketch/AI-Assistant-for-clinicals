export type Department = 'medicine' | 'pharmacy' | 'nursing';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface PatientVitalSigns {
  heartRate: number; // bpm
  bloodPressure: string; // mmHg e.g. "148/92"
  respiratoryRate: number; // breaths/min
  temperature: number; // Celsius e.g. 38.2
  oxygenSaturation: number; // % e.g. 94
  ecgRhythm?: string; // e.g. "Sinus Tachycardia", "Normal Sinus Rhythm", "Atrial Fibrillation"
  bloodGlucose?: number; // mg/dL e.g. 165
}

export interface LabTest {
  id: string;
  name: string;
  category: 'cardiac' | 'hematology' | 'chemistry' | 'imaging' | 'microbiology';
  normalRange: string;
  result: string;
  unit?: string;
  isAbnormal: boolean;
  clinicalNote?: string;
  revealed?: boolean;
}

export interface MedicationRecord {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  indication: string;
  isPrescribedCurrent: boolean;
}

export interface MedicineCaseDetails {
  candidateDiagnoses: string[];
  correctDiagnosis: string;
  redFlagsList: { id: string; label: string; isRedFlag: boolean }[];
  clinicalReasoningPrompt: string;
}

export interface PharmacyCaseDetails {
  newPrescription: {
    drug: string;
    dose: string;
    route: string;
    frequency: string;
    prescriber: string;
    indication: string;
  };
  knownInteractions: string[];
  counsellingChecklist: { id: string; label: string; isEssential: boolean }[];
  correctAction: 'dispense_as_is' | 'contact_prescriber' | 'refuse_and_escalate';
  actionRationale: string;
}

export interface NursingCaseDetails {
  priorityNursingDiagnoses: string[];
  correctPriorityDiagnosis: string;
  careInterventions: { id: string; label: string; isPriority: boolean; rationale: string }[];
  fallRiskScore: number; // Morse Fall Scale e.g. 65 (High Risk)
  pressureUlcerRisk: 'Low' | 'Moderate' | 'High'; // Braden Scale
  suggestedSbar: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
}

export interface SocialDeterminantsOfHealth {
  transportation: {
    barrierPresent: boolean;
    details: string; // e.g. "No vehicle, relies on 2 connecting city buses; missed 3 clinic visits this year"
    impactOnCare?: string;
  };
  financial: {
    barrierPresent: boolean;
    details: string; // e.g. "Fixed disability pension, occasionally rations insulin or skips pills before payday"
    medicationCostStrain?: boolean;
  };
  foodAccess?: {
    foodInsecurity: boolean;
    details: string; // e.g. "Nearest grocery store 4 miles away; relies on corner convenience mart high-sodium canned foods"
  };
  housing?: {
    housingStatus: string; // e.g. "Rental apartment, 3rd floor walkup with no elevator, steep stairs"
    hazardAlert?: string;
  };
  supportSystem?: {
    liveAlone: boolean;
    details: string; // e.g. "Widowed, adult children live in another state"
  };
  healthLiteracy?: {
    level: 'Low' | 'Moderate' | 'High' | string;
    details: string; // e.g. "Difficulty reading small prescription bottle prints and calculating sliding scale units"
  };
}

export interface PatientCase {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Non-binary';
  occupation: string;
  bedNumber: string;
  department: Department;
  difficulty: Difficulty;
  chiefComplaint: string;
  triageAcuity: 1 | 2 | 3 | 4 | 5; // 1 = Resuscitation/Immediate, 5 = Non-urgent
  triageNotes: string;
  diagnosis: string;
  demeanor: string;
  avatarSeed: string;
  vitals: PatientVitalSigns;
  comorbidities: string[]; // e.g. ['Essential Hypertension', 'Type 2 Diabetes Mellitus', 'Tobacco Use Disorder']
  pastMedicalHistory: string[];
  pastSurgicalHistory?: string[];
  allergies: string[]; // Detailed allergy list with reaction types
  socialHistory: {
    smoking: string;
    alcohol: string;
    livingSituation: string;
    dietOrExercise?: string;
  };
  socialDeterminants: SocialDeterminantsOfHealth;
  hiddenClinicalTruth: {
    painDetails?: string;
    painOnset?: string;
    triggers?: string;
    secretHistory?: string;
    lifestyleSecret?: string;
    sdohSecret?: string;
    [key: string]: string | undefined;
  };
  currentMedications: MedicationRecord[];
  orderableLabs: LabTest[];
  medicineDetails?: MedicineCaseDetails;
  pharmacyDetails?: PharmacyCaseDetails;
  nursingDetails?: NursingCaseDetails;
  learningObjectives: string[];
  emergencyWarning?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'patient' | 'system';
  text: string;
  timestamp: string;
  category?: 'HPI' | 'Meds' | 'Allergies' | 'Social' | 'Review of Systems' | 'SDOH & Barriers' | 'General';
}

export interface StudentDecisions {
  selectedDiagnosis?: string;
  identifiedRedFlags?: string[];
  selectedLabs?: string[];
  clinicalNotes?: string;
  sdohBarriersAddressed?: string[];
  sdohInterventionNotes?: string;
  // Pharmacy specific
  pharmacyAction?: 'dispense_as_is' | 'contact_prescriber' | 'refuse_and_escalate';
  checkedInteractions?: string[];
  counsellingSelected?: string[];
  // Nursing specific
  selectedNursingDiagnosis?: string;
  selectedInterventions?: string[];
  studentSbar?: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
}

export interface EvaluationResult {
  overallScore: number;
  performanceTier: 'Needs Remediation' | 'Developing' | 'Proficient' | 'Mastery / Honors';
  categoryScores: {
    communication: number;
    clinicalReasoning: number;
    patientSafety: number;
  };
  strengths: string[];
  missedAreas: string[];
  clinicalRationale: string;
  correctClinicalPath: string;
  keyLearningPoints: string[];
  emergencySupervisionAlert: string | null;
}
