
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  User, 
  BookOpen, 
  UserCheck, 
  Loader2, 
  Wifi, 
  Camera, 
  BrainCircuit, 
  Users,
  FileText,
  Calendar,
  X,
  ShieldCheck,
  ChevronLeft,
  Activity,
  Star,
  GraduationCap
} from 'lucide-react';
import { db, formatAppDate } from '../services/supabase';

const EvaluationsList: React.FC = () => {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterSupervisor, setFilterSupervisor] = useState('الكل');
  const [filterTeacher, setFilterTeacher] = useState('الكل');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => { fetchEvaluations(); }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const data = await db.classEvaluations.getAll();
      setEvaluations(data || []);
    } finally { setLoading(false); }
  };

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(e => {
      const matchSupervisor = filterSupervisor === 'الكل' || e.evaluator_name === filterSupervisor;
      const matchTeacher = filterTeacher === 'الكل' || e.teacher_name === filterTeacher;
      const matchDate = !filterDate || e.created_at.includes(filterDate);
      return matchSupervisor && matchTeacher && matchDate;
    });
  }, [evaluations, filterSupervisor, filterTeacher, filterDate]);

  const uniqueSupervisors = useMemo(() => [...new Set(evaluations.map(e => e.evaluator_name))].filter(Boolean), [evaluations]);
  const uniqueTeachers = useMemo(() => [...new Set(evaluations.map(e => e.teacher_name))].filter(Boolean), [evaluations]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-sm">
            <ClipboardList size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">سجل التقييمات التاريخي</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">أرشيف تقارير الجودة المربوطة باسم المحاضر والطالب</p>
          </div>
        </div>
        
        <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black flex items-center shadow-xl">
           <Activity size={18} className="ml-2 text-amber-400" />
           {filteredEvaluations.length} تقرير مسجل
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                    <User size={14} className="ml-1 text-blue-500" /> المحاضر
                </label>
                <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none"
                    value={filterTeacher}
                    onChange={e => setFilterTeacher(e.target.value)}
                >
                    <option value="الكل">كافة المحاضرين</option>
                    {uniqueTeachers.map((t: any) => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                    <ShieldCheck size={14} className="ml-1 text-purple-600" /> المشرف المُقيّم
                </label>
                <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none"
                    value={filterSupervisor}
                    onChange={e => setFilterSupervisor(e.target.value)}
                >
                    <option value="الكل">كافة المشرفين</option>
                    {uniqueSupervisors.map((s: any) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                    <Calendar size={14} className="ml-1 text-amber-600" /> تاريخ اليوم
                </label>
                <input 
                  type="date"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                />
            </div>

            <div className="flex items-end">
               <button 
                onClick={() => { setFilterTeacher('الكل'); setFilterSupervisor('الكل'); setFilterDate(''); }}
                className="w-full py-3.5 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
               >
                 إعادة ضبط الفلاتر
               </button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-300">
             <Loader2 className="animate-spin mx-auto mb-4" size={48} />
             <p className="font-bold">جاري تحميل الأرشيف...</p>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="py-32 text-center text-slate-300">
             <ClipboardList size={80} className="mx-auto mb-6 opacity-20" />
             <p className="text-xl font-black">لا توجد سجلات مطابقة للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ / المشرف</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">المحاضر والطالب</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">جودة النت</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الكاميرا</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">التركيز</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الإدارة</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المعدل</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ملاحظات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredEvaluations.map(ev => {
                      const avg = (ev.internet_quality + ev.camera_usage + ev.focus_level + ev.management_skills) / 4;
                      return (
                        <tr key={ev.id} className="group hover:bg-purple-50/20 transition-all">
                          <td className="px-6 py-4">
                             <div className="text-sm font-black text-slate-800">{new Date(ev.created_at).toLocaleDateString('ar-EG')}</div>
                             <div className="text-[9px] font-bold text-purple-600 flex items-center mt-0.5">
                                <ShieldCheck size={10} className="ml-1" /> {ev.evaluator_name}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="text-sm font-black text-slate-800">{ev.teacher_name}</div>
                             <div className="text-[9px] font-bold text-emerald-600 flex items-center mt-0.5">
                                <GraduationCap size={10} className="ml-1" /> {ev.student_name || ev.class_name}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${ev.internet_quality >= 8 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{ev.internet_quality}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${ev.camera_usage >= 8 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{ev.camera_usage}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${ev.focus_level >= 8 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{ev.focus_level}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${ev.management_skills >= 8 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{ev.management_skills}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <div className={`text-sm font-black ${avg >= 8 ? 'text-emerald-600' : avg >= 5 ? 'text-amber-500' : 'text-rose-500'}`}>
                                {avg.toFixed(1)}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="text-[10px] font-bold text-slate-500 max-w-xs line-clamp-1 group-hover:line-clamp-none transition-all cursor-default">
                                {ev.notes || '---'}
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationsList;
