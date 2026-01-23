
import React, { useState } from 'react';
import { Sparkles, Send, Loader2, BrainCircuit, UserCheck, CalendarDays, FileText } from 'lucide-react';
import { generateStudyPlan } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [level, setLevel] = useState('متوسط');
  const [target, setTarget] = useState('إتقان المحادثة الإسبانية خلال شهر');
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!studentName || !target) return;
    setLoading(true);
    setPlan(null);
    const result = await generateStudyPlan(studentName, level, target);
    setPlan(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-black text-slate-800 text-sm mb-4 border-b border-slate-50 pb-2">بيانات الخطة</h3>
              
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">اسم الطالب</label>
                 <div className="relative">
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/10"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="أحمد محمد..."
                    />
                    <UserCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">المستوى الحالي</label>
                 <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none appearance-none cursor-pointer"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                 >
                    <option value="مبتدئ">مبتدئ (A1-A2)</option>
                    <option value="متوسط">متوسط (B1-B2)</option>
                    <option value="متقدم">متقدم (C1-C2)</option>
                 </select>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">الهدف التعليمي</label>
                 <textarea 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none resize-none h-24"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="ما الذي يريد الطالب تحقيقه؟"
                 />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !studentName}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-xs shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center disabled:opacity-50"
              >
                 {loading ? <Loader2 className="animate-spin ml-2" size={16}/> : <Send className="ml-2" size={16}/>}
                 توليد الخطة المقترحة
              </button>
           </div>
        </div>

        <div className="lg:col-span-2">
           <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm min-h-[400px]">
              {plan ? (
                 <div className="prose prose-emerald max-w-none">
                    <h3 className="text-xl font-black text-emerald-800 mb-4 flex items-center">
                       <FileText className="ml-2" size={24} />
                       الخطة الدراسية المقترحة
                    </h3>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 font-medium">
                       {plan}
                    </div>
                 </div>
              ) : (
                 <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                       <CalendarDays size={32} />
                    </div>
                    <p className="font-bold text-sm">املأ البيانات لتوليد خطة دراسية مخصصة</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
