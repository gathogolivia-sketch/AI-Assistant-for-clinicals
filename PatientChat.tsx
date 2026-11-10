import React, { useState, useRef, useEffect } from 'react';
import { PatientCase, ChatMessage } from '../types/clinical';
import { speechService } from './speech';
import { 
  Send, 
  Volume2, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  AlertTriangle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

interface PatientChatProps {
  patient: PatientCase;
  messages: ChatMessage[];
  onSendMessage: (text: string, category?: ChatMessage['category']) => Promise<void>;
  isTyping: boolean;
  voiceEnabled: boolean;
}

export const PatientChat: React.FC<PatientChatProps> = ({
  patient,
  messages,
  onSendMessage,
  isTyping,
  voiceEnabled,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChatMessage['category']>('General');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isTyping) return;

    setInputText('');
    await onSendMessage(text, selectedCategory);
  };

  const handlePlayVoice = (text: string) => {
    speechService.speak(text, patient.gender);
  };

  // Quick inquiry clinical question suggestions organized by domain
  const clinicalQuestions: { label: string; category: ChatMessage['category']; query: string }[] = [
    { label: 'Symptom Onset', category: 'HPI', query: 'When exactly did your symptoms first start, and how have they changed over time?' },
    { label: 'Pain & Discomfort', category: 'HPI', query: 'Can you describe the pain or discomfort? Is it sharp, dull, heavy pressure, or throbbing?' },
    { label: 'Triggers & Relief', category: 'HPI', query: 'Does anything make the discomfort better or worse, such as resting, exertion, or lying flat?' },
    { label: 'Transportation & Access', category: 'SDOH & Barriers', query: 'Do you have reliable transportation or a car to attend doctor checkups and pick up your medicine refills?' },
    { label: 'Medication Costs', category: 'SDOH & Barriers', query: 'Are you able to afford all your monthly prescription co-pays, or have you ever had to stretch doses?' },
    { label: 'Chronic Comorbidities', category: 'Review of Systems', query: 'Can you tell me about your other medical conditions, like high blood pressure, diabetes, or kidney trouble?' },
    { label: 'Daily Medications', category: 'Meds', query: 'What specific prescription pills, water pills, or over-the-counter remedies do you take at home?' },
    { label: 'Allergies & Reactions', category: 'Allergies', query: 'Do you have any documented allergies to medicines like blood pressure pills or antibiotics, and what happened?' },
    { label: 'Smoking & Substances', category: 'Social', query: 'Do you smoke cigarettes or use tobacco, and how many packs or years have you smoked?' },
    { label: 'Food & Nutrition', category: 'SDOH & Barriers', query: 'Do you have easy access to a grocery store with fresh food, or do you rely on canned/convenience foods?' },
    { label: 'Living Situation & Stairs', category: 'Social', query: 'Who do you live with at home, and are there stairs or obstacles that make moving around difficult?' },
  ];

  return (
    <div className="flex flex-col h-[640px] bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
      {/* Bedside Room Header */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white px-4 py-3 flex items-center justify-between border-b border-sky-800">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-sky-500/30 flex items-center justify-center font-bold text-sky-200 border border-sky-400/50">
              {patient.name[0]}
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-2 ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white">{patient.name}</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-800/80 text-sky-200 font-mono">
                {patient.gender}, {patient.age}y
              </span>
            </div>
            <p className="text-[11px] text-sky-300 flex items-center gap-1.5">
              <span>Bedside Consultation</span>
              <span>•</span>
              <span className="italic">{patient.demeanor}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {patient.emergencyWarning && (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-red-900/60 border border-red-700/80 text-red-200 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              High Acuity Case
            </span>
          )}
          <span className="text-slate-400 font-mono text-[11px] hidden md:inline">
            Interactive AI Simulated Patient
          </span>
        </div>
      </div>

      {/* Clinical Inquiry Prompt Chips */}
      <div className="bg-sky-50/70 border-b border-sky-100 px-3 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-sky-900 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Clinical History Prompts (Click to ask or type your own):
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            OPQRST / SOCRATES Framework
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {clinicalQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(q.query);
                setSelectedCategory(q.category);
                inputRef.current?.focus();
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-sky-100 text-sky-800 border border-sky-200/80 transition-colors whitespace-nowrap cursor-pointer shadow-2xs hover:border-sky-300 font-medium"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-700 text-sm mb-1">
              Begin Clinical Interaction
            </h4>
            <p className="text-xs max-w-md text-slate-500 mb-3">
              Introduce yourself to {patient.name} as their healthcare provider. Ask about symptom onset, quality, medical history, medications, and lifestyle.
            </p>
            <button
              onClick={() => {
                setInputText(`Hello ${patient.name}, I am your healthcare provider today. Can you tell me what brought you into the hospital?`);
                inputRef.current?.focus();
              }}
              className="text-xs px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
            >
              Start with Provider Greeting
            </button>
          </div>
        )}

        {messages.map((m) => {
          const isStudent = m.sender === 'student';
          const isSystem = m.sender === 'system';

          if (isSystem) {
            return (
              <div key={m.id} className="flex justify-center my-2">
                <span className="px-3 py-1 rounded-full bg-slate-200/80 text-slate-600 text-[11px] font-mono">
                  {m.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  {isStudent ? 'Healthcare Student' : patient.name}
                </span>
                {m.category && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-mono">
                    {m.category}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {m.timestamp}
                </span>
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isStudent
                    ? 'bg-sky-600 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>

                {/* Voice audio replay button for patient replies */}
                {!isStudent && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <button
                      onClick={() => handlePlayVoice(m.text)}
                      className="flex items-center gap-1 text-sky-600 hover:text-sky-800 transition-colors cursor-pointer font-medium"
                      title="Listen to patient speaking"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear Patient Voice</span>
                    </button>
                    <span className="text-[10px] italic text-slate-400">
                      Simulated Patient
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex flex-col items-start">
            <span className="text-[11px] text-slate-400 mb-1 px-1">
              {patient.name} is responding...
            </span>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-sky-100">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${patient.name} a clinical question (e.g., pain onset, allergies, medications)...`}
            className="flex-1 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 border border-slate-200 focus:border-sky-500 rounded-xl px-3.5 py-2.5 outline-none transition-all shadow-inner"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Educational Guidance:</span>
            <span>Do not rush to conclusions. Gather a complete history first.</span>
          </div>
          <span className="font-mono text-slate-400 hidden sm:inline">
            Enter ↵ to send
          </span>
        </div>
      </form>
    </div>
  );
};
