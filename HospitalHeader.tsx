import React from 'react';
import { Department } from '../types/clinical';
import { 
  Stethoscope, 
  Pill, 
  HeartPulse, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  FolderOpen,
  Hospital,
  Sparkles,
  Download
} from 'lucide-react';

interface HospitalHeaderProps {
  currentDepartment: Department;
  onSelectDepartment: (dept: Department) => void;
  onOpenCaseSelector: () => void;
  onOpenSafetyModal: () => void;
  onRestartSimulation: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  hasActiveEvaluation: boolean;
  onOpenDebrief: () => void;
}

export const HospitalHeader: React.FC<HospitalHeaderProps> = ({
  currentDepartment,
  onSelectDepartment,
  onOpenCaseSelector,
  onOpenSafetyModal,
  onRestartSimulation,
  voiceEnabled,
  onToggleVoice,
  hasActiveEvaluation,
  onOpenDebrief,
}) => {
  return (
    <header className="bg-white border-b border-sky-100 shadow-xs sticky top-0 z-30">
      {/* Top hospital banner */}
      <div className="bg-slate-900 text-sky-100 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide text-sky-300">VIRTUAL TEACHING HOSPITAL</span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">University Clinical Skills & Simulation Center</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSafetyModal}
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="underline decoration-dotted text-[11px]">Educational Safety Protocol</span>
          </button>
          <span className="bg-sky-950 text-sky-300 px-2 py-0.5 rounded text-[10px] font-mono border border-sky-800">
            SIM-OSCE v3.2
          </span>
        </div>
      </div>

      {/* Main navigation & Department selector */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                AI Clinical Simulation Assistant
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                <Sparkles className="w-3 h-3 text-sky-500" />
                University Edition
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive clinical decision-making for Medicine, Pharmacy & Nursing
            </p>
          </div>
        </div>

        {/* 3 Department Switcher Buttons */}
        <div className="mt-3 sm:mt-0 flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => onSelectDepartment('medicine')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentDepartment === 'medicine'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Medicine</span>
          </button>

          <button
            onClick={() => onSelectDepartment('pharmacy')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentDepartment === 'pharmacy'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Pharmacy</span>
          </button>

          <button
            onClick={() => onSelectDepartment('nursing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentDepartment === 'nursing'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Nursing</span>
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="mt-3 sm:mt-0 flex items-center gap-2">
          {/* Patient Bank / Case selector button */}
          <button
            onClick={onOpenCaseSelector}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
            title="Browse cases or generate custom simulated patient"
          >
            <FolderOpen className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden md:inline">Patient</span> Bank
          </button>

          {/* Voice toggle button */}
          <button
            onClick={onToggleVoice}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              voiceEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title={voiceEnabled ? 'Patient voice speech enabled (Click to mute)' : 'Patient voice audio muted (Click to enable)'}
          >
            {voiceEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline text-[11px]">Audio Voice On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline text-[11px]">Muted</span>
              </>
            )}
          </button>

          {/* If evaluation completed, show Debrief button */}
          {hasActiveEvaluation && (
            <button
              onClick={onOpenDebrief}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Debrief Report</span>
            </button>
          )}

          {/* Download project zip button */}
          <a
            href="/api/download-project"
            download="ai-clinical-simulation-assistant.zip"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Download project as a ZIP archive"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Code</span>
          </a>

          {/* Restart simulation button */}
          <button
            onClick={onRestartSimulation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Restart current patient scenario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
