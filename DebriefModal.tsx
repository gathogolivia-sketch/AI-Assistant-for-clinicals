import React, { useEffect } from 'react';
import { EvaluationResult, PatientCase } from '../types/clinical';
import { fireCelebrationConfetti } from '../utils/confetti';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight, 
  Printer, 
  RotateCcw, 
  X,
  Sparkles,
  ShieldAlert,
  Flame,
  FileCheck
} from 'lucide-react';

interface DebriefModalProps {
  patient: PatientCase;
  evaluation: EvaluationResult;
  onClose?: () => void;
  onRestartSimulation: () => void;
  isModal?: boolean;
}

export const DebriefModal: React.FC<DebriefModalProps> = ({
  patient,
  evaluation,
  onClose,
  onRestartSimulation,
  isModal = false,
}) => {
  useEffect(() => {
    if (evaluation.overallScore >= 80) {
      fireCelebrationConfetti();
    }
  }, [evaluation.overallScore]);

  const handlePrint = () => {
    window.print();
  };

  // Color scheme for score
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 border-emerald-500 bg-emerald-50';
    if (score >= 70) return 'text-sky-600 border-sky-500 bg-sky-50';
    if (score >= 55) return 'text-amber-600 border-amber-500 bg-amber-50';
    return 'text-red-600 border-red-500 bg-red-50';
  };

  const content = (
    <div className="space-y-6 text-slate-900 print:text-black">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
              OSCE Clinical Debrief Report
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Case Ref: #{patient.id}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Clinical Simulation Evaluation: {patient.name}
          </h2>
          <p className="text-xs text-slate-500">
            University Healthcare Simulation Assessment • Department of {patient.department.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Emergency Supervision Warning Banner if applicable */}
      {evaluation.emergencySupervisionAlert && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-xs text-red-950 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-900 mb-0.5 text-sm">
              Critical Clinical Alert & Supervised Escalation
            </h4>
            <p className="leading-relaxed">
              {evaluation.emergencySupervisionAlert}
            </p>
          </div>
        </div>
      )}

      {/* Score Summary & Performance Tier */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
        {/* Main Score Dial */}
        <div className="flex flex-col items-center justify-center text-center p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Overall Performance
          </span>
          <div className={`w-22 h-22 rounded-full border-4 flex flex-col items-center justify-center font-black ${getScoreColor(evaluation.overallScore)}`}>
            <span className="text-3xl font-mono">{evaluation.overallScore}</span>
            <span className="text-[10px] text-slate-500 font-sans font-normal">/ 100</span>
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
            {evaluation.performanceTier}
          </span>
        </div>

        {/* 3 Domain Category Scores */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Communication */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-700">Communication & History</span>
                <span className="font-mono font-bold text-sky-700">{evaluation.categoryScores?.communication || 80}%</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Patient rapport, open questions, comorbidities & SDOH inquiry.
              </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${evaluation.categoryScores?.communication || 80}%` }}
              />
            </div>
          </div>

          {/* Clinical Reasoning */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-700">Clinical Reasoning</span>
                <span className="font-mono font-bold text-emerald-700">{evaluation.categoryScores?.clinicalReasoning || 85}%</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Diagnostic accuracy, test selection, or pharmacy screening precision.
              </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${evaluation.categoryScores?.clinicalReasoning || 85}%` }}
              />
            </div>
          </div>

          {/* Patient Safety & SDOH */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-700">Patient Safety & SDOH</span>
                <span className="font-mono font-bold text-indigo-700">{evaluation.categoryScores?.patientSafety || 85}%</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Allergy verification, contraindications & addressing adherence barriers.
              </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${evaluation.categoryScores?.patientSafety || 85}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Missed Critical Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths */}
        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Demonstrated Clinical Strengths
          </h4>
          <ul className="space-y-2 text-xs text-emerald-950">
            {evaluation.strengths?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missed Information / Areas for Improvement */}
        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Critical Missed Information & Growth Areas
          </h4>
          <ul className="space-y-2 text-xs text-amber-950">
            {evaluation.missedAreas?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-amber-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Clinical Rationale & Expert Pathway */}
      <div className="bg-white rounded-xl border border-sky-100 p-5 shadow-xs space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sky-600" />
            Clinical Rationale & Disease Etiology
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            {evaluation.clinicalRationale}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            Evidence-Based Best Practice Management Pathway
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-indigo-50/40 p-3.5 rounded-lg border border-indigo-100">
            {evaluation.correctClinicalPath}
          </p>
        </div>
      </div>

      {/* Key Learning Points */}
      {evaluation.keyLearningPoints && evaluation.keyLearningPoints.length > 0 && (
        <div className="bg-gradient-to-r from-sky-900 to-indigo-950 text-white rounded-xl p-4 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Core Educational Takeaways for University Exams / OSCEs
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            {evaluation.keyLearningPoints.map((point, idx) => (
              <div key={idx} className="bg-white/10 p-3 rounded-lg text-xs text-sky-100 border border-white/10">
                <span className="font-mono text-sky-300 text-[10px] block mb-1">Takeaway #{idx + 1}</span>
                <p className="leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 print:hidden">
        <p className="text-xs text-slate-500 italic">
          This debrief evaluation was synthesized by the AI Clinical Examiner based on standard university OSCE rubrics.
        </p>

        <button
          onClick={onRestartSimulation}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Practice Again with This Patient</span>
        </button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-sky-100">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
