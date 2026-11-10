import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  GraduationCap, 
  X,
  Stethoscope,
  HeartPulse
} from 'lucide-react';

interface SafetyDisclaimerModalProps {
  onClose: () => void;
}

export const SafetyDisclaimerModal: React.FC<SafetyDisclaimerModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-sky-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Clinical Simulation Safety & Educational Statement
            </h3>
            <p className="text-xs text-slate-500">
              Mandatory University Educational Compliance Notice
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Simulated Patients Are Strictly Fictional</span>
            </div>
            <p>
              All patient personas, medical profiles, diagnostic laboratory results, and clinical scenarios within this software are entirely synthetic and designed solely for university healthcare student training in Medicine, Pharmacy, and Nursing.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-sky-900">
              Core Educational Principles:
            </h4>
            <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span><strong>No Real-World Prescribing:</strong> Never apply simulated medication dosages, interactions, or treatment pathways to real living individuals without licensed senior clinical supervision.</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span><strong>Emergency Escalation Protocol:</strong> Whenever high-acuity red flag signs appear (e.g., severe hypotension, respiratory exhaustion, acute chest pain), simulation learners are trained to trigger senior attending and emergency resuscitation pathways.</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span><strong>Interprofessional Alignment:</strong> Medicine, Pharmacy, and Nursing disciplines adhere to evidence-based international clinical guidelines (NICE, AHA/ACC, WHO, NANDA-I, ASHP).</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Ref: SimSafety-EdCode-2026
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            I Acknowledge & Understand
          </button>
        </div>
      </div>
    </div>
  );
};
