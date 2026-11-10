import React, { useState } from 'react';
import { PatientCase, StudentDecisions } from '../../types/clinical';
import { 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  Send, 
  Sparkles,
  BookOpen,
  Car,
  DollarSign,
  HeartCrack,
  Users
} from 'lucide-react';

interface MedicineWorkspaceProps {
  patient: PatientCase;
  onSubmitDecision: (decisions: StudentDecisions) => void;
  isEvaluating: boolean;
}

export const MedicineWorkspace: React.FC<MedicineWorkspaceProps> = ({
  patient,
  onSubmitDecision,
  isEvaluating,
}) => {
  const medicineDetails = patient.medicineDetails;

  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('');
  const [checkedRedFlags, setCheckedRedFlags] = useState<string[]>([]);
  const [selectedSdohInterventions, setSelectedSdohInterventions] = useState<string[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleRedFlag = (id: string) => {
    setCheckedRedFlags((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSdoh = (id: string) => {
    setSelectedSdohInterventions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const sdohOptions = [
    { id: 'sdoh-transit', label: 'Consult Hospital Social Work for community paratransit ride services and clinic travel vouchers' },
    { id: 'sdoh-mail', label: 'Prescribe 90-day supply with home mail-order delivery to avoid pharmacy transportation lapses' },
    { id: 'sdoh-smoke', label: 'Offer structured Tobacco Cessation counseling and order nicotine replacement therapy (patch/gum)' },
    { id: 'sdoh-cost', label: 'Select low-cost generic formularies ($4 program) and link to prescription assistance' },
    { id: 'sdoh-food', label: 'Provide heart-healthy/diabetic dietary education and connect with local nutritious food pantry' },
    { id: 'sdoh-home', label: 'Order home occupational/physical therapy safety evaluation (stairs, grab bars, fall reduction)' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiagnosis) {
      setValidationError('Please select your primary working diagnosis before submitting.');
      return;
    }
    setValidationError(null);

    onSubmitDecision({
      selectedDiagnosis,
      identifiedRedFlags: checkedRedFlags,
      sdohBarriersAddressed: selectedSdohInterventions,
      clinicalNotes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Banner */}
      <div className="bg-sky-50 rounded-xl p-4 border border-sky-100 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-sky-950">
            Medicine Learning Department: Diagnostic Reasoning & Holistic Care Planning
          </h3>
          <p className="text-xs text-sky-800 mt-0.5">
            Synthesize medical history, multiple comorbidities, and Social Determinants of Health (transportation, financial, smoking) to formulate a safe evidence-based care plan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Formulate Working Diagnosis */}
        <div className="bg-white rounded-xl border border-sky-100 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Select Primary Working Diagnosis
            </h4>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Based on {patient.name}’s clinical presentation, multiple comorbidities, and test findings, which diagnosis is most probable?
          </p>

          <div className="space-y-2.5">
            {medicineDetails?.candidateDiagnoses.map((diag, idx) => {
              const isSelected = selectedDiagnosis === diag;
              return (
                <label
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20 text-sky-950 font-semibold'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 text-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="diagnosis"
                    value={diag}
                    checked={isSelected}
                    onChange={() => setSelectedDiagnosis(diag)}
                    className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs sm:text-sm">{diag}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Step 2: Red Flag Checklist */}
        <div className="bg-white rounded-xl border border-sky-100 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Red Flag Checklist & Risk Stratification
            </h4>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Select all clinical features that constitute immediate red flags requiring escalation or urgent intervention:
          </p>

          <div className="space-y-2.5">
            {medicineDetails?.redFlagsList.map((rf) => {
              const isChecked = checkedRedFlags.includes(rf.id);
              return (
                <label
                  key={rf.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-amber-50/70 border-amber-400 text-amber-950 font-medium'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleRedFlag(rf.id)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs sm:text-sm">{rf.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 3: Social Determinants of Health (SDOH) & Barrier Interventions */}
      <div className="bg-white rounded-xl border border-purple-200 p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h4 className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              Social Determinants of Health (SDOH) Action Plan
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Holistic Patient-Centered Care
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Select multidisciplinary interventions to address {patient.name}’s transportation barriers, medication affordability, comorbidities (diabetes, hypertension), and smoking habits:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {sdohOptions.map((opt) => {
            const isChecked = selectedSdohInterventions.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-purple-50/80 border-purple-400 text-purple-950 font-medium shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSdoh(opt.id)}
                  className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs leading-relaxed">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Step 4: Clinical Reasoning & Immediate Plan */}
      <div className="bg-white rounded-xl border border-sky-100 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
            4
          </span>
          <h4 className="text-sm font-bold text-slate-900">
            Clinical Reasoning & Management Pathway
          </h4>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Document your medical decision: justify your diagnosis, specify pharmacotherapy (accounting for documented allergies such as ACE inhibitor angioedema), and outline how you will follow up given their transportation constraints.
        </p>

        <textarea
          rows={4}
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
          placeholder="E.g., Patient presents with decompensated heart failure and hypertensive urgency triggered by medication gaps due to lack of transportation. Immediate inpatient management: IV loop diuretics, monitor telemetry, strict fluid balance. Critical safety check: Strictly avoid ACE inhibitors due to prior life-threatening angioedema; use ARBs or hydralazine/nitrates once stabilized. Discharge plan: Coordinate social work ride vouchers, set up 90-day mail delivery for prescriptions, and initiate smoking cessation counseling..."
          className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-sky-500 focus:bg-white transition-all text-slate-800"
        />
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Action Submission */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-xl">
        <div className="flex items-center gap-2 text-xs text-sky-200">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>Evaluation covers: Multimorbidity history, diagnostic accuracy, allergy safety, and SDOH barrier planning.</span>
        </div>

        <button
          type="submit"
          disabled={isEvaluating}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-lg text-xs sm:text-sm transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
        >
          {isEvaluating ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Clinical Decisions...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Submit for AI Clinical Evaluation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
