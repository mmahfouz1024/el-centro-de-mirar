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
  FileText
} from 'lucide-react';
import { db, formatAppDate } from '../services/supabase';

const EvaluationsList: React.FC = () => {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterSupervisor, setFilterSupervisor] = useState('الكل');
  const [filterTeacher, setFilterTeacher] = useState('الكل');
  const [filterClass, setFilterClass] = useState('الكل');

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const data = await db.classEvaluations.getAll();
      setEvaluations(data || []);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique values for filters
  const uniqueSupervisors = useMemo(() => [...new Set(evaluations.map(e => e.evaluator_name))].filter(Boolean), [evaluations]);
  const uniqueTeachers = useMemo(() => [...new Set(evaluations.map(e => e.teacher_name))].filter(Boolean), [evaluations]);
  const uniqueClasses = useMemo(() => [...new Set(evaluations.map(e => e.class_name))].filter(Boolean), [evaluations]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(e => {
      const matchSupervisor = filterSupervisor === 'الكل' || e.evaluator_name === filterSupervisor;
      const matchTeacher = filterTeacher === 'الكل' || e.teacher_name === filterTeacher;
      const matchClass = filterClass === 'الكل' || e.class_name === filterClass;
      return matchSupervisor && matchTeacher && matchClass;
    });
  }, [evaluations, filterSupervisor, filterTeacher, filterClass]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600 bg-emerald-50';
    if (score >= 5) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest">جاري تحميل سجل التقييمات...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
          <ClipboardList size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800">سجل التقييمات الشامل</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">متابعة تقارير المشرفين وأداء الحلقات</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center mb-4 space-x-2 space-x-reverse text-slate-400">
            <Filter size={18} />
            <span className="text-xs font-black uppercase tracking-widest">تصفية النتائج</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                    <UserCheck size={14} className="ml-1 text-purple-500" />
                    المشرف (المُقَيِّم)
                </label>
                <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/10 cursor-pointer"
                    value={filterSupervisor}
                    onChange={e => setFilterSupervisor(e.target.value)}
                >
                    <option value="الكل">كافة المشرفين</option>
                    {uniqueSupervisors.map((s: any) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                    <User size={14} className="ml-1 text-blue-500" />
                    المعلم
                </label>
                <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
                    value={filterTeacher}
                    onChange={e => setFilterTeacher(e.target.value)}
                >
                    <option value="الكل">كافة المعلمين</option>
                    {uniqueTeachers.map((t: any) => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                    <BookOpen size={14} className="ml-1 text-emerald-500" />
                    الحلقة
                </label>
                <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
                    value={filterClass}
                    onChange={e => setFilterClass(e.target.value)}
                >
                    <option value="الكل">كافة الحلقات</option>
                    {uniqueClasses.map((c: any) => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ / المشرف</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">المعلم والحلقة</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">جودة النت</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الكاميرا</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">التركيز</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الإدارة</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ملاحظات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredEvaluations.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-bold">
                                لا توجد تقييمات مطابقة للفلاتر المختارة
                            </td>
                        </tr>
                    ) : (
                        filteredEvaluations.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800 text-xs">{formatAppDate(item.created_at)}</div>
                                    <div className="text-[10px] text-purple-600 font-black mt-1 flex items-center">
                                        <UserCheck size={12} className="ml-1" />
                                        {item.evaluator_name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-black text-slate-700 text-sm">{item.teacher_name}</div>
                                    <div className="text-[10px] text-slate-400 mt-1">{item.class_name}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black ${getScoreColor(item.internet_quality)}`}>
                                        <Wifi size={12} className="ml-1" />
                                        {item.internet_quality}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black ${getScoreColor(item.camera_usage)}`}>
                                        <Camera size={12} className="ml-1" />
                                        {item.camera_usage}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black ${getScoreColor(item.focus_level)}`}>
                                        <BrainCircuit size={12} className="ml-1" />
                                        {item.focus_level}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black ${getScoreColor(item.management_skills)}`}>
                                        <Users size={12} className="ml-1" />
                                        {item.management_skills}
                                    </div>
                                </td>
                                <td className="px-6 py-4 w-1/4">
                                    {item.notes ? (
                                        <div className="text-[10px] text-slate-500 font-medium bg-slate-50 p-2 rounded-xl leading-relaxed">
                                            {item.notes}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-slate-300">-</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default EvaluationsList;