
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
  
  const [filterSupervisor, setFilterSupervisor] = useState('الكل');
  const [filterTeacher, setFilterTeacher] = useState('الكل');
  const [filterClass, setFilterClass] = useState('الكل');

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
      const matchClass = filterClass === 'الكل' || e.class_name === filterClass;
      return matchSupervisor && matchTeacher && matchClass;
    });
  }, [evaluations, filterSupervisor, filterTeacher, filterClass]);

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

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                    <User size={14} className="ml-1 text-blue-500" />
                    المحاضر
                </label>
                <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none"
                    value={filterTeacher}
                    onChange={e => setFilterTeacher(e.target.value)}
                >
                    <option value="الكل">كافة المحاضرين</option>
                    {[...new Set(evaluations.map(e => e.teacher_name))].map((t: any) => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            {/* ... other filters ... */}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ / المشرف</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">المحاضر والحلقة</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">جودة النت</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الكاميرا</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">التركيز</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الإدارة</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ملاحظات</th>
                    </tr>
                </thead>
                {/* ... (Body mapping with Lecturer label) ... */}
            </table>
        </div>
      </div>
    </div>
  );
};

export default EvaluationsList;
