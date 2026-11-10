import React, { useState } from 'react';
import { PatientCase, StudentDecisions } from '../../types/clinical';
import { 
  HeartPulse, 
  ClipboardList, 
  CheckCircle2, 
  HelpCircle, 
  PhoneForwarded, 
  ShieldCheck, 
  Sparkles,
  AlertTriangle,
  Layers
} from 'lucide-react';

interface NursingWorkspaceProps {
  patient: PatientCase;
  onSubmitDecision: (decisions: StudentDecisions) => void;
  isEvaluating: boolean;
}

export const NursingWorkspace: React.FC<NursingWorkspaceProps> = ({
  patient,
  onSubmitDecision,
  isEvaluating,
}) => {
  const nursingDetails = patient.nursingDetails;

  const [selectedNursingDiag, setSelectedNursingDiag] = useState<string>('');
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [sbar, setSbar] = useState({
    situation: '',
    background: '',
    assessment: '',
    recommendation: '',
  });

  const toggleIntervention = (id: string) => {
    setSelectedInterventions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplySbarTemplate = () => {
    if (nursingDetails?.suggestedSbar) {
      setSbar({ ...nursingDetails.suggestedSbar });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNursingDiag) {
      setValidationError('Please select your priority nursing diagnosis before submitting.');
      return;
    }
    setValidationError(null);

    onSubmitDecision({
      selectedNursingDiagnosis: selectedNursingDiag,
      selectedInterventions,
      studentSbar: sbar,
      clinicalNotes: `Nursing SBAR:\nS: ${sbar.situation}\nB: ${sbar.background}\nA: ${sbar.assessment}\nR: ${sbar.recommendation}`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Banner */}
      <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-indigo-950">
            Nursing Learning Department: Patient Assessment, Care Planning & SBAR
          </h3>
          <p className="text-xs text-indigo-800 mt-0.5">
            Formulate priority NANDA-I nursing diagnoses, select evidence-based nursing care interventions, and construct a structured interprofessional SBAR handover communication.
          </p>
        </div>
      </div>

      {/* Bedside Risk & Acuity Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-indigo-100 shadow-xs text-xs">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px]">Morse Fall Risk Score:</span>
            <span className="font-bold text-slate-900 text-sm">
              {nursingDetails?.fallRiskScore || 50} / 125
            </span>
            <span className="text-[10px] text-amber-700 font-semibold block">High Fall Precautions</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <ClipboardList className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px]">Braden Pressure Injury:</span>
            <span className="font-bold text-slate-900 text-sm">
              {nursingDetails?.pressureUlcerRisk || 'Moderate'} Risk
            </span>
            <span className="text-[10px] text-slate-600 block">Q2H Repositioning Protocol</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px]">Bedside Telemetry Status:</span>
            <span className="font-bold text-slate-900 text-sm">
              {patient.vitals.respiratoryRate > 20 || patient.vitals.oxygenSaturation < 92 ? 'Compromised' : 'Stable'}
            </span>
            <span className="text-[10px] text-indigo-700 font-semibold block">Continuous Pulse Oximetry</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Priority Nursing Diagnosis */}
        <div className="bg-white rounded-xl border border-sky-100 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Priority Nursing Diagnosis (NANDA-I Format)
            </h4>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Select the most critical, life-impacting nursing diagnosis requiring immediate nursing action:
          </p>

          <div className="space-y-2.5">
            {nursingDetails?.priorityNursingDiagnoses.map((diag, idx) => {
              const isSelected = selectedNursingDiag === diag;
              return (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 font-semibold'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 text-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="nursingDiag"
                    value={diag}
                    checked={isSelected}
                    onChange={() => setSelectedNursingDiag(diag)}
                    className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs leading-relaxed">{diag}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Step 2: Nursing Care Interventions */}
        <div className="bg-white rounded-xl border border-sky-100 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Evidence-Based Nursing Interventions
            </h4>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Select all priority nursing actions to stabilize and care for {patient.name}:
          </p>

          <div className="space-y-2.5">
            {nursingDetails?.careInterventions.map((ci) => {
              const isChecked = selectedInterventions.includes(ci.id);
              return (
                <label
                  key={ci.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-indigo-50/70 border-indigo-400 text-indigo-950 font-medium'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleIntervention(ci.id)}
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="block font-medium">{ci.label}</span>
                    <span className="text-[10px] text-slate-500 italic mt-0.5 block">
                      Rationale: {ci.rationale}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 3: Interactive SBAR Handover Builder */}
      <div className="bg-white rounded-xl border border-sky-100 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <PhoneForwarded className="w-4 h-4 text-indigo-600" />
              SBAR Clinical Handover to Interprofessional Team
            </h4>
          </div>
          <button
            type="button"
            onClick={handleApplySbarTemplate}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer underline decoration-dotted"
          >
            Insert Clinical SBAR Example Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              [S] Situation (Who is calling, about whom, and what is the acute problem?):
            </label>
            <textarea
              rows={2}
              value={sbar.situation}
              onChange={(e) => setSbar({ ...sbar, situation: e.target.value })}
              placeholder="E.g., Calling regarding James Walker in Bed 12 who is acutely desaturating to 89% on room air..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              [B] Background (Clinical context, surgical history, past relevant conditions):
            </label>
            <textarea
              rows={2}
              value={sbar.background}
              onChange={(e) => setSbar({ ...sbar, background: e.target.value })}
              placeholder="E.g., Post-Op Day 2 post-laparoscopic colectomy. Severe surgical pain splinting..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              [A] Assessment (Current vitals, physical findings, clinical impression):
            </label>
            <textarea
              rows={2}
              value={sbar.assessment}
              onChange={(e) => setSbar({ ...sbar, assessment: e.target.value })}
              placeholder="E.g., Bibasilar crackles, RR 26, pain 8/10. Consistent with acute basal atelectasis..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              [R] Recommendation (What specific order, intervention, or physician review do you need?):
            </label>
            <textarea
              rows={2}
              value={sbar.recommendation}
              onChange={(e) => setSbar({ ...sbar, recommendation: e.target.value })}
              placeholder="E.g., Elevated HOB to High Fowler, 2L O2 applied. Request order to optimize analgesia and bedside review..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>
        </div>
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
        <div className="flex items-center gap-2 text-xs text-indigo-200">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Evaluation covers: Nursing assessment accuracy, care prioritization, and SBAR communication.</span>
        </div>

        <button
          type="submit"
          disabled={isEvaluating}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-lg text-xs sm:text-sm transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
        >
          {isEvaluating ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Nursing Care Plan...</span>
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
