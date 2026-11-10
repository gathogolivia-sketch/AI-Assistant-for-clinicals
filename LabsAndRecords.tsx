import React from 'react';
import { PatientCase, LabTest } from '../types/clinical';
import { VitalsMonitor } from './VitalsMonitor';
import { 
  FlaskConical, 
  FileText, 
  Pill, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  Car,
  DollarSign,
  Utensils,
  Home,
  Users,
  BookOpen,
  AlertOctagon,
  ShieldAlert
} from 'lucide-react';

interface LabsAndRecordsProps {
  patient: PatientCase;
  onOrderLab: (labId: string) => void;
}

export const LabsAndRecords: React.FC<LabsAndRecordsProps> = ({
  patient,
  onOrderLab,
}) => {
  const revealedCount = patient.orderableLabs?.filter((l) => l.revealed).length || 0;
  const totalCount = patient.orderableLabs?.length || 0;
  const sdoh = patient.socialDeterminants;

  return (
    <div className="space-y-6">
      {/* Bedside Telemetry Monitor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>Bedside Physiologic Telemetry & Vital Signs</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Real-time Patient Monitoring</span>
        </div>
        <VitalsMonitor vitals={patient.vitals} acuity={patient.triageAcuity} />
      </div>

      {/* Social Determinants of Health (SDOH) & Comorbidities Clinical Summary */}
      <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Biopsychosocial Profile: Comorbidities & Social Determinants of Health (SDOH)
              </h3>
              <p className="text-xs text-slate-500">
                Evaluate chronic multimorbidity, systemic access barriers, and lifestyle risk factors
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            WHO & Healthy People 2030 SDOH Framework
          </span>
        </div>

        {/* Top: Comorbidities & Past Medical History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Comorbidities */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-sky-900">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              Documented Chronic Comorbidities
            </h4>
            <div className="space-y-1.5">
              {patient.comorbidities && patient.comorbidities.length > 0 ? (
                patient.comorbidities.map((cm, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
                    <span className="font-medium">{cm}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No major chronic comorbidities documented.</p>
              )}
            </div>
          </div>

          {/* Past Medical & Surgical History + Allergies */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-sky-900">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                Past Medical & Surgical History
              </h4>
              <ul className="text-xs text-slate-700 space-y-1">
                {patient.pastMedicalHistory?.map((pmh, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-slate-400">•</span>
                    <span>{pmh}</span>
                  </li>
                ))}
                {patient.pastSurgicalHistory?.map((psh, i) => (
                  <li key={`s-${i}`} className="flex items-center gap-1.5 text-slate-600">
                    <span className="text-slate-400">•</span>
                    <span>Surg: {psh}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Documented Allergies */}
            <div className="pt-2 border-t border-slate-200">
              <h5 className="text-[11px] font-bold text-red-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                Documented Allergies & Reactions:
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies?.map((allergy, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 font-medium">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 5 Pillars: SDOH Assessment Cards */}
        {sdoh && (
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-900">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Social Determinants of Health (SDOH) Screening Pillars
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Transportation Access */}
              <div className={`p-3 rounded-xl border transition-all ${
                sdoh.transportation?.barrierPresent
                  ? 'bg-purple-50/70 border-purple-300 text-purple-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Car className={`w-3.5 h-3.5 ${sdoh.transportation?.barrierPresent ? 'text-purple-600' : 'text-slate-400'}`} />
                    Transportation
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    sdoh.transportation?.barrierPresent ? 'bg-purple-200 text-purple-900 font-bold' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {sdoh.transportation?.barrierPresent ? 'BARRIER DETECTED' : 'ADEQUATE'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mt-1">
                  {sdoh.transportation?.details}
                </p>
                {sdoh.transportation?.impactOnCare && (
                  <p className="text-[10px] mt-1.5 font-semibold text-purple-800 bg-white/70 p-1.5 rounded border border-purple-200">
                    Clinical Impact: {sdoh.transportation.impactOnCare}
                  </p>
                )}
              </div>

              {/* 2. Financial & Medication Affordability */}
              <div className={`p-3 rounded-xl border transition-all ${
                sdoh.financial?.barrierPresent
                  ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className={`w-3.5 h-3.5 ${sdoh.financial?.barrierPresent ? 'text-amber-600' : 'text-slate-400'}`} />
                    Financial & Co-pays
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    sdoh.financial?.barrierPresent ? 'bg-amber-200 text-amber-900 font-bold' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {sdoh.financial?.barrierPresent ? 'CO-PAY STRAIN' : 'SECURE'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mt-1">
                  {sdoh.financial?.details}
                </p>
                {sdoh.financial?.medicationCostStrain && (
                  <p className="text-[10px] mt-1.5 font-semibold text-amber-800 bg-white/70 p-1.5 rounded border border-amber-200">
                    Risk: Medication non-adherence due to cost rationing.
                  </p>
                )}
              </div>

              {/* 3. Food Security & Nutrition */}
              <div className={`p-3 rounded-xl border transition-all ${
                sdoh.foodAccess?.foodInsecurity
                  ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Utensils className={`w-3.5 h-3.5 ${sdoh.foodAccess?.foodInsecurity ? 'text-rose-600' : 'text-slate-400'}`} />
                    Food Access
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    sdoh.foodAccess?.foodInsecurity ? 'bg-rose-200 text-rose-900 font-bold' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {sdoh.foodAccess?.foodInsecurity ? 'FOOD DESERT' : 'ADEQUATE'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mt-1">
                  {sdoh.foodAccess?.details || 'Regular dietary intake.'}
                </p>
              </div>

              {/* 4. Housing Environment & Support */}
              <div className="p-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-800">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-slate-500" />
                    Housing & Support
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-200 text-slate-600">
                    {sdoh.supportSystem?.liveAlone ? 'LIVES ALONE' : 'FAMILY SUPPORT'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mt-1">
                  {sdoh.housing?.housingStatus}
                </p>
                {sdoh.housing?.hazardAlert && (
                  <p className="text-[10px] mt-1.5 font-semibold text-red-700 bg-red-50 p-1.5 rounded border border-red-200">
                    Safety Hazard: {sdoh.housing.hazardAlert}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Triage Notes & Current Medications (MAR) */}
        <div className="space-y-6">
          {/* Triage Nursing Note */}
          <div className="bg-white rounded-xl border border-sky-100 p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-sky-900">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              Triage Initial Assessment
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans">
              <p className="font-semibold text-slate-900 mb-1">
                Emergency Severity Index: Acuity {patient.triageAcuity}
              </p>
              <p>{patient.triageNotes}</p>
            </div>

            {/* Social & Living History */}
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Living Situation:</span>
                <span className="font-medium text-slate-800">{patient.socialHistory.livingSituation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tobacco History:</span>
                <span className="font-medium text-slate-800">{patient.socialHistory.smoking}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Alcohol Consumption:</span>
                <span className="font-medium text-slate-800">{patient.socialHistory.alcohol}</span>
              </div>
            </div>
          </div>

          {/* Current Medication Administration Record (MAR) */}
          <div className="bg-white rounded-xl border border-sky-100 p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-sky-900">
              <Pill className="w-3.5 h-3.5 text-sky-600" />
              Active Medication Record (MAR)
            </h4>

            {patient.currentMedications && patient.currentMedications.length > 0 ? (
              <div className="space-y-2">
                {patient.currentMedications.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100/60 transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{med.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-medium">
                        {med.route}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span>Dose: <strong>{med.dose}</strong></span>
                      <span>•</span>
                      <span>Freq: <strong>{med.frequency}</strong></span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 italic">
                      Indication: {med.indication}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                No chronic home prescription medications recorded. Patient reports taking occasional over-the-counter remedies only.
              </p>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Orderable Diagnostic Labs & Investigations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-sky-100 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-sky-600" />
                <span>Diagnostic Testing & Laboratory Investigations</span>
              </h4>
              <p className="text-xs text-slate-500">
                Order clinically indicated tests to investigate differentials and verify multi-organ function (kidney, heart, metabolic)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                Tests Revealed: <strong>{revealedCount}</strong> / {totalCount}
              </span>
            </div>
          </div>

          {/* Labs List */}
          <div className="space-y-3">
            {patient.orderableLabs?.map((lab) => {
              return (
                <div
                  key={lab.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    lab.revealed
                      ? lab.isAbnormal
                        ? 'bg-red-50/40 border-red-200 shadow-2xs'
                        : 'bg-emerald-50/30 border-emerald-200 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        lab.revealed
                          ? lab.isAbnormal
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {lab.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 uppercase font-mono">
                            {lab.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Normal Reference: <span className="font-mono">{lab.normalRange}</span>
                        </p>
                      </div>
                    </div>

                    {/* Order Button or Revealed Result */}
                    <div className="self-end sm:self-center">
                      {!lab.revealed ? (
                        <button
                          onClick={() => onOrderLab(lab.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs hover:shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Order & Run Test</span>
                        </button>
                      ) : (
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                            lab.isAbnormal
                              ? 'bg-red-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {lab.isAbnormal ? 'ABNORMAL' : 'NORMAL'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Revealed Lab Results details */}
                  {lab.revealed && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-800">Result:</span>
                        <span className={`font-mono font-bold ${
                          lab.isAbnormal ? 'text-red-700 text-sm' : 'text-emerald-800'
                        }`}>
                          {lab.result}
                        </span>
                      </div>
                      {lab.clinicalNote && (
                        <p className="mt-1 text-[11px] text-slate-600 bg-white/80 p-2 rounded border border-slate-200/60">
                          <strong className="text-slate-800">Clinical Interpretation:</strong> {lab.clinicalNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Educational Note */}
          <div className="mt-4 p-3 bg-sky-50 rounded-lg border border-sky-100 text-xs text-sky-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p>
              <strong>Biopsychosocial Clinical Practice:</strong> True clinical competency requires understanding that abnormal lab results and disease exacerbations are frequently driven by underlying social barriers (inability to afford medications, lack of transit to appointments, or food insecurity).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
