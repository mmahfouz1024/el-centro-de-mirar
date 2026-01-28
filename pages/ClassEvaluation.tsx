
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck, 
  User, 
  Wifi, 
  Camera, 
  BrainCircuit, 
  Users, 
  Save, 
  Loader2,
  TrendingUp,
  Search,
  PlusCircle,
  Eye,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/supabase';

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
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [allEvaluations, setAllEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [ratings, setRatings] = useState({
    internet_quality: 10,
    camera_usage: 10,
    focus_level: 10,
    management_skills: 10
  });
  
  const [notes, setNotes] = useState('');

  const isHighLevel = user?.role === 'manager' || user?.role === 'general_supervisor' || user?.role === 'supervisor';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teachersData, studentsData, evalsData] = await Promise.all([
        db.profiles.getTeachers(),
        db.students.getAll(),
        db.classEvaluations.getAll()
      ]);
      setTeachers(teachersData || []);
      setStudents(studentsData || []);
      setAllEvaluations(evalsData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudentsForTeacher = useMemo(() => {
    if (!selectedTeacher) return [];
    return students.filter(s => s.teacher_name === selectedTeacher);
  }, [students, selectedTeacher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedStudent) {
      alert('يرجى اختيار المحاضر والطالب أولاً');
      return;
    }

    const avgScore = (ratings.internet_quality + ratings.camera_usage + ratings.focus_level + ratings.management_skills) / 4;

    setSubmitting(true);
    try {
      await db.classEvaluations.create({
        teacher_name: selectedTeacher,
        student_name: selectedStudent,
        evaluator_name: user?.full_name || 'مشرف',
        ...ratings,
        notes,
        created_at: new Date().toISOString()
      });
      
      if (avgScore < 5) {
        alert('⚠️ تنبيه: تم تسجيل تقييم منخفض (أقل من 5/10). سيتم إخطار الإدارة فوراً لمراجعة أداء المحاضر في هذه الحصة.');
      } else {
        alert('تم حفظ التقييم بنجاح');
      }

      setNotes('');
      setSelectedStudent('');
      setSelectedTeacher('');
      fetchData();
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  // عرض آخر التقييمات المرصودة بدلاً من الإحصائيات
  const recentEvaluations = useMemo(() => {
    return [...allEvaluations]
      .filter(ev => 
        ev.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (ev.student_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15);
  }, [allEvaluations, searchTerm]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest">جاري مزامنة بيانات الجودة...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
            <ClipboardCheck size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">تقييم جودة الحصص (متابعة لحظية)</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">تقييم أداء المحاضر مع الطالب قبل أو أثناء تسجيل الحصة</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 flex items-center">
                <PlusCircle size={20} className="ml-2 text-blue-500" />
                إدخال تقييم جديد
              </h3>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">مراقبة مباشرة</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                    <User size={14} className="ml-1 text-blue-600" />
                    المحاضر
                  </label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                    value={selectedTeacher}
                    onChange={(e) => { setSelectedTeacher(e.target.value); setSelectedStudent(''); }}
                    required
                  >
                    <option value="">-- اختر المحاضر --</option>
                    {teachers.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                    <GraduationCap size={14} className="ml-1 text-emerald-600" />
                    الطالب (الحصة الحالية)
                  </label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer disabled:opacity-50"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    disabled={!selectedTeacher}
                    required
                  >
                    <option value="">-- اختر الطالب الجاري تقييمه --</option>
                    {filteredStudentsForTeacher.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RatingInput label="جودة الإنترنت والاتصال" value={ratings.internet_quality} onChange={(v: any) => setRatings({...ratings, internet_quality: v})} icon={Wifi} />
                <RatingInput label="التزام المحاضر بفتح الكاميرا" value={ratings.camera_usage} onChange={(v: any) => setRatings({...ratings, camera_usage: v})} icon={Camera} />
                <RatingInput label="تركيز المحاضر واستيعابه" value={ratings.focus_level} onChange={(v: any) => setRatings({...ratings, focus_level: v})} icon={BrainCircuit} />
                <RatingInput label="مهارات إدارة الحصة والوقت" value={ratings.management_skills} onChange={(v: any) => setRatings({...ratings, management_skills: v})} icon={Users} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">ملاحظات المشرف الإضافية</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none h-32"
                  placeholder="اكتب أي ملاحظات فنية أو تربوية لاحظتها خلال التقييم..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center active:scale-95 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin ml-3" size={24} /> : <Save className="ml-3" size={24} />}
                اعتماد وحفظ تقرير التقييم
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: Recent Evaluations Section */}
        {isHighLevel && (
           <div className="xl:col-span-5 space-y-6">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full flex flex-col">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h3 className="text-xl font-black text-slate-800">آخر التقييمات المرصودة</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">تتبع التقييمات اللحظية المدخلة للنظام</p>
                    </div>
                 </div>

                 <div className="relative mb-6">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      type="text" 
                      placeholder="بحث عن محاضر أو طالب..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-11 pl-4 py-3 text-xs font-bold outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>

                 <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {recentEvaluations.length === 0 ? (
                       <div className="text-center py-20 text-slate-300">
                          <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                          <p className="text-sm font-bold">لا توجد تقييمات مرصودة حالياً</p>
                       </div>
                    ) : recentEvaluations.map((ev: any) => {
                       const avg = (ev.internet_quality + ev.camera_usage + ev.focus_level + ev.management_skills) / 4;
                       const qualityPercent = Math.round(avg * 10);
                       const dateObj = new Date(ev.created_at);
                       const dayName = dateObj.toLocaleDateString('ar-EG', { weekday: 'long' });
                       const dateStr = dateObj.toLocaleDateString('ar-EG');

                       return (
                         <div key={ev.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group relative overflow-hidden">
                            {/* Day and Date Badge */}
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                               <div className="flex items-center text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                  <Calendar size={10} className="ml-1" />
                                  اليوم: {dayName}
                               </div>
                               <div className="flex items-center text-[9px] font-black text-slate-400">
                                  <Clock size={10} className="ml-1" />
                                  التاريخ: {dateStr}
                               </div>
                            </div>

                            <div className="flex justify-between items-start mb-3">
                               <div className="flex items-center space-x-3 space-x-reverse">
                                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-blue-600 shadow-sm">
                                     {ev.teacher_name[0]}
                                  </div>
                                  <div>
                                     <h4 className="text-sm font-black text-slate-800">{ev.teacher_name}</h4>
                                     <div className="flex items-center text-[9px] font-bold text-emerald-600 mt-0.5">
                                        <GraduationCap size={10} className="ml-1" />
                                        الطالب: {ev.student_name || ev.class_name}
                                     </div>
                                  </div>
                               </div>
                               <div className="text-left flex flex-col items-end">
                                  <span className={`text-lg font-black ${qualityPercent >= 85 ? 'text-emerald-600' : qualityPercent >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                     {qualityPercent}%
                                  </span>
                                  {avg < 5 && (
                                     <div className="flex items-center text-[8px] font-black text-rose-500 uppercase bg-rose-50 px-1.5 py-0.5 rounded mt-1">
                                        <AlertTriangle size={8} className="ml-1" />
                                        إنذار جودة
                                     </div>
                                  )}
                               </div>
                            </div>
                            
                            {ev.notes && (
                               <p className="text-[9px] font-bold text-slate-400 mt-2 line-clamp-1 italic">
                                  "{ev.notes}"
                               </p>
                            )}

                            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-3">
                               <div 
                                  className={`h-full transition-all duration-1000 ${qualityPercent >= 85 ? 'bg-emerald-500' : qualityPercent >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                  style={{ width: `${qualityPercent}%` }}
                               ></div>
                            </div>
                         </div>
                       );
                    })}
                 </div>

                 <div className="mt-8 pt-6 border-t border-slate-100">
                    <button 
                      onClick={() => navigate('/evaluations-list')}
                      className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-inner"
                    >
                       <Eye size={16} className="ml-2" />
                       فتح السجل التاريخي الكامل
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ClassEvaluation;
