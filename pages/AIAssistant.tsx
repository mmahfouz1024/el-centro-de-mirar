
import React, { useState } from 'react';
import { Sparkles, Send, Loader2, BrainCircuit, UserCheck, CalendarDays, FileText } from 'lucide-react';
import { generateStudyPlan } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [level, setLevel] = useState('متوسط');
  const [target, setTarget] = useState('إتقان المحادثة الإسبانية خلال شهر');
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 p-6 lg:p-10 rounded-[2rem] text-white relative overflow-hidden shadow-2xl shadow-emerald-100">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 space-x-reverse mb-3">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
              <BrainCircuit size={28} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white">المخطط الذكي لـ El Centro de Mirar</h2>
          </div>
          <p className="text-emerald-50/90 text-sm lg:text-base leading-relaxed max-w-lg font-medium">
            تكنولوجيا الذكاء الاصطناعي لمساعدتكم في بناء رحلة تعليمية فريدة لكل طالب في El Centro de Mirar.
          </p>
        </div>
        <Sparkles className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 animate-pulse" />
      </div>
      {/* ... rest of the file ... */}
    </div>
  );
};

export default AIAssistant;
