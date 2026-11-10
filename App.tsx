import React, { useState, useEffect } from 'react';
import { 
  Department, 
  Difficulty, 
  PatientCase, 
  ChatMessage, 
  StudentDecisions, 
  EvaluationResult 
} from './types/clinical';
import { INITIAL_PATIENT_CASES } from './patientCases';
import { HospitalHeader } from './HospitalHeader';
import { PatientBanner } from './PatientBanner';
import { PatientChat } from './PatientChat';
import { LabsAndRecords } from './LabsAndRecords';
import { MedicineWorkspace } from './MedicineWorkspace';
import { PharmacyWorkspace } from './PharmacyWorkspace';
import { NursingWorkspace } from './NursingWorkspace';
import { DebriefModal } from './DebriefModal';
import { CaseSelectorModal } from './CaseSelectorModal';
import { SafetyDisclaimerModal } from './SafetyDisclaimerModal';
import { speechService } from './speech';
import { 
  AlertTriangle, 
  RotateCcw, 
  Sparkles, 
  Hospital, 
  ShieldCheck, 
  ChevronRight,
  Info
} from 'lucide-react';

export default function App() {
  // Case bank
  const [cases, setCases] = useState<PatientCase[]>(INITIAL_PATIENT_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>(INITIAL_PATIENT_CASES[0].id);

  // Active department
  const [currentDepartment, setCurrentDepartment] = useState<Department>('medicine');

  // Active tab within the current patient
  const [activeTab, setActiveTab] = useState<'chat' | 'records' | 'decision' | 'debrief'>('chat');

  // Chat messages per case: { [caseId]: ChatMessage[] }
  const [chatsByCase, setChatsByCase] = useState<Record<string, ChatMessage[]>>({
    'med-04': [
      {
        id: 'init-harold',
        sender: 'patient',
        text: "Hello doctor... thank you for seeing me. My ankles are swollen up so badly, and I can't catch my breath when I lie down. I ran out of my water pills 10 days ago because I don't have a car or a ride to get over to the clinic...",
        timestamp: 'Just now',
        category: 'HPI',
      },
    ],
    'med-01': [
      {
        id: 'init-1',
        sender: 'patient',
        text: "Oh doctor... thank goodness you're here. This pressure in the middle of my chest is crushing, and my left arm feels numb and heavy...",
        timestamp: 'Just now',
        category: 'HPI',
      },
    ],
    'med-02': [
      {
        id: 'init-2',
        sender: 'patient',
        text: "Hi... I'm really hurting on my lower right belly. Every time the trolley moved or I cough, it stabs right through me.",
        timestamp: 'Just now',
        category: 'HPI',
      },
    ],
    'pharm-01': [
      {
        id: 'init-3',
        sender: 'patient',
        text: "Hello! I came to pick up this new antibiotic prescription from the clinic. But I noticed I've had sudden nosebleeds over the weekend and I'm wondering if everything is safe to take?",
        timestamp: 'Just now',
        category: 'HPI',
      },
    ],
    'nurs-01': [
      {
        id: 'init-4',
        sender: 'patient',
        text: "Nurse... I can't seem to get enough air in... and whenever I try to take a real breath, my surgical wound hurts so much I want to scream...",
        timestamp: 'Just now',
        category: 'HPI',
      },
    ],
  });

  // Decisions per case
  const [decisionsByCase, setDecisionsByCase] = useState<Record<string, StudentDecisions>>({});

  // Evaluations per case
  const [evaluationsByCase, setEvaluationsByCase] = useState<Record<string, EvaluationResult>>({});

  // Interaction loading states
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Modals
  const [isCaseSelectorOpen, setIsCaseSelectorOpen] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState<boolean>(false);

  // Find active patient case
  const currentPatient = cases.find((c) => c.id === activeCaseId) || cases[0];
  const currentChat = chatsByCase[currentPatient.id] || [];
  const currentEvaluation = evaluationsByCase[currentPatient.id];

  // Sync department when switching to a case of a different department
  useEffect(() => {
    if (currentPatient.department !== currentDepartment) {
      setCurrentDepartment(currentPatient.department);
    }
  }, [currentPatient.id]);

  // Handle department change from header
  const handleSelectDepartment = (dept: Department) => {
    setCurrentDepartment(dept);
    // Find the first patient matching this department
    const matchingCase = cases.find((c) => c.department === dept);
    if (matchingCase && matchingCase.id !== activeCaseId) {
      setActiveCaseId(matchingCase.id);
      setActiveTab('chat');
    }
  };

  // Send message to patient
  const handleSendMessage = async (text: string, category: ChatMessage['category'] = 'General') => {
    const studentMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category,
    };

    const updatedHistory = [...currentChat, studentMsg];
    setChatsByCase((prev) => ({
      ...prev,
      [currentPatient.id]: updatedHistory,
    }));

    setIsTyping(true);

    try {
      const response = await fetch('/api/patient/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: currentPatient,
          message: text,
          chatHistory: updatedHistory,
        }),
      });

      const data = await response.json();
      const patientReply = data.reply || "I'm having a hard time describing it... it just feels very uncomfortable.";

      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'patient',
        text: patientReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatsByCase((prev) => ({
        ...prev,
        [currentPatient.id]: [...updatedHistory, replyMsg],
      }));

      // If voice enabled, speak response
      if (voiceEnabled) {
        speechService.speak(patientReply, currentPatient.gender);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackReply = "I'm sorry... I feel quite lightheaded and my pain is distracting me.";
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'patient',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatsByCase((prev) => ({
        ...prev,
        [currentPatient.id]: [...updatedHistory, replyMsg],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  // Order diagnostic lab test
  const handleOrderLab = (labId: string) => {
    setCases((prevCases) =>
      prevCases.map((c) => {
        if (c.id !== currentPatient.id) return c;
        const updatedLabs = c.orderableLabs.map((l) => (l.id === labId ? { ...l, revealed: true } : l));
        return { ...c, orderableLabs: updatedLabs };
      })
    );
  };

  // Submit clinical decision for OSCE AI evaluation
  const handleSubmitDecision = async (decisions: StudentDecisions) => {
    setIsEvaluating(true);
    setEvalError(null);
    setDecisionsByCase((prev) => ({
      ...prev,
      [currentPatient.id]: decisions,
    }));

    try {
      const response = await fetch('/api/patient/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: currentPatient,
          department: currentDepartment,
          chatHistory: currentChat,
          studentDecisions: decisions,
        }),
      });

      const evaluation: EvaluationResult = await response.json();
      setEvaluationsByCase((prev) => ({
        ...prev,
        [currentPatient.id]: evaluation,
      }));
      setActiveTab('debrief');
    } catch (err) {
      console.error('Evaluation error:', err);
      setEvalError('Unable to generate AI clinical evaluation at this moment. Please check your connection and retry.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Restart / Reset current simulation
  const handleRestart = () => {
    // Reset chat
    setChatsByCase((prev) => ({
      ...prev,
      [currentPatient.id]: [
        {
          id: `init-${Date.now()}`,
          sender: 'patient',
          text: `Hello... I'm ${currentPatient.name}. I came in because ${currentPatient.chiefComplaint.toLowerCase()}`,
          timestamp: 'Just now',
          category: 'HPI',
        },
      ],
    }));

    // Reset labs
    setCases((prevCases) =>
      prevCases.map((c) => {
        if (c.id !== currentPatient.id) return c;
        const resetLabs = c.orderableLabs.map((l) => ({ ...l, revealed: false }));
        return { ...c, orderableLabs: resetLabs };
      })
    );

    // Reset decisions & evaluation
    setDecisionsByCase((prev) => {
      const next = { ...prev };
      delete next[currentPatient.id];
      return next;
    });

    setEvaluationsByCase((prev) => {
      const next = { ...prev };
      delete next[currentPatient.id];
      return next;
    });

    setActiveTab('chat');
    setIsRestartConfirmOpen(false);
  };

  // Add dynamically generated case from AI
  const handleAddNewCase = (newCase: PatientCase) => {
    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    setCurrentDepartment(newCase.department);
    setChatsByCase((prev) => ({
      ...prev,
      [newCase.id]: [
        {
          id: `init-${Date.now()}`,
          sender: 'patient',
          text: `Hello doctor/nurse... I am ${newCase.name}. I have been having "${newCase.chiefComplaint}". Can you help me?`,
          timestamp: 'Just now',
          category: 'HPI',
        },
      ],
    }));
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-200">
      {/* Top Hospital Navigation & Department Switcher */}
      <HospitalHeader
        currentDepartment={currentDepartment}
        onSelectDepartment={handleSelectDepartment}
        onOpenCaseSelector={() => setIsCaseSelectorOpen(true)}
        onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
        onRestartSimulation={() => setIsRestartConfirmOpen(true)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        hasActiveEvaluation={Boolean(currentEvaluation)}
        onOpenDebrief={() => setActiveTab('debrief')}
      />

      {/* Bedside Patient Profile & Navigation Banner */}
      <PatientBanner
        patient={currentPatient}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasEvaluation={Boolean(currentEvaluation)}
        questionCount={currentChat.filter((m) => m.sender === 'student').length}
      />

      {/* Main Clinical Environment Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Error notification banner if any */}
        {evalError && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium">{evalError}</span>
            </div>
            <button
              onClick={() => setEvalError(null)}
              className="text-red-700 hover:text-red-900 font-bold px-2 py-1 rounded hover:bg-red-100 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Interactive Patient Bedside Chat */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <PatientChat
                patient={currentPatient}
                messages={currentChat}
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
                voiceEnabled={voiceEnabled}
              />
            </div>

            {/* Right sidebar: Bedside Clinical Cheat-Sheet & Next Steps */}
            <div className="lg:col-span-4 space-y-4">
              {/* Emergency Warning Banner if acute */}
              {currentPatient.emergencyWarning && (
                <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-xl text-xs text-red-950">
                  <div className="flex items-center gap-1.5 font-bold text-red-900 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Emergency Red Flag Presentation</span>
                  </div>
                  <p className="leading-relaxed">
                    {currentPatient.emergencyWarning}
                  </p>
                </div>
              )}

              {/* Department Learning Focus */}
              <div className="bg-white rounded-xl border border-sky-100 p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {currentDepartment.toUpperCase()} Clinical Objectives
                </span>
                <ul className="mt-3 space-y-2 text-xs text-slate-700">
                  {currentPatient.learningObjectives?.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Actions to Progress */}
              <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-xl p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                  Simulation Workflow Steps
                </h4>

                <button
                  onClick={() => setActiveTab('records')}
                  className="w-full flex items-center justify-between p-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-white/10"
                >
                  <span>1. Check Vitals & Order Labs</span>
                  <ChevronRight className="w-4 h-4 text-sky-300" />
                </button>

                <button
                  onClick={() => setActiveTab('decision')}
                  className="w-full flex items-center justify-between p-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <span>2. Make Department Decision</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {currentEvaluation && (
                  <button
                    onClick={() => setActiveTab('debrief')}
                    className="w-full flex items-center justify-between p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <span>3. View OSCE Debrief Report ({currentEvaluation.overallScore}/100)</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bedside Telemetry & Diagnostic Investigations */}
        {activeTab === 'records' && (
          <LabsAndRecords
            patient={currentPatient}
            onOrderLab={handleOrderLab}
          />
        )}

        {/* Tab 3: Department Decision Workspace (Medicine / Pharmacy / Nursing) */}
        {activeTab === 'decision' && (
          <div>
            {currentDepartment === 'medicine' && (
              <MedicineWorkspace
                patient={currentPatient}
                onSubmitDecision={handleSubmitDecision}
                isEvaluating={isEvaluating}
              />
            )}
            {currentDepartment === 'pharmacy' && (
              <PharmacyWorkspace
                patient={currentPatient}
                onSubmitDecision={handleSubmitDecision}
                isEvaluating={isEvaluating}
              />
            )}
            {currentDepartment === 'nursing' && (
              <NursingWorkspace
                patient={currentPatient}
                onSubmitDecision={handleSubmitDecision}
                isEvaluating={isEvaluating}
              />
            )}
          </div>
        )}

        {/* Tab 4: AI Feedback & OSCE Debrief Report */}
        {activeTab === 'debrief' && (
          <div>
            {currentEvaluation ? (
              <DebriefModal
                patient={currentPatient}
                evaluation={currentEvaluation}
                onRestartSimulation={handleRestart}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-sky-100 p-8 text-center max-w-xl mx-auto shadow-sm">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  No Active Evaluation Yet
                </h3>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  To receive AI OSCE grading, first take a clinical history with {currentPatient.name}, review laboratory data, and submit your department decisions in the Decision Workspace.
                </p>
                <button
                  onClick={() => setActiveTab('decision')}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Go to Clinical Decision Workspace
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Case Selector Modal */}
      {isCaseSelectorOpen && (
        <CaseSelectorModal
          cases={cases}
          selectedCaseId={currentPatient.id}
          onSelectCase={(selected) => {
            setActiveCaseId(selected.id);
            setCurrentDepartment(selected.department);
            setActiveTab('chat');
          }}
          onClose={() => setIsCaseSelectorOpen(false)}
          onAddNewCase={handleAddNewCase}
        />
      )}

      {/* Educational Safety Disclaimer Modal */}
      {isSafetyModalOpen && (
        <SafetyDisclaimerModal onClose={() => setIsSafetyModalOpen(false)} />
      )}

      {/* Restart Simulation Confirmation Dialog */}
      {isRestartConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Restart Simulation Case?
                </h4>
                <p className="text-xs text-slate-500">
                  Reset history, tests, and clinical evaluation for {currentPatient.name}.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              This will clear the conversation messages and diagnostic laboratory orders for this patient, allowing you to practice again from scratch.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsRestartConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRestart}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Restart Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Educational Safety Footer */}
      <footer className="bg-white border-t border-sky-100 py-3 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>AI Clinical Simulation Assistant • University Healthcare Education</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Simulated educational cases only. Not intended for actual medical diagnosis or prescription.
          </p>
        </div>
      </footer>
    </div>
  );
}
