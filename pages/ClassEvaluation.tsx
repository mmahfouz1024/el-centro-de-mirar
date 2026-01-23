
// ... existing imports ...
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck, 
  User, 
  BookOpen, 
  Wifi, 
  Camera, 
  BrainCircuit, 
  Users, 
  Save, 
  Loader2,
  CheckCircle2,
  Star,
  Activity,
  UserCheck,
  TrendingUp,
  Search,
  MessageSquare,
  ShieldCheck,
  Percent,
  PlusCircle,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { db, formatAppDate } from '../services/supabase';

const RatingInput = ({ label, value, onChange, icon: Icon }: any) => (
  // ... (RatingInput logic remains same)
  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <label className="flex items-center text-sm font-black text-slate-700">
        <Icon size={20} className="ml-2 text-blue-600 group-hover:scale-110 transition-transform" />
        {label}
      </label>
      <span className={`text-lg font-black ${value >= 8 ? 'text-emerald-600' : value >= 5 ? 'text-amber-500' : 'text-rose-500'}`}>
        {value}/10
      </span>
    </div>
    <div className="flex gap-1 justify-between">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(num)}
          className={`flex-1 h-10 rounded-lg font-black text-xs transition-all ${
            value >= num 
              ? 'bg-blue-600 text-white shadow-md transform scale-105' 
              : 'bg-white text-slate-300 hover:bg-blue-50 border border-slate-100'
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  </div>
);

const ClassEvaluation: React.FC<{ user?: any }> = ({ user }) => {
  // ... (State and fetch logic same)
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [allEvaluations, setAllEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [ratings, setRatings] = useState({
    internet_quality: 10,
    camera_usage: 10,
    focus_level: 10,
    management_skills: 10
  });
  
  const [notes, setNotes] = useState('');

  const isHighLevel = user?.role === 'manager' || user?.role === 'general_supervisor';
  const isGeneralSupervisor = user?.role === 'general_supervisor';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teachersData, classesData, evalsData] = await Promise.all([
        db.profiles.getTeachers(),
        db.classes.getAll(),
        db.classEvaluations.getAll()
      ]);
      setTeachers(teachersData || []);
      setClasses(classesData || []);
      setAllEvaluations(evalsData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const teacherAnalysis = useMemo(() => {
    if (!isHighLevel) return [];

    const stats: Record<string, any> = {};
    
    allEvaluations.forEach(ev => {
      if (!stats[ev.teacher_name]) {
        stats[ev.teacher_name] = {
          name: ev.teacher_name,
          evaluationsCount: 0,
          totalScore: 0,
          supervisors: new Set(),
          lastEval: ev.created_at,
          evals: []
        };
      }
      
      const avgScore = (ev.internet_quality + ev.camera_usage + ev.focus_level + ev.management_skills) / 4;
      stats[ev.teacher_name].totalScore += avgScore;
      stats[ev.teacher_name].evaluationsCount += 1;
      stats[ev.teacher_name].supervisors.add(ev.evaluator_name);
      stats[ev.teacher_name].evals.push(ev);
    });

    return Object.values(stats)
      .map(s => ({
        ...s,
        qualityPercent: Math.round((s.totalScore / s.evaluationsCount) * 10),
        supervisorsList: Array.from(s.supervisors)
      }))
      .filter(s => s.name.includes(searchTerm))
      .sort((a, b) => b.qualityPercent - a.qualityPercent);
  }, [allEvaluations, isHighLevel, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <ClipboardCheck size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">تقييم الحصة</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              {isGeneralSupervisor ? 'رصد ومتابعة جودة التعليم' : 'نموذج تقييم أداء الحلقات اليومي'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {!isGeneralSupervisor && (
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 h-full">
              <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center">
                <PlusCircle size={20} className="ml-2 text-blue-500" />
                إدخال تقييم جديد
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                    <User size={14} className="ml-1 text-blue-600" />
                    المحاضر
                  </label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                    value={selectedTeacher}
                    onChange={(e) => { setSelectedTeacher(e.target.value); setSelectedClass(''); }}
                  >
                    <option value="">-- اختر المحاضر --</option>
                    {teachers.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
                  </select>
                </div>
                {/* ... other form fields ... */}
              </div>
            </div>
          </div>
        )}

        {isHighLevel && (
           <div className={`${isGeneralSupervisor ? 'xl:col-span-12' : 'xl:col-span-5'} space-y-6`}>
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full flex flex-col">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h3 className="text-xl font-black text-slate-800">مؤشرات جودة التعليم</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">تراكم تقييمات المشرفين للهيئة التعليمية</p>
                    </div>
                 </div>

                 {isGeneralSupervisor && (
                    <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start text-blue-700">
                       <ShieldAlert size={18} className="ml-3 mt-0.5 shrink-0" />
                       <p className="text-xs font-bold leading-relaxed">
                          أهلاً بك يا مشرف عام النظم. بصفتك مشرفاً عاماً، تقتصر صلاحياتك في هذه الصفحة على متابعة جودة أداء المحاضرين من خلال تقارير المشرفين المباشرين.
                       </p>
                    </div>
                 )}

                 <div className="relative mb-6">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      type="text" 
                      placeholder="بحث عن محاضر..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-11 pl-4 py-3 text-xs font-bold outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 {/* ... (Teacher cards with Lecturer label) ... */}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ClassEvaluation;
