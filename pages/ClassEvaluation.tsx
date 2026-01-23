
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

  // حساب إحصائيات المعلمين للمشرف العام
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

  const availableClasses = classes.filter(c => c.teacher === selectedTeacher);

  const handleSubmit = async () => {
    if (isGeneralSupervisor) return; // حماية إضافية
    if (!selectedTeacher || !selectedClass) {
      alert('يرجى اختيار المعلم والحلقة');
      return;
    }

    setSubmitting(true);
    try {
      await db.classEvaluations.create({
        teacher_name: selectedTeacher,
        class_name: selectedClass,
        internet_quality: ratings.internet_quality,
        camera_usage: ratings.camera_usage,
        focus_level: ratings.focus_level,
        management_skills: ratings.management_skills,
        notes,
        evaluator_name: user?.full_name || 'مشرف'
      });
      alert('تم حفظ التقييم بنجاح');
      
      fetchData();
      setRatings({ internet_quality: 10, camera_usage: 10, focus_level: 10, management_skills: 10 });
      setNotes('');
      setSelectedClass('');
      setSelectedTeacher('');
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest">جاري تحميل البيانات...</p>
    </div>
  );

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
        
        {isHighLevel && (
           <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center">
              {isGeneralSupervisor ? <Eye className="text-emerald-600 ml-2" size={20} /> : <TrendingUp className="text-emerald-600 ml-2" size={20} />}
              <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">
                {isGeneralSupervisor ? 'وضع المشاهدة والمتابعة فقط' : 'ميزة المشرف العام: رؤية تحليلية مفعلة'}
              </span>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Side: Evaluation Form - Hidden for General Supervisor */}
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
                    المعلم
                  </label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                    value={selectedTeacher}
                    onChange={(e) => { setSelectedTeacher(e.target.value); setSelectedClass(''); }}
                  >
                    <option value="">-- اختر المعلم --</option>
                    {teachers.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                    <BookOpen size={14} className="ml-1 text-emerald-600" />
                    الحلقة
                  </label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer disabled:opacity-50"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    disabled={!selectedTeacher}
                  >
                    <option value="">-- اختر الحلقة --</option>
                    {availableClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RatingInput 
                  label="جودة الإنترنت" 
                  value={ratings.internet_quality} 
                  onChange={(val: number) => setRatings({...ratings, internet_quality: val})}
                  icon={Wifi}
                />
                <RatingInput 
                  label="فتح الكاميرا" 
                  value={ratings.camera_usage} 
                  onChange={(val: number) => setRatings({...ratings, camera_usage: val})}
                  icon={Camera}
                />
                <RatingInput 
                  label="التركيز في الحلقة" 
                  value={ratings.focus_level} 
                  onChange={(val: number) => setRatings({...ratings, focus_level: val})}
                  icon={BrainCircuit}
                />
                <RatingInput 
                  label="إدارة الحلقة" 
                  value={ratings.management_skills} 
                  onChange={(val: number) => setRatings({...ratings, management_skills: val})}
                  icon={Users}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">ملاحظات إضافية</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none h-32 resize-none focus:ring-4 focus:ring-blue-500/10"
                  placeholder="أي ملاحظات أخرى حول سير الحلقة..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-slate-900/20 flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin ml-3" size={24} /> : <CheckCircle2 className="ml-3" size={24} />}
                حفظ واعتماد التقييم
              </button>
            </div>
          </div>
        )}

        {/* Right Side: High Level Insights - Full Width for GS */}
        {isHighLevel && (
           <div className={`${isGeneralSupervisor ? 'xl:col-span-12' : 'xl:col-span-5'} space-y-6`}>
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full flex flex-col">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h3 className="text-xl font-black text-slate-800">مؤشرات جودة التعليم</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">تراكم تقييمات المشرفين للهيئة التعليمية</p>
                    </div>
                    <Activity className="text-emerald-500" size={28} />
                 </div>

                 {isGeneralSupervisor && (
                    <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start text-blue-700">
                       <ShieldAlert size={18} className="ml-3 mt-0.5 shrink-0" />
                       <p className="text-xs font-bold leading-relaxed">
                          أهلاً بك يا مشرف عام النظم. بصفتك مشرفاً عاماً، تقتصر صلاحياتك في هذه الصفحة على متابعة جودة أداء المعلمين من خلال تقارير المشرفين المباشرين، ولا يمكنك إضافة تقييمات يدوية للحصص.
                       </p>
                    </div>
                 )}

                 {/* البحث في المعلمين */}
                 <div className="relative mb-6">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      type="text" 
                      placeholder="بحث عن معلم..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-11 pl-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>

                 <div className={`grid ${isGeneralSupervisor ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4 flex-1 overflow-y-auto no-scrollbar max-h-[800px]`}>
                    {teacherAnalysis.length === 0 ? (
                       <div className="col-span-full text-center py-20 text-slate-300">
                          <Users size={48} className="mx-auto mb-3 opacity-20" />
                          <p className="font-bold">لا توجد بيانات تقييم كافية للتحليل</p>
                       </div>
                    ) : (
                       teacherAnalysis.map((stat, idx) => (
                          <div key={idx} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 group hover:border-emerald-200 transition-all h-fit">
                             <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 font-black shadow-sm group-hover:scale-110 transition-transform">
                                      {stat.name[0]}
                                   </div>
                                   <div>
                                      <h4 className="text-sm font-black text-slate-800">{stat.name}</h4>
                                      <p className="text-[9px] text-slate-400 font-bold">{stat.evaluationsCount} تقييمات مسجلة</p>
                                   </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center ${
                                   stat.qualityPercent >= 85 ? 'bg-emerald-50 text-emerald-600' : 
                                   stat.qualityPercent >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                   <Percent size={12} className="ml-1" />
                                   {stat.qualityPercent}%
                                </div>
                             </div>

                             {/* شريط التقدم */}
                             <div className="w-full h-1.5 bg-slate-200 rounded-full mb-4 overflow-hidden">
                                <div 
                                   className={`h-full transition-all duration-1000 ${
                                      stat.qualityPercent >= 85 ? 'bg-emerald-500' : 
                                      stat.qualityPercent >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                   }`} 
                                   style={{ width: `${stat.qualityPercent}%` }}
                                ></div>
                             </div>

                             {/* قائمة المشرفين */}
                             <div className="pt-3 border-t border-slate-100 space-y-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                   <ShieldCheck size={10} className="ml-1 text-purple-500" />
                                   المشرفون المقيمون:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                   {stat.supervisorsList.map((supName: any, sIdx: number) => (
                                      <span key={sIdx} className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-600">
                                         {supName}
                                      </span>
                                   ))}
                                </div>
                             </div>
                             
                             {/* آخر التقييمات */}
                             <div className="mt-3 flex justify-between items-center text-[9px] font-bold text-slate-400">
                                <span>آخر رصد: {formatAppDate(stat.lastEval)}</span>
                                <button className="text-blue-600 hover:underline">عرض التفاصيل</button>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ClassEvaluation;
