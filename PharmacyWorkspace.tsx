import React, { useState } from 'react';
import { PatientCase, StudentDecisions } from '../../types/clinical';
import { 
  Pill, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  AlertOctagon, 
  Sparkles,
  PhoneCall,
  CheckSquare,
  XCircle
} from 'lucide-react';

interface PharmacyWorkspaceProps {
  patient: PatientCase;
  onSubmitDecision: (decisions: StudentDecisions) => void;
  isEvaluating: boolean;
}

export const PharmacyWorkspace: React.FC<PharmacyWorkspaceProps> = ({
  patient,
  onSubmitDecision,
  isEvaluating,
}) => {
  const pharmacyDetails = patient.pharmacyDetails;

  const [pharmacyAction, setPharmacyAction] = useState<'dispense_as_is' | 'contact_prescriber' | 'refuse_and_escalate'>('contact_prescriber');
  const [selectedCounselling, setSelectedCounselling] = useState<string[]>([]);
  const [pharmacistNotes, setPharmacistNotes] = useState<string>('');

  const toggleCounselling = (id: string) => {
    setSelectedCounselling((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitDecision({
      pharmacyAction,
      counsellingSelected: selectedCounselling,
      clinicalNotes: pharmacistNotes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Banner */}
      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-950">
            Pharmacy Learning Department: Prescription Screening & Drug Safety
          </h3>
          <p className="text-xs text-emerald-800 mt-0.5">
            Screen incoming medication orders against patient allergies, organ function, and concurrent drug regimens. Formulate clinical interventions and deliver structured patient counselling.
          </p>
        </div>
      </div>

      {/* Incoming Prescription Review Card */}
      {pharmacyDetails?.newPrescription && (
        <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide">
                New Order Received
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Official Prescription for Screening
              </h4>
            </div>
            <span className="text-xs text-slate-500">
              Prescriber: <strong>{pharmacyDetails.newPrescription.prescriber}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Medication Name:</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {pharmacyDetails.newPrescription.drug}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Dose & Frequency:</span>
              <span className="font-bold text-slate-800">
                {pharmacyDetails.newPrescription.dose} • {pharmacyDetails.newPrescription.frequency}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Route:</span>
              <span className="font-bold text-slate-800">
                {pharmacyDetails.newPrescription.route}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Documented Indication:</span>
              <span className="font-bold text-slate-800">
                {pharmacyDetails.newPrescription.indication}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Pharmacist Clinical Action */}
        <div className="bg-white rounded-xl border border-sky-100 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Pharmacist Clinical Dispensing Decision
            </h4>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Select your clinical dispensing determination after screening for drug interactions, allergies, and contraindications:
          </p>

          <div className="space-y-3">
            <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              pharmacyAction === 'contact_prescriber'
                ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 font-semibold'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 text-slate-800'
            }`}>
              <input
                type="radio"
                name="pharmAction"
                value="contact_prescriber"
                checked={pharmacyAction === 'contact_prescriber'}
                onChange={() => setPharmacyAction('contact_prescriber')}
                className="mt-1 w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold block flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                  Contact Prescriber for Modification / Alternative (Recommended for High Safety Risk)
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Hold dispensing temporarily, notify doctor of critical interaction or lab contraindication, and suggest safer drug option.
                </span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              pharmacyAction === 'dispense_as_is'
                ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-semibold'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 text-slate-800'
            }`}>
              <input
                type="radio"
                name="pharmAction"
                value="dispense_as_is"
                checked={pharmacyAction === 'dispense_as_is'}
                onChange={() => setPharmacyAction('dispense_as_is')}
                className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold block flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Dispense As Prescribed (Safe with Standard Counselling)
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Order is clinically appropriate. Proceed to dispense with complete patient education on administration technique and adherence.
                </span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              pharmacyAction === 'refuse_and_escalate'
                ? 'bg-red-50/80 border-red-500 ring-2 ring-red-500/20 text-red-950 font-semibold'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 text-slate-800'
            }`}>
              <input
                type="radio"
                name="pharmAction"
                value="refuse_and_escalate"
                checked={pharmacyAction === 'refuse_and_escalate'}
                onChange={() => setPharmacyAction('refuse_and_escalate')}
                className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold block flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  Refuse Dispensing & Trigger Clinical Escalation
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Imminent life-threatening toxicity or clear contraindication requiring immediate specialist intervention.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Step 2: Patient Counselling Checklist */}
        <div className="bg-white rounded-xl border border-sky-100 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Patient Counselling & Education Points
            </h4>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Select the essential counselling topics you must deliver to {patient.name}:
          </p>

          <div className="space-y-2.5">
            {pharmacyDetails?.counsellingChecklist.map((c) => {
              const isChecked = selectedCounselling.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 font-medium'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCounselling(c.id)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs leading-relaxed">{c.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 3: Clinical Pharmacist Documentation Note */}
      <div className="bg-white rounded-xl border border-sky-100 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            3
          </span>
          <h4 className="text-sm font-bold text-slate-900">
            Pharmacist Clinical Intervention & SBAR Note
          </h4>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Document your pharmacist note to the prescriber: describe identified drug interactions/contraindications, cite laboratory values (e.g. INR, eGFR, Potassium), and propose a safe evidence-based therapeutic alternative.
        </p>

        <textarea
          rows={4}
          value={pharmacistNotes}
          onChange={(e) => setPharmacistNotes(e.target.value)}
          placeholder="E.g., Contacted Dr. Vance regarding Clarithromycin order. Patient Arthur is on chronic Warfarin 5mg daily with current INR of 4.6 and spontaneous epistaxis. Clarithromycin is a potent CYP3A4/P-gp inhibitor that will further increase INR to dangerous levels. Recommended substituting with Doxycycline 100mg BID and urgent INR monitoring..."
          className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
        />
      </div>

      {/* Action Submission */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-xl">
        <div className="flex items-center gap-2 text-xs text-emerald-200">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <span>Evaluation covers: Drug interaction screening, patient safety rationale, and counselling accuracy.</span>
        </div>

        <button
          type="submit"
          disabled={isEvaluating}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-lg text-xs sm:text-sm transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
        >
          {isEvaluating ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Medication Safety...</span>
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
