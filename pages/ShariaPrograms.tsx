
import React, { useState } from 'react';
import { 
  Library, 
  Plus, 
  Search, 
  BookOpen, 
  Clock, 
  User, 
  Scroll, 
  Sparkles, 
  ChevronLeft, 
  X, 
  Loader2,
  Scale,
  ShieldCheck,
  History,
  Send,
  HelpCircle,
  ClipboardCheck,
  Award,
  BookMarked,
  DownloadCloud
} from 'lucide-react';
import { generateShariaQuiz, getShariaResources } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";

const INITIAL_PROGRAMS = [
  { id: '1', title: 'شرح العقيدة الواسطية', instructor: 'د. عبدالله عمر', category: 'عقيدة', duration: '3 أشهر', students: 45, status: 'نشط', progress: 65, icon: ShieldCheck, color: 'blue' },
  { id: '2', title: 'متن أبي شجاع في الفقه', instructor: 'أ. محمد يوسف', category: 'فقه', duration: '4 أشهر', students: 30, status: 'نشط', progress: 100, icon: Scale, color: 'emerald' },
  { id: '3', title: 'السيرة النبوية للمبتدئين', instructor: 'د. ياسر علي', category: 'سيرة', duration: '2 شهر', students: 60, status: 'قريباً', progress: 0, icon: History, color: 'amber' },
  { id: '4', title: 'الأربعون النووية', instructor: 'أ. خالد العتيبي', category: 'حديث', duration: '3 أشهر', students: 25, status: 'نشط', progress: 40, icon: Scroll, color: 'indigo' },
];

const ShariaPrograms: React.FC = () => {
  const [programs, setPrograms] = useState(INITIAL_PROGRAMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('الكل');

  const handleJoinProgram = (id: string) => {
    setPrograms(prev => prev.map(p => 
      p.id === id ? { ...p, students: p.students + 1 } : p
    ));
    alert('تم تسجيلك في البرنامج بنجاح! سيصلك إشعار بموعد الدرس القادم.');
  };

  const handleGenerateCurriculum = async () => {
    if (!subjectName) return;
    setLoading(true);
    setGeneratedContent(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `بصفتك متخصص في المناهج الشرعية، قم بتوليد خطة درسية شاملة لمادة "${subjectName}" لمركز تأصيل شرعي. تشمل الخطة: الأهداف، المراجع المقترحة، وتقسيم المنهج على 12 أسبوعاً. أجب بتنسيق Markdown احترافي بالعربية.`,
      });
      setGeneratedContent(response.text || "فشل توليد المنهج.");
    } catch (error) {
      console.error("AI Curriculum Error:", error);
      setGeneratedContent("حدث خطأ في الاتصال بالذكاء الاصطناعي.");
    } finally {
      setLoading(false);
    }
  };

  const startQuickQuiz = async (title: string) => {
    setSubjectName(title);
    setIsQuizOpen(true);
    setLoading(true);
    setGeneratedContent(null);
    const quiz = await generateShariaQuiz(title);
    setGeneratedContent(quiz || "عذراً، لم نتمكن من توليد الاختبار.");
    setLoading(false);
  };

  const openLibraryResources = async (title: string) => {
    setSubjectName(title);
    setIsLibraryOpen(true);
    setLoading(true);
    setGeneratedContent(null);
    const resources = await getShariaResources(title);
    setGeneratedContent(resources || "جاري البحث عن المصادر...");
    setLoading(false);
  };

  const filteredPrograms = activeTab === 'الكل' 
    ? programs 
    : programs.filter(p => p.category === activeTab);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Library className="ml-3 text-emerald-700" size={32} />
            البرامج والعلوم الشرعية
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">بناء المنهج التأصيلي لطلاب منصة تبصرة</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsGeneratorOpen(true)}
            className="bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl font-black text-sm flex items-center hover:bg-amber-100 transition-all border border-amber-100"
          >
            <Sparkles size={18} className="ml-2" />
            توليد منهج
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center shadow-xl shadow-emerald-100 hover:bg-emerald-800 transition-all"
          >
            <Plus size={18} className="ml-2" />
            إضافة مادة
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-3 space-x-reverse overflow-x-auto pb-2 no-scrollbar">
        {['الكل', 'عقيدة', 'فقه', 'سيرة', 'حديث'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap border ${
              activeTab === tab 
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-lg shadow-emerald-100' 
              : 'bg-white text-slate-500 border-slate-100 hover:border-emerald-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPrograms.map(prog => (
          <div key={prog.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-full h-1 bg-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-emerald-700 group-hover:text-white transition-all shadow-sm`}>
                <prog.icon size={24} />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <button 
                  onClick={() => openLibraryResources(prog.title)}
                  className="text-emerald-500 hover:text-emerald-600 p-2 rounded-xl hover:bg-emerald-50 transition-colors"
                  title="المكتبة المرجعية"
                >
                  <BookMarked size={18} />
                </button>
                <button 
                  onClick={() => startQuickQuiz(prog.title)}
                  className="text-amber-500 hover:text-amber-600 p-2 rounded-xl hover:bg-amber-50 transition-colors"
                  title="اختبار سريع"
                >
                  <HelpCircle size={18} />
                </button>
              </div>
            </div>

            <h4 className="text-lg font-black text-slate-800 mb-2 leading-tight">{prog.title}</h4>
            <div className="flex items-center text-slate-400 text-[11px] font-bold mb-6">
              <User size={12} className="ml-1.5 text-emerald-500" />
              {prog.instructor}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                <span className="text-[9px] font-black text-slate-400 block mb-0.5">الطلاب</span>
                <span className="text-xs font-black text-slate-700">{prog.students} طالب</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                <span className="text-[9px] font-black text-slate-400 block mb-0.5">المدة</span>
                <span className="text-xs font-black text-slate-700">{prog.duration}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                <span>نسبة الإنجاز</span>
                <span>{prog.progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-${prog.color}-500 rounded-full transition-all duration-1000`} 
                  style={{ width: `${prog.progress}%` }}
                ></div>
              </div>
            </div>

            <button 
              onClick={() => handleJoinProgram(prog.id)}
              className="w-full mt-6 bg-slate-900 text-white py-3.5 rounded-xl text-xs font-black hover:bg-emerald-800 transition-all shadow-lg active:scale-95"
            >
              الانضمام للبرنامج
            </button>
          </div>
        ))}
      </div>

      {/* Curriculum Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsGeneratorOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-amber-50">
              <div className="flex items-center">
                <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm ml-4">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-900">المولد الذكي للمناهج</h3>
                  <p className="text-xs font-bold text-amber-600/70 mt-1">بناء خطط دراسية شرعية باستخدام AI</p>
                </div>
              </div>
              <button onClick={() => setIsGeneratorOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-white rounded-xl"><X size={20}/></button>
            </div>
            
            <div className="p-8 space-y-6 flex-1 overflow-y-auto">
              {!generatedContent ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">اسم المادة أو المتن</label>
                    <input 
                      type="text" 
                      placeholder="مثال: العقيدة الطحاوية، الفقه الميسر..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleGenerateCurriculum}
                    disabled={loading || !subjectName}
                    className="w-full bg-amber-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-amber-700 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin ml-2" size={20}/> : <Send className="ml-2" size={20}/>}
                    توليد الخطة الدراسية
                  </button>
                </div>
              ) : (
                <div className="prose prose-amber max-w-none text-right" dir="rtl">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed font-medium text-slate-600 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    {generatedContent}
                  </div>
                  <button onClick={() => setGeneratedContent(null)} className="mt-4 text-xs font-black text-amber-600 hover:underline">توليد خطة أخرى</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {isQuizOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsQuizOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-amber-50">
              <div className="flex items-center">
                <div className="p-3 bg-white rounded-2xl text-amber-500 shadow-sm ml-4">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-900">اختبار سريع: {subjectName}</h3>
                  <p className="text-xs font-bold text-amber-600/70 mt-1">قياس المستوى في المادة</p>
                </div>
              </div>
              <button onClick={() => setIsQuizOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-white rounded-xl"><X size={20}/></button>
            </div>
            <div className="p-8 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-amber-500 mb-4" size={40}/><p className="font-bold text-slate-400">جاري إعداد الأسئلة...</p></div>
                ) : (
                    <div className="prose prose-amber max-w-none text-right" dir="rtl">
                       <div className="whitespace-pre-wrap text-sm leading-relaxed font-medium text-slate-600 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          {generatedContent}
                       </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLibraryOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-emerald-50">
              <div className="flex items-center">
                <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm ml-4">
                  <BookMarked size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-900">المكتبة المرجعية: {subjectName}</h3>
                  <p className="text-xs font-bold text-emerald-600/70 mt-1">أهم المصادر والكتب المقترحة</p>
                </div>
              </div>
              <button onClick={() => setIsLibraryOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-white rounded-xl"><X size={20}/></button>
            </div>
            <div className="p-8 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500 mb-4" size={40}/><p className="font-bold text-slate-400">جاري البحث عن المصادر...</p></div>
                ) : (
                    <div className="prose prose-emerald max-w-none text-right" dir="rtl">
                       <div className="whitespace-pre-wrap text-sm leading-relaxed font-medium text-slate-600 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          {generatedContent}
                       </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Add Program Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300 text-right">
                <h3 className="text-xl font-black text-slate-800 mb-4">إضافة برنامج جديد</h3>
                <p className="text-slate-400 text-sm font-bold mb-6">هذه الميزة قيد التطوير حالياً.</p>
                <button onClick={() => setIsModalOpen(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">إغلاق</button>
            </div>
          </div>
      )}

    </div>
  );
};

export default ShariaPrograms;
