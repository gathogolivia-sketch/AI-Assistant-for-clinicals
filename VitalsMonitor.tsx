import React, { useEffect, useState } from 'react';
import { PatientVitalSigns } from '../types/clinical';
import { 
  Activity, 
  Heart, 
  Wind, 
  Thermometer, 
  Droplet, 
  AlertTriangle,
  Radio
} from 'lucide-react';

interface VitalsMonitorProps {
  vitals: PatientVitalSigns;
  acuity: number;
}

export const VitalsMonitor: React.FC<VitalsMonitorProps> = ({ vitals, acuity }) => {
  // Live subtle fluctuation to simulate an active ICU/Ward bedside telemetry monitor
  const [pulseTick, setPulseTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseTick((prev) => (prev + 1) % 60);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute Mean Arterial Pressure (MAP)
  const [systolic, diastolic] = vitals.bloodPressure.split('/').map((n) => parseInt(n, 10));
  const map = Math.round(diastolic + (systolic - diastolic) / 3);

  // Status checks
  const isHeartRateHigh = vitals.heartRate > 100;
  const isHeartRateLow = vitals.heartRate < 60;
  const isBpLow = systolic < 90;
  const isBpHigh = systolic > 140;
  const isSpo2Low = vitals.oxygenSaturation < 92;
  const isRespHigh = vitals.respiratoryRate > 20;
  const isFever = vitals.temperature >= 38.0;

  return (
    <div className="bg-slate-950 text-white rounded-xl p-3 sm:p-4 border border-slate-800 shadow-lg relative overflow-hidden">
      {/* Top telemetry status bar */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-emerald-400 font-semibold tracking-wider text-[11px]">
            BEDSIDE TELEMETRY • LIVE
          </span>
          <span className="text-slate-500 font-mono text-[10px]">
            CH 1 | {vitals.ecgRhythm || 'Sinus Rhythm'}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-slate-400">
            MAP: <span className={`font-bold ${map < 65 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>{map}</span> mmHg
          </span>
          {acuity <= 2 && (
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-700/60 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              HIGH ACUITY
            </span>
          )}
        </div>
      </div>

      {/* Dynamic ECG Waveform visualization */}
      <div className="relative h-10 w-full mb-3 bg-slate-900/60 rounded-md overflow-hidden flex items-center border border-slate-800/50">
        <svg className="w-full h-full stroke-emerald-400" viewBox="0 0 500 40" preserveAspectRatio="none">
          <path
            d="M 0 20 L 40 20 L 50 18 L 60 22 L 70 20 L 80 20 L 85 5 L 90 35 L 95 10 L 100 24 L 105 20 L 140 20 L 160 14 L 180 20 L 220 20 L 240 20 L 250 18 L 260 22 L 270 20 L 280 20 L 285 5 L 290 35 L 295 10 L 300 24 L 305 20 L 340 20 L 360 14 L 380 20 L 420 20 L 440 20 L 450 18 L 460 22 L 470 20 L 480 20 L 485 5 L 490 35 L 495 10 L 500 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div 
          className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-slate-950"
          style={{ left: `${(pulseTick * 1.66) % 100}%` }}
        />
      </div>

      {/* Grid of Vital Signs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {/* Heart Rate */}
        <div className={`p-2.5 rounded-lg border transition-colors ${
          isHeartRateHigh || isHeartRateLow
            ? 'bg-red-950/40 border-red-800/60 text-red-300'
            : 'bg-slate-900/80 border-slate-800 text-emerald-400'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Heart className={`w-3.5 h-3.5 ${isHeartRateHigh ? 'text-red-400 animate-ping' : 'text-emerald-400'}`} />
              HR (BPM)
            </span>
            <span className="text-[10px] font-mono text-slate-500">60-100</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
              {vitals.heartRate}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">bpm</span>
          </div>
          <p className="text-[10px] mt-0.5 truncate text-slate-400">
            {isHeartRateHigh ? 'Tachycardia' : isHeartRateLow ? 'Bradycardia' : 'Normocardia'}
          </p>
        </div>

        {/* Blood Pressure */}
        <div className={`p-2.5 rounded-lg border transition-colors ${
          isBpLow || isBpHigh
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            : 'bg-slate-900/80 border-slate-800 text-sky-400'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              NIBP
            </span>
            <span className="text-[10px] font-mono text-slate-500">mmHg</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold font-mono tracking-tight text-white">
              {vitals.bloodPressure}
            </span>
          </div>
          <p className="text-[10px] mt-0.5 truncate text-slate-400">
            MAP {map} mmHg
          </p>
        </div>

        {/* Oxygen Saturation (SpO2) */}
        <div className={`p-2.5 rounded-lg border transition-colors ${
          isSpo2Low
            ? 'bg-red-950/40 border-red-800/60 text-red-300'
            : 'bg-slate-900/80 border-slate-800 text-cyan-400'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              SpO2
            </span>
            <span className="text-[10px] font-mono text-slate-500">&gt;95%</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
              {vitals.oxygenSaturation}
            </span>
            <span className="text-xs text-slate-400 font-mono">%</span>
          </div>
          <p className={`text-[10px] mt-0.5 truncate ${isSpo2Low ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
            {isSpo2Low ? 'Hypoxemic' : 'Room Air'}
          </p>
        </div>

        {/* Respiratory Rate */}
        <div className={`p-2.5 rounded-lg border transition-colors ${
          isRespHigh
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            : 'bg-slate-900/80 border-slate-800 text-purple-400'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              RESP
            </span>
            <span className="text-[10px] font-mono text-slate-500">12-20</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
              {vitals.respiratoryRate}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">/min</span>
          </div>
          <p className="text-[10px] mt-0.5 truncate text-slate-400">
            {isRespHigh ? 'Tachypnea' : 'Eupneic'}
          </p>
        </div>

        {/* Body Temperature */}
        <div className={`col-span-2 sm:col-span-1 p-2.5 rounded-lg border transition-colors ${
          isFever
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            : 'bg-slate-900/80 border-slate-800 text-teal-400'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-teal-400" />
              TEMP
            </span>
            <span className="text-[10px] font-mono text-slate-500">°C</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
              {vitals.temperature}
            </span>
            <span className="text-xs text-slate-400 font-mono">°C</span>
          </div>
          <p className="text-[10px] mt-0.5 truncate text-slate-400">
            {isFever ? 'Pyrexia / Fever' : 'Normothermic'}
          </p>
        </div>
      </div>
    </div>
  );
};
