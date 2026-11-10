import express, { Request, Response } from 'express';
import http from 'http';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Direct Project ZIP Download Endpoint
 */
app.get('/api/download-project', (_req: Request, res: Response) => {
  const zipPath = path.join(__dirname, 'ai-clinical-simulation-assistant.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="ai-clinical-simulation-assistant.zip"');
    const readStream = fs.createReadStream(zipPath);
    readStream.pipe(res);
  } else {
    res.status(404).json({ error: 'Zip archive not found' });
  }
});

/**
 * Interactive Patient Chat Endpoint
 * Patient replies in character as a realistic human patient with emotions, lay language,
 * and withholding information unless the student specifically asks.
 */
app.post('/api/patient/chat', async (req: Request, res: Response) => {
  try {
    const { patient, message, chatHistory } = req.body;

    if (!patient || !message) {
      return res.status(400).json({ error: 'Patient data and student message are required.' });
    }

    // If Gemini API is available, generate dynamic response
    if (ai) {
      const systemInstruction = `You are roleplaying as a real patient in a university clinical simulation training environment.
PATIENT PROFILE:
- Name: ${patient.name}
- Age: ${patient.age}, Gender: ${patient.gender}
- Chief Complaint: ${patient.chiefComplaint}
- True Diagnosis: ${patient.diagnosis}
- Comorbidities: ${JSON.stringify(patient.comorbidities || [])}
- Past Medical History: ${JSON.stringify(patient.pastMedicalHistory || [])}
- Allergies: ${JSON.stringify(patient.allergies || [])}
- Social Determinants of Health (SDOH): ${JSON.stringify(patient.socialDeterminants || {})}
- Background & Hidden Details: ${JSON.stringify(patient.hiddenClinicalTruth || {})}
- Current Medications: ${JSON.stringify(patient.medications || patient.currentMedications || [])}
- Social / Lifestyle: ${JSON.stringify(patient.socialHistory || {})}
- Demeanor & Personality: ${patient.demeanor || 'A bit anxious, cooperative but non-medical'}

CRITICAL ROLEPLAY RULES:
1. Speak in first-person voice as ${patient.name}. Use non-technical everyday layperson language.
2. DO NOT blurt out your diagnosis or medical jargon. You do not know what illness you have; you only know what hurts, feels strange, or worries you.
3. DO NOT reveal all information at once! Only answer what the student specifically asked.
4. If asked about pain, describe location, what it feels like (e.g. sharp, dull, heavy pressure), when it started, and if anything makes it better/worse.
5. If the student asks about transportation, getting to appointments, money, prescription affordability, food, or home environment, honestly disclose your Social Determinants of Health barriers as described in your profile.
6. If the student asks about your medical history, comorbidities (high blood pressure, diabetes, etc.), smoking, or allergies, share your accurate profile details.
7. Express realistic human emotions: mild anxiety, confusion, discomfort, hesitation, relief when treated with empathy, or vulnerability regarding financial/transportation struggles.
8. Keep responses concise, natural, and realistic (typically 2 to 4 sentences). Never break character or say "As an AI".
9. EDUCATIONAL SAFETY: This is a safe fictional simulation for healthcare students.`;

      const formattedHistory = Array.isArray(chatHistory)
        ? chatHistory.map((m: { sender: string; text: string }) => `${m.sender === 'student' ? 'Student Doctor/Nurse/Pharmacist' : patient.name}: ${m.text}`).join('\n')
        : '';

      const prompt = `${formattedHistory ? `PREVIOUS CONVERSATION:\n${formattedHistory}\n\n` : ''}STUDENT'S NEW QUESTION: "${message}"\n\nProvide ${patient.name}'s natural reply:`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), 4000)
      );

      const response: any = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
          },
        }),
        timeoutPromise,
      ]);

      const reply = response.text?.trim() || "I'm sorry, could you repeat that? I'm feeling a bit unwell.";
      return res.json({ reply });
    }

    // Fallback response generator if API key is not configured
    const fallbackReply = generateFallbackPatientReply(patient, message);
    return res.json({ reply: fallbackReply });
  } catch (err: any) {
    console.error('Error in /api/patient/chat:', err?.message || err);
    // Return resilient fallback response so student's simulation never freezes
    const fallbackReply = generateFallbackPatientReply(req.body?.patient, req.body?.message);
    return res.json({ reply: fallbackReply });
  }
});

/**
 * Clinical Evaluation & Feedback Endpoint
 * Evaluates student performance across Communication, Clinical Reasoning, Patient Safety, and SDOH.
 */
app.post('/api/patient/evaluate', async (req: Request, res: Response) => {
  try {
    const { patient, department, chatHistory, studentDecisions } = req.body;

    if (!patient || !department) {
      return res.status(400).json({ error: 'Patient and department are required.' });
    }

    if (ai) {
      const systemInstruction = `You are a Senior University Clinical Professor and OSCE Clinical Examiner evaluating a student in ${department.toUpperCase()}.
Your task is to provide rigorous, constructive, encouraging, and pedagogically sound clinical feedback on their interaction with a simulated patient.
The feedback must evaluate:
1. Communication & History Gathering (Did they explore OPQRST, past medical history, and multiple comorbidities?)
2. Social Determinants of Health & Holistic Care (Did they ask about or address transportation barriers, medication affordability, food access, home safety, or smoking cessation?)
3. Clinical Reasoning & Decision (Differential diagnosis in medicine, drug screening & interaction checking in pharmacy, or vitals interpretation & care plan in nursing)
4. Patient Safety & Red Flags (Did they catch urgent symptoms, allergies, drug contraindications, or emergency signs?)

OUTPUT FORMAT: Strict JSON matching this schema:
{
  "overallScore": number (0-100),
  "performanceTier": "Needs Remediation" | "Developing" | "Proficient" | "Mastery / Honors",
  "categoryScores": {
    "communication": number (0-100),
    "clinicalReasoning": number (0-100),
    "patientSafety": number (0-100)
  },
  "strengths": string[],
  "missedAreas": string[],
  "clinicalRationale": string,
  "correctClinicalPath": string,
  "keyLearningPoints": string[],
  "emergencySupervisionAlert": string | null
}`;

      const prompt = `CASE SUMMARY:
- Patient: ${patient.name}, ${patient.age} y/o (${patient.gender})
- Department: ${department}
- Chief Complaint: ${patient.chiefComplaint}
- True Diagnosis: ${patient.diagnosis}
- Key Hidden Truths & Red Flags: ${JSON.stringify(patient.hiddenClinicalTruth || {})}
- Correct Approach: ${patient.expectedActions || 'Thorough assessment and safe evidence-based care'}

STUDENT QUESTIONS ASKED (${chatHistory?.length || 0} messages):
${chatHistory?.map((m: any, i: number) => `${i + 1}. [${m.sender}]: ${m.text}`).join('\n') || 'No questions asked.'}

STUDENT'S CLINICAL DECISIONS & INPUTS:
${JSON.stringify(studentDecisions, null, 2)}

Provide your detailed educational evaluation in pure JSON format:`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Evaluation timed out')), 4000)
      );

      const response: any = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        }),
        timeoutPromise,
      ]);

      const responseText = response.text?.trim() || '{}';
      try {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch (parseError) {
        console.error('Failed to parse AI feedback JSON:', parseError, responseText);
      }
    }

    // Fallback rule-based evaluation engine
    const evaluation = generateFallbackEvaluation(patient, department, chatHistory, studentDecisions);
    return res.json(evaluation);
  } catch (err: any) {
    console.error('Error in /api/patient/evaluate:', err?.message || err);
    const evaluation = generateFallbackEvaluation(req.body?.patient, req.body?.department, req.body?.chatHistory, req.body?.studentDecisions);
    return res.json(evaluation);
  }
});

/**
 * Dynamic Case Generator Endpoint
 * Creates a unique realistic patient scenario for university students
 */
app.post('/api/patient/generate', async (req: Request, res: Response) => {
  try {
    const { department, difficulty, topic } = req.body;

    if (ai) {
      const prompt = `Generate a realistic clinical simulation case for a university healthcare student.
Department: ${department || 'Medicine'} (Medicine, Pharmacy, or Nursing)
Difficulty: ${difficulty || 'Intermediate'}
Topic/Specialty: ${topic || 'General Acute Care'}

Return a single JSON object with this exact structure:
{
  "id": "gen-${Date.now()}",
  "name": "Full patient name",
  "age": 45,
  "gender": "Female" or "Male",
  "occupation": "Occupation",
  "department": "${department || 'medicine'}",
  "difficulty": "${difficulty || 'intermediate'}",
  "chiefComplaint": "Short 1-sentence complaint in patient words",
  "triageAcuity": 2 or 3,
  "triageNote": "Brief nursing triage observation",
  "diagnosis": "True underlying medical condition",
  "vitals": {
    "heartRate": 88,
    "bloodPressure": "135/85",
    "respiratoryRate": 18,
    "temperature": 37.1,
    "oxygenSaturation": 98
  },
  "demeanor": "Anxious but polite",
  "hiddenClinicalTruth": {
    "painOnset": "Started 3 days ago",
    "triggers": "Worse after greasy meals or exertion",
    "lifestyle": "Non-smoker, occasional glass of wine",
    "keySecret": "Crucial symptom or fact revealed only if directly asked"
  },
  "medications": [
    { "name": "Medication 1", "dose": "20mg daily", "indication": "Hypertension" }
  ],
  "allergies": ["Penicillin (Hives)"],
  "socialHistory": { "smoking": "No", "alcohol": "Social", "living": "With partner" },
  "departmentSpecifics": {
    "promptQuestion": "Department specific question for student",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptionIndex": 0,
    "redFlags": ["Red flag symptom to monitor"]
  },
  "learningObjectives": ["Objective 1", "Objective 2"]
}`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Generation timed out')), 4000)
      );

      const response: any = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        }),
        timeoutPromise,
      ]);

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json(parsed);
    }

    const fallbackCase = generateFallbackCase(department, difficulty, topic);
    return res.json(fallbackCase);
  } catch (err: any) {
    console.error('Error generating case, using fallback:', err?.message || err);
    const fallbackCase = generateFallbackCase(req.body?.department, req.body?.difficulty, req.body?.topic);
    return res.json(fallbackCase);
  }
});

function generateFallbackCase(department: string = 'medicine', difficulty: string = 'intermediate', topic: string = 'General Acute Care') {
  const isFemale = Math.random() > 0.5;
  const firstNames = isFemale ? ['Clara', 'Beatrice', 'Hannah', 'Amira', 'Vivian', 'Zoe'] : ['Julian', 'Robert', 'Kenji', 'Darius', 'Lucas', 'Felix'];
  const lastNames = ['Sterling', 'Kim', 'Patel', 'Novak', 'Moreno', 'Hawkins', 'Adeyemi'];
  const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  const age = Math.floor(Math.random() * 35) + 45; // 45-80

  return {
    id: `gen-${Date.now()}`,
    name,
    age,
    gender: isFemale ? 'Female' : 'Male',
    occupation: 'Retired Transit Worker (Disability Pension)',
    department: department || 'medicine',
    difficulty: difficulty || 'intermediate',
    chiefComplaint: `I've been feeling increasing fatigue, dizzy spells, and shortness of breath related to ${topic || 'my chronic conditions'}.`,
    triageAcuity: difficulty === 'advanced' ? 2 : 3,
    triageNotes: `Patient presents for acute clinical evaluation. Multiple comorbidities noted: hypertension, diabetes, and active tobacco use.`,
    diagnosis: `Acute Exacerbation of ${topic || 'Cardiopulmonary Disease'} in Patient with Multiple Comorbidities & Transportation Barriers`,
    vitals: {
      heartRate: difficulty === 'advanced' ? 112 : 88,
      bloodPressure: difficulty === 'advanced' ? '172/98' : '142/88',
      respiratoryRate: difficulty === 'advanced' ? 24 : 18,
      temperature: 37.2,
      oxygenSaturation: difficulty === 'advanced' ? 92 : 96,
      ecgRhythm: 'Sinus Tachycardia with LVH',
      bloodGlucose: 174,
    },
    comorbidities: [
      'Essential Hypertension (14 years, poorly controlled)',
      'Type 2 Diabetes Mellitus with mild neuropathy (9 years)',
      'Chronic Tobacco Use Disorder (25 pack-years, active smoker)',
      'Stage 3a Chronic Kidney Disease (eGFR 54 mL/min)',
    ],
    pastMedicalHistory: [
      'Hypertension diagnosed 2012',
      'Type 2 Diabetes diagnosed 2017, last HbA1c 8.4%',
      'Mild osteoarthritis of knees',
    ],
    allergies: [
      'Lisinopril / ACE Inhibitors (Angioedema - lip swelling)',
      'Penicillin (Urticarial rash)',
    ],
    socialHistory: {
      smoking: 'Active smoker, 1 pack per day for 25 years',
      alcohol: 'Social beer occasionally',
      livingSituation: 'Lives alone in a rural rental cottage',
    },
    socialDeterminants: {
      transportation: {
        barrierPresent: true,
        details: 'Does not own an operational vehicle. Nearest public bus stop is 1.2 miles away on a rural highway without sidewalks. Has missed multiple outpatient appointments due to lack of a ride.',
        impactOnCare: 'Causes medication refill lapses and delayed follow-up visits.',
      },
      financial: {
        barrierPresent: true,
        details: 'Fixed monthly disability income; struggles with prescription co-pays when multiple medications are filled at once.',
        medicationCostStrain: true,
      },
      foodAccess: {
        foodInsecurity: true,
        details: 'Lives in a food desert; relies on processed canned goods and high-sodium convenience foods.',
      },
      housing: {
        housingStatus: 'Single-story rental with gravel entryway and uneven steps.',
      },
      supportSystem: {
        liveAlone: true,
        details: 'Adult children live out of state; limited local social network.',
      },
      healthLiteracy: {
        level: 'Moderate',
        details: 'Can follow clear oral and large-print instructions; overwhelmed by confusing polypharmacy regimens.',
      },
    },
    demeanor: 'Polite, slightly apologetic about missed appointments, eager for understandable guidance.',
    hiddenClinicalTruth: {
      painOnset: 'Started roughly 48 to 72 hours ago and escalated after running out of pills.',
      painDetails: 'A persistent tightness, heavy feeling, and shortness of breath when walking across the room.',
      triggers: 'Exertion and high-salt meals worsen symptoms significantly.',
      secretHistory: 'I ran out of my blood pressure medication 5 days ago because I could not get a ride to the pharmacy.',
      sdohSecret: 'I really need mail delivery for my prescriptions or rideshare help, otherwise I will keep missing clinic visits.',
    },
    medications: [
      { name: 'Amlodipine', dose: '10 mg', route: 'Oral', frequency: 'Daily in morning', indication: 'Hypertension', isPrescribedCurrent: true },
      { name: 'Metformin', dose: '850 mg', route: 'Oral', frequency: 'Twice daily with meals', indication: 'Type 2 Diabetes', isPrescribedCurrent: true },
      { name: 'Atorvastatin', dose: '20 mg', route: 'Oral', frequency: 'Nightly', indication: 'Hyperlipidemia', isPrescribedCurrent: true },
    ],
    orderableLabs: [
      { id: `cbc-${Date.now()}`, name: 'Complete Blood Count (CBC)', category: 'hematology', normalRange: 'Normal', result: 'WBC 9.8 x10^9/L, Hb 138 g/L, Plt 230 x10^9/L', isAbnormal: false },
      { id: `bmp-${Date.now()}`, name: 'Basic Metabolic Panel', category: 'chemistry', normalRange: 'Normal', result: 'Sodium 136, Potassium 4.4, Creatinine 112 umol/L (eGFR 56)', isAbnormal: true },
      { id: `hba1c-${Date.now()}`, name: 'Glycated Hemoglobin (HbA1c)', category: 'chemistry', normalRange: '< 53 mmol/mol', result: '68 mmol/mol (8.4%)', isAbnormal: true },
      { id: `ecg-${Date.now()}`, name: '12-Lead Electrocardiogram', category: 'cardiac', normalRange: 'Normal Sinus Rhythm', result: 'Sinus rhythm with LVH voltage criteria', isAbnormal: true },
    ],
    learningObjectives: [
      'Incorporate multiple chronic comorbidities (hypertension, diabetes, smoking) into the clinical decision plan.',
      'Identify and address Social Determinants of Health, specifically transportation barriers and prescription co-pay burdens.',
      'Strictly avoid contraindicated drug classes (avoiding ACE inhibitors due to documented angioedema).',
    ],
    emergencyWarning: difficulty === 'advanced' ? 'HIGH-ACUITY CASE: Monitor hemodynamic vitals closely and prepare for prompt senior escalation.' : undefined,
  };
}

// Helper for simulated conversational replies when offline
function generateFallbackPatientReply(patient: any, message: string): string {
  const text = (message || '').toLowerCase();
  const name = patient?.name || 'the patient';

  if (text.includes('hello') || text.includes('hi') || text.includes('morning') || text.includes('afternoon') || text.includes('introduce')) {
    return `Hello... thank you for seeing me. I've been feeling quite unwell and I was really hoping someone could help me understand what's going on.`;
  }

  // Social Determinants of Health: Transportation & Appointment Access
  if (text.includes('transport') || text.includes('ride') || text.includes('car') || text.includes('bus') || text.includes('drive') || text.includes('get to the clinic') || text.includes('appointment') || text.includes('travel') || text.includes('follow-up') || text.includes('missed')) {
    if (patient?.socialDeterminants?.transportation?.details) {
      return patient.socialDeterminants.transportation.details;
    }
    return `Transportation is really tough for me. I don't drive anymore, and finding a ride or bus that can take me to clinic checkups is very hard. That's honestly why I have missed appointments in the past.`;
  }

  // Social Determinants: Financial, Medication Costs, Co-pays, Insurance
  if (text.includes('afford') || text.includes('cost') || text.includes('money') || text.includes('pay') || text.includes('pension') || text.includes('disability') || text.includes('copay') || text.includes('insurance') || text.includes('expensive')) {
    if (patient?.socialDeterminants?.financial?.details) {
      return patient.socialDeterminants.financial.details;
    }
    return `I am on a fixed monthly income. Between utility bills and prescription co-pays, money gets very tight toward the end of each month.`;
  }

  // Social Determinants: Food Access, Diet, Nutrition, Sodium
  if (text.includes('food') || text.includes('eat') || text.includes('grocery') || text.includes('diet') || text.includes('nutrition') || text.includes('salt') || text.includes('sodium') || text.includes('canned')) {
    if (patient?.socialDeterminants?.foodAccess?.details) {
      return patient.socialDeterminants.foodAccess.details;
    }
    return `There isn't a fresh grocery store near my home, so I end up eating mostly canned soups, boxed dinners, or whatever is affordable at the corner market.`;
  }

  // Comorbidities: Diabetes, Blood Sugar, Neuropathy
  if (text.includes('diabetes') || text.includes('sugar') || text.includes('glucose') || text.includes('neuropathy') || text.includes('tingling') || text.includes('feet')) {
    const hasT2D = patient?.comorbidities?.some((c: string) => /diabetes/i.test(c)) || patient?.pastMedicalHistory?.some((c: string) => /diabetes/i.test(c));
    if (hasT2D) {
      return `Yes, I have had Type 2 Diabetes for about 10 years now. My blood sugar has been running high lately (around 180 to 200), and I get some numbness and tingling in the tips of my toes.`;
    }
    return `As far as I know, I do not have diabetes, though my doctor checked my blood sugar once last year.`;
  }

  // Comorbidities: Hypertension, High Blood Pressure
  if (text.includes('hypertension') || text.includes('blood pressure') || text.includes('bp')) {
    const hasHTN = patient?.comorbidities?.some((c: string) => /hypertension/i.test(c)) || patient?.pastMedicalHistory?.some((c: string) => /hypertension/i.test(c));
    if (hasHTN) {
      return `I have suffered from high blood pressure for many years. It has always been tough to keep under control, especially when I get stressed out or run out of medication.`;
    }
    return `My blood pressure has generally been normal in the past.`;
  }

  // Substance Use: Smoking, Tobacco, Cigarettes
  if (text.includes('smoke') || text.includes('smoking') || text.includes('tobacco') || text.includes('cigarette') || text.includes('pack') || text.includes('vape')) {
    if (patient?.socialHistory?.smoking) {
      return `I smoke cigarettes: ${patient.socialHistory.smoking}. I know it is bad for my heart and breathing, but when I am stressed alone at home, having a cigarette calms my nerves. I would like help quitting if there's a patch or gum.`;
    }
    return `I don't smoke cigarettes, though I used to years ago.`;
  }

  // Housing & Living Environment
  if (text.includes('housing') || text.includes('stairs') || text.includes('live alone') || text.includes('home') || text.includes('fall') || text.includes('family')) {
    if (patient?.socialDeterminants?.housing?.housingStatus) {
      return `${patient.socialDeterminants.housing.housingStatus} ${patient.socialDeterminants.supportSystem?.details ? `Family support: ${patient.socialDeterminants.supportSystem.details}` : ''}`;
    }
    return `I live on my own. It can get lonely, and moving around when I feel dizzy or short of breath makes me nervous about falling.`;
  }

  if (text.includes('when') || text.includes('start') || text.includes('long') || text.includes('duration') || text.includes('onset') || text.includes('timeline')) {
    return patient?.hiddenClinicalTruth?.painOnset || `It first started about 2 or 3 days ago, but over the last several hours it has gotten noticeably worse.`;
  }
  if (text.includes('radiat') || text.includes('spread') || text.includes('arm') || text.includes('jaw') || text.includes('neck') || text.includes('back')) {
    if (patient?.hiddenClinicalTruth?.painDetails && /radiat|spread|jaw|arm|back/i.test(patient.hiddenClinicalTruth.painDetails)) {
      return patient.hiddenClinicalTruth.painDetails;
    }
    return `Yes, the discomfort doesn't just stay in one spot—it spreads upwards and across, making it very uncomfortable.`;
  }
  if (text.includes('better') || text.includes('worse') || text.includes('relieve') || text.includes('aggravate') || text.includes('trigger') || text.includes('movement') || text.includes('breath')) {
    return patient?.hiddenClinicalTruth?.triggers || `Resting sitting up helps a little bit. If I try to bend over or move briskly, the discomfort flares right back up.`;
  }
  if (text.includes('medication') || text.includes('drug') || text.includes('taking') || text.includes('pill') || text.includes('prescription') || text.includes('supplement') || text.includes('otc') || text.includes('water pill')) {
    if (patient?.currentMedications && patient.currentMedications.length > 0) {
      const medList = patient.currentMedications.map((m: any) => `${m.name} (${m.dose})`).join(', ');
      return `At home I am prescribed: ${medList}. But as I mentioned, getting refills has been really hard recently without a car.`;
    }
    return `I don't take many regular prescription pills, just some daily vitamins and occasionally aspirin or antacids when my stomach acts up.`;
  }
  if (text.includes('allergy') || text.includes('allergic') || text.includes('reaction')) {
    if (patient?.allergies && patient.allergies.length > 0) {
      return `Yes, I am definitely allergic to: ${patient.allergies.join('; ')}. Please make sure nobody gives me those, especially ACE inhibitors like Lisinopril which made my lips and tongue swell up!`;
    }
    return `As far as I know, I don't have any drug allergies.`;
  }
  if (text.includes('breath') || text.includes('breathing') || text.includes('short of breath') || text.includes('cough') || text.includes('wheez') || text.includes('flat')) {
    return `Yes, whenever I try to lie flat, I feel like I am drowning or suffocating. I have to prop myself up with three pillows to breathe.`;
  }
  if (text.includes('pain') || text.includes('hurt') || text.includes('feel') || text.includes('ache') || text.includes('describe') || text.includes('pressure') || text.includes('sharp') || text.includes('swell')) {
    if (patient?.hiddenClinicalTruth?.painDetails) {
      return patient.hiddenClinicalTruth.painDetails;
    }
    return `It feels like a ${patient?.chiefComplaint || 'deep ache'}. It is quite bothersome, especially when I try to move around.`;
  }
  return `Well, ${patient?.chiefComplaint || 'it is quite uncomfortable'}. I was hoping you could tell me what you think might be causing this, and how we can work around my transportation and medication troubles?`;
}

// Helper for realistic fallback evaluation
function generateFallbackEvaluation(patient: any, department: string, chatHistory: any[], studentDecisions: any) {
  const questionCount = chatHistory ? chatHistory.filter((m: any) => m.sender === 'student').length : 0;
  const askedMeds = chatHistory?.some((m: any) => /medication|drug|pill|prescription/i.test(m.text));
  const askedAllergies = chatHistory?.some((m: any) => /allergy|allergic/i.test(m.text));
  const askedOnset = chatHistory?.some((m: any) => /onset|start|when|how long/i.test(m.text));
  const askedPain = chatHistory?.some((m: any) => /pain|sharp|dull|radiat|severe/i.test(m.text));
  const askedTransport = chatHistory?.some((m: any) => /transport|ride|bus|car|drive|appointment|follow-up|get to the clinic|travel/i.test(m.text));
  const askedSDOH = chatHistory?.some((m: any) => /afford|cost|copay|money|financial|food|grocery|salt|housing|stairs|alone|smoke|smoking/i.test(m.text));
  const askedComorbidities = chatHistory?.some((m: any) => /diabetes|hypertension|blood pressure|kidney|heart failure|history|chronic/i.test(m.text));

  let commScore = 65;
  if (questionCount >= 5) commScore += 10;
  if (askedOnset) commScore += 5;
  if (askedPain) commScore += 5;
  if (askedComorbidities) commScore += 8;
  if (askedTransport || askedSDOH) commScore += 7;
  commScore = Math.min(commScore, 98);

  let safetyScore = 65;
  if (askedAllergies) safetyScore += 15;
  if (askedMeds) safetyScore += 10;
  if (studentDecisions?.sdohBarriersAddressed?.length > 0 || askedTransport) safetyScore += 10;
  safetyScore = Math.min(safetyScore, 100);

  let clinScore = 75;
  if (studentDecisions && Object.keys(studentDecisions).length > 0) {
    clinScore = 85;
    if (studentDecisions.sdohInterventionNotes || studentDecisions.sdohBarriersAddressed?.length > 0) {
      clinScore += 5;
    }
  }

  const overallScore = Math.round((commScore * 0.3) + (clinScore * 0.4) + (safetyScore * 0.3));

  const missed: string[] = [];
  if (!askedAllergies) missed.push('Did not verify patient drug allergies before treatment planning.');
  if (!askedMeds) missed.push('Did not complete full medication reconciliation (current prescribed and OTC medications).');
  if (!askedTransport && patient?.socialDeterminants?.transportation?.barrierPresent) {
    missed.push('Critical SDOH Gap: Did not investigate transportation barriers that caused the patient to miss clinic appointments and run out of essential medications.');
  }
  if (!askedSDOH && patient?.socialDeterminants?.financial?.medicationCostStrain) {
    missed.push('Missed exploring medication co-pay affordability and food access limitations impacting chronic disease control.');
  }
  if (!askedComorbidities) {
    missed.push('Incomplete review of multiple chronic comorbidities (hypertension, diabetes, smoking history).');
  }

  const strengths: string[] = [];
  strengths.push('Maintained a polite, empathetic bedside communication tone with the patient.');
  if (questionCount >= 4) strengths.push('Demonstrated proactive inquiry into patient history and symptoms.');
  if (askedPain) strengths.push('Identified symptom characteristics and impact on the patient.');
  if (askedTransport) strengths.push('Recognized Social Determinants of Health: Identified transportation barriers as a root cause of medication non-adherence.');
  if (askedComorbidities) strengths.push('Assessed multiple underlying comorbidities (hypertension, diabetes, and smoking status).');

  return {
    overallScore,
    performanceTier: overallScore >= 85 ? 'Mastery / Honors' : overallScore >= 75 ? 'Proficient' : 'Developing',
    categoryScores: {
      communication: commScore,
      clinicalReasoning: clinScore,
      patientSafety: safetyScore,
    },
    strengths,
    missedAreas: missed.length > 0 ? missed : ['Review subtle psychosocial factors that might affect long-term treatment adherence.'],
    clinicalRationale: `In this ${department} scenario with ${patient.name}, the underlying clinical presentation is ${patient.diagnosis}. Complex patients with multiple comorbidities (hypertension, diabetes, smoking) and Social Determinants of Health barriers (lack of transportation, fixed income) require holistic care plans that address both acute medical stabilization and socioeconomic barriers to follow-up.`,
    correctClinicalPath: `1. Systematic history taking exploring OPQRST, multiple comorbidities, and Social Determinants of Health (transportation, financial, smoking).\n2. Targeted physical examination and vitals review.\n3. Safe clinical intervention respecting documented allergies (e.g. avoiding ACE inhibitors in angioedema).\n4. Multidisciplinary discharge plan: connecting hospital social work, 90-day mail-order refills, paratransit vouchers, and smoking cessation support.`,
    keyLearningPoints: [
      'Social Determinants of Health (transportation, financial, housing) are primary drivers of clinical decompensations and medication non-adherence.',
      'Always distinguish between voluntary non-compliance vs systemic barriers (inability to travel, unaffordable co-pays).',
      'Patients with multiple comorbidities require coordinated multi-organ risk assessment and safe prescribing (e.g. avoiding ACEi with angioedema, renal dosing in CKD).',
      'Effective clinical management includes linking patients with community resources (mail-order pharmacies, paratransit, social work).',
    ],
    emergencySupervisionAlert: patient.difficulty === 'advanced' || patient.triageAcuity <= 2
      ? 'PATIENT SAFETY ALERT: High-acuity presentation requiring immediate attending physician notification and active hemodynamic monitoring.'
      : null,
  };
}

async function startServer() {
  const httpServer = http.createServer(app);

  // In development, hook Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist files
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Clinical Simulation Server] running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
