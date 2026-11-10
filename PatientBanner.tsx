import React from 'react';
import { PatientCase } from '../types/clinical';
import { 
  AlertOctagon, 
  User, 
  MapPin, 
  Briefcase, 
  AlertTriangle, 
  MessageSquare, 
  FlaskConical, 
  CheckSquare, 
  Award,
  Flame,
  Car,
  DollarSign,
  HeartCrack,
  Activity
} from 'lucide-react';

interface PatientBannerProps {
  patient: PatientCase;
  activeTab: 'chat' | 'records' | 'decision' | 'debrief';
  onSelectTab: (tab: 'chat' | 'records' | 'decision' | 'debrief') => void;
  hasEvaluation: boolean;
  questionCount: number;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  activeTab,
  onSelectTab,
  hasEvaluation,
  questionCount,
}) => {
  // Acuity color coding
  const acuityBadge = () => {
    switch (patient.triageAcuity) {
      case 1:
        return { label: 'ESI 1: Resuscitation (Immediate)', bg: 'bg-red-600 text-white animate-pulse' };
      case 2:
        return { label: 'ESI 2: Emergent / Critical', bg: 'bg-amber-600 text-white' };
      case 3:
        return { label: 'ESI 3: Urgent', bg: 'bg-yellow-100 text-yellow-900 border border-yellow-300' };
      case 4:
        return { label: 'ESI 4: Semi-Urgent', bg: 'bg-sky-100 text-sky-800 border border-sky-200' };
      default:
        return { label: 'ESI 5: Non-Urgent', bg: 'bg-emerald-100 text-emerald-800' };
    }
  };

  const badge = acuityBadge();

  return (
    <div className="bg-white border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-2">
        {/* Upper patient identification strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Patient Profile Demographics */}
          <div className="flex items-start sm:items-center gap-3">
            {/* Avatar */}
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-sm shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-sky-200 font-bold text-lg">
                {patient.name.split(' ').map((n) => n[0]).join('')}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {patient.name}
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {patient.age} yrs • {patient.gender}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badge.bg}`}>
                  {badge.label}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                  {patient.difficulty}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 text-sky-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  {patient.bedNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {patient.occupation}
                </span>
                <span className="flex items-center gap-1 italic text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Demeanor: {patient.demeanor}
                </span>
              </div>
            </div>
          </div>

          {/* Allergies, Comorbidities count & SDOH Badges */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* SDOH Alert Badges */}
            {patient.socialDeterminants?.transportation?.barrierPresent && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 text-xs font-semibold" title={patient.socialDeterminants.transportation.details}>
                <Car className="w-3.5 h-3.5 text-purple-600" />
                <span>Transit Barrier</span>
              </span>
            )}

            {patient.socialDeterminants?.financial?.barrierPresent && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold" title={patient.socialDeterminants.financial.details}>
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                <span>Cost / Co-Pay Strain</span>
              </span>
            )}

            {/* Documented Allergies */}
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200 text-xs font-semibold" title={patient.allergies.join(' | ')}>
                <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                <span>Allergies ({patient.allergies.length})</span>
              </div>
            )}

            {/* Emergency Warning */}
            {patient.emergencyWarning && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Red Flag Case</span>
              </div>
            )}
          </div>
        </div>

        {/* Comorbidities & Social Determinants Sub-Strip */}
        {patient.comorbidities && patient.comorbidities.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              Comorbidities:
            </span>
            {patient.comorbidities.map((cm, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 text-[11px] font-medium"
              >
                {cm}
              </span>
            ))}
          </div>
        )}

        {/* Chief Complaint Quote Banner */}
        <div className="mt-2.5 px-3.5 py-2 rounded-lg bg-sky-50/70 border border-sky-100/90 text-xs flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-sky-900 shrink-0 uppercase tracking-wider text-[10px] bg-sky-200/70 px-1.5 py-0.5 rounded">
              Chief Complaint
            </span>
            <p className="text-slate-800 italic font-medium">
              "{patient.chiefComplaint}"
            </p>
          </div>
          <span className="text-[11px] text-sky-800 font-mono hidden md:inline shrink-0">
            Questions Asked: <strong className="text-sky-950 font-bold">{questionCount}</strong>
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 mt-3 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => onSelectTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Bedside Patient Chat</span>
            {questionCount > 0 && (
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'chat' ? 'bg-sky-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {questionCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('records')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'records'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Vitals, Comorbidities & SDOH</span>
            {patient.orderableLabs?.some(l => l.revealed) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('decision')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'decision'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>
              {patient.department === 'medicine'
                ? 'Differential Diagnosis & Holistic Plan'
                : patient.department === 'pharmacy'
                ? 'Prescription Screening & Safety'
                : 'Nursing Care Plan & SBAR'}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('debrief')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'debrief'
                ? 'bg-amber-600 text-white shadow-xs'
                : hasEvaluation
                ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>OSCE Feedback & Score</span>
            {hasEvaluation && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
