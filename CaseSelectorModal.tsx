import React, { useState } from 'react';
import { Department, Difficulty, PatientCase } from '../types/clinical';
import { 
  FolderOpen, 
  Sparkles, 
  Stethoscope, 
  Pill, 
  HeartPulse, 
  Search, 
  PlusCircle, 
  X, 
  AlertTriangle,
  ArrowRight,
  Layers,
  Wand2
} from 'lucide-react';

interface CaseSelectorModalProps {
  cases: PatientCase[];
  selectedCaseId: string;
  onSelectCase: (patientCase: PatientCase) => void;
  onClose: () => void;
  onAddNewCase: (newCase: PatientCase) => void;
}

export const CaseSelectorModal: React.FC<CaseSelectorModalProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  onClose,
  onAddNewCase,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'generate'>('browse');
  const [filterDept, setFilterDept] = useState<'all' | Department>('all');
  const [filterDiff, setFilterDiff] = useState<'all' | Difficulty>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Generator form state
  const [genDept, setGenDept] = useState<Department>('medicine');
  const [genDifficulty, setGenDifficulty] = useState<Difficulty>('intermediate');
  const [genTopic, setGenTopic] = useState('Acute Emergency & Resuscitation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const filteredCases = cases.filter((c) => {
    if (filterDept !== 'all' && c.department !== filterDept) return false;
    if (filterDiff !== 'all' && c.difficulty !== filterDiff) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchDiag = c.diagnosis.toLowerCase().includes(q);
      const matchComp = c.chiefComplaint.toLowerCase().includes(q);
      return matchName || matchDiag || matchComp;
    }
    return true;
  });

  const handleGenerateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenError(null);

    try {
      const res = await fetch('/api/patient/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: genDept,
          difficulty: genDifficulty,
          topic: genTopic,
        }),
      });

      if (!res.ok) {
        throw new Error('Server returned error while generating case.');
      }

      const generatedData: PatientCase = await res.json();
      // Ensure required fallbacks exist
      const enrichedCase: PatientCase = {
        ...generatedData,
        id: `gen-${Date.now()}`,
        avatarSeed: generatedData.name.split(' ')[0] || 'Patient',
        department: genDept,
        difficulty: genDifficulty,
        bedNumber: `Ward ${Math.floor(Math.random() * 5) + 1} - Bed ${Math.floor(Math.random() * 15) + 1}`,
        orderableLabs: generatedData.orderableLabs || [
          { id: 'cbc-gen', name: 'Complete Blood Count (CBC)', category: 'hematology', normalRange: 'Normal', result: 'WBC 11.2, Hb 138, Plt 240', isAbnormal: false },
          { id: 'bmp-gen', name: 'Basic Metabolic Panel', category: 'chemistry', normalRange: 'Normal', result: 'Na 140, K 4.1, Cr 82', isAbnormal: false },
        ],
        medicineDetails: genDept === 'medicine' ? {
          candidateDiagnoses: [generatedData.diagnosis, 'Acute Viral Syndrome', 'Atypical Chest Pain', 'Musculoskeletal Pain'],
          correctDiagnosis: generatedData.diagnosis,
          redFlagsList: [
            { id: 'rf-1', label: 'Sudden onset acute distress', isRedFlag: true },
            { id: 'rf-2', label: 'Hemodynamic instability warning', isRedFlag: true },
            { id: 'rf-3', label: 'Chronic baseline symptoms', isRedFlag: false },
          ],
          clinicalReasoningPrompt: 'Formulate your clinical evaluation and immediate management pathway.',
        } : undefined,
        pharmacyDetails: genDept === 'pharmacy' ? {
          newPrescription: {
            drug: 'Empiric Therapy',
            dose: 'Standard dose',
            route: 'Oral',
            frequency: 'Daily',
            prescriber: 'Dr. Attending',
            indication: generatedData.chiefComplaint,
          },
          knownInteractions: ['Screen for CYP450 interactions, renal clearance, and allergy history.'],
          counsellingChecklist: [
            { id: 'c-1', label: 'Confirm patient identity, indication, and allergy status', isEssential: true },
            { id: 'c-2', label: 'Explain correct dosage, timing, and missed-dose instructions', isEssential: true },
            { id: 'c-3', label: 'Warn regarding potential adverse drug reactions and red flag symptoms', isEssential: true },
          ],
          correctAction: 'contact_prescriber',
          actionRationale: 'Prescription screening requires verifying patient tolerance, organ clearance, and potential interactions.',
        } : undefined,
        nursingDetails: genDept === 'nursing' ? {
          priorityNursingDiagnoses: [
            `Acute Impairment related to ${generatedData.chiefComplaint}`,
            'Risk for Infection secondary to hospital admission',
            'Risk for Falls related to acute physiological vulnerability',
          ],
          correctPriorityDiagnosis: `Acute Impairment related to ${generatedData.chiefComplaint}`,
          fallRiskScore: 65,
          pressureUlcerRisk: 'Moderate',
          careInterventions: [
            { id: 'n-1', label: 'Elevate head of bed and monitor continuous telemetry and oxygen saturation', isPriority: true, rationale: 'Optimizes ventilation and hemodynamic stability.' },
            { id: 'n-2', label: 'Ensure IV access, maintain fluid hydration, and verify allergy documentation', isPriority: true, rationale: 'Enables prompt emergency pharmacotherapy if required.' },
          ],
          suggestedSbar: {
            situation: `Calling regarding ${generatedData.name} presenting with acute ${generatedData.chiefComplaint}.`,
            background: `${generatedData.age}-year-old ${generatedData.gender} admitted for clinical observation.`,
            assessment: `Vitals show HR ${generatedData.vitals.heartRate}, BP ${generatedData.vitals.bloodPressure}, SpO2 ${generatedData.vitals.oxygenSaturation}%.`,
            recommendation: 'Recommend immediate bedside assessment and targeted diagnostic laboratory order.',
          },
        } : undefined,
      };

      onAddNewCase(enrichedCase);
      onSelectCase(enrichedCase);
      onClose();
    } catch (err: any) {
      console.error('Case generation error:', err);
      setGenError('Failed to generate virtual case with AI. Please check your connection or choose a pre-built patient from the bank.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col border border-sky-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Simulated Patient Case Repository
              </h3>
              <p className="text-xs text-slate-500">
                Select from university verified cases or generate an AI virtual patient
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Browse Bank vs AI Generator */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Pre-Curated Patient Bank ({cases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>AI Virtual Patient Generator</span>
          </button>
        </div>

        {/* Tab 1: Browse Case Bank */}
        {activeTab === 'browse' && (
          <div className="flex-1 overflow-y-auto mt-4 space-y-4">
            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by patient name, symptoms, or condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white text-slate-800"
                />
              </div>

              {/* Department filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                {(['all', 'medicine', 'pharmacy', 'nursing'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDept(d)}
                    className={`px-2.5 py-1 rounded-lg font-medium capitalize cursor-pointer transition-colors ${
                      filterDept === d
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Difficulty filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setFilterDiff(diff)}
                    className={`px-2.5 py-1 rounded-lg font-medium capitalize cursor-pointer transition-colors ${
                      filterDiff === diff
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Cases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
              {filteredCases.map((c) => {
                const isSelected = c.id === selectedCaseId;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCase(c);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{c.name}</span>
                        <span className="text-xs text-slate-500">
                          {c.age}y • {c.gender}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.department === 'medicine'
                          ? 'bg-sky-100 text-sky-800'
                          : c.department === 'pharmacy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {c.department}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 italic line-clamp-2 mb-2 bg-slate-50 p-2 rounded border border-slate-100">
                      "{c.chiefComplaint}"
                    </p>

                    {/* Comorbidities & SDOH Pill Row */}
                    <div className="flex flex-wrap items-center gap-1 mb-2.5">
                      {c.comorbidities?.slice(0, 3).map((cm, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
                          {cm.split('(')[0].trim()}
                        </span>
                      ))}
                      {c.socialDeterminants?.transportation?.barrierPresent && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-semibold border border-purple-200">
                          Transit Barrier
                        </span>
                      )}
                      {c.socialDeterminants?.financial?.barrierPresent && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                          Co-pay Strain
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span className="capitalize font-medium text-slate-700">
                        Difficulty: <strong>{c.difficulty}</strong>
                      </span>
                      <span className="text-sky-600 font-semibold flex items-center gap-1">
                        Select Case <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCases.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No cases match the selected filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AI Virtual Patient Generator */}
        {activeTab === 'generate' && (
          <form onSubmit={handleGenerateCase} className="flex-1 overflow-y-auto mt-4 space-y-4">
            <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-900 leading-relaxed">
              <strong className="block text-sky-950 font-bold mb-1">
                Generative AI Clinical Case Synthesis with Comorbidities & SDOH
              </strong>
              Using Gemini AI, you can generate complex clinical scenarios featuring multiple chronic comorbidities (e.g. hypertension, diabetes, smoking, CKD) and Social Determinants of Health (transportation barriers, financial strains, food deserts, home hazards).
            </div>

            {genError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{genError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Learning Department:
                </label>
                <select
                  value={genDept}
                  onChange={(e) => setGenDept(e.target.value as Department)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-sky-500 font-medium text-slate-800"
                >
                  <option value="medicine">Medicine (History, Comorbidities & Differentials)</option>
                  <option value="pharmacy">Pharmacy (Prescription Screening & Polypharmacy)</option>
                  <option value="nursing">Nursing (Assessment, Vitals, SDOH & SBAR)</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Difficulty Level:
                </label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value as Difficulty)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-sky-500 font-medium text-slate-800"
                >
                  <option value="beginner">Beginner (Foundational Signs)</option>
                  <option value="intermediate">Intermediate (Clinical Rotation Standard)</option>
                  <option value="advanced">Advanced (Multimorbidity & High-Acuity Red Flags)</option>
                </select>
              </div>
            </div>

            {/* Clinical Specialty / Case Theme */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Specialty, Comorbidities & SDOH Theme:
              </label>
              <input
                type="text"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                placeholder="E.g., Hypertension & Diabetes with smoker and transit barrier..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-sky-500 text-slate-800"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'Hypertension, Diabetes, Smoker & Transit Barrier',
                  'Geriatric Polypharmacy, Living Alone & Fall Risk',
                  'Heart Failure, Fixed Pension & Co-Pay Strain',
                  'COPD, Active Smoker & Substandard Housing',
                  'CKD Stage 3, Food Desert & High Sodium Intake',
                  'Asthma, Mold Exposure & Inhaler Cost Barrier',
                ].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGenTopic(t)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 transition-colors cursor-pointer font-medium"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Realistic Virtual Patient with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate & Launch Virtual Patient Simulation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
