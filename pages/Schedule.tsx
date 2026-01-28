import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarClock, 
  Clock, 
  Loader2, 
  GraduationCap,
  Search,
  ChevronDown,
  ArrowLeftRight
} from 'lucide-react';
import { db } from '../services/supabase';

const Schedule: React.FC<{ user?: any }> = ({ user }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTeacher, setFilterTeacher] = useState('الكل');
  const [searchTerm, setSearchTerm] = useState('');

  const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesData, teachersData] = await Promise.all([
        db.classes.getAll(),
        db.profiles.getTeachers()
      ]);
      setClasses(classesData || []);
      setTeachers(teachersData || []);
    } catch (error) {
      console.error("Schedule Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      const matchTeacher = filterTeacher === 'الكل' || c.teacher === filterTeacher;
      const matchSearch = (c.target_student || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchTeacher && matchSearch;
    });
  }, [classes, filterTeacher, searchTerm]);

  const scheduleData = useMemo(() => {
    const data: Record<string, any[]> = {};
    DAYS.forEach(day => { data[day] = []; });
    
    filteredClasses.forEach(cls => {
      if (cls.registration_day && data[cls.registration_day]) {
        data[cls.registration_day].push(cls);
      }
    });

    Object.keys(data).forEach(day => {
      data[day].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    });

    return data;
  }, [filteredClasses]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest">جاري تحميل الجدول الأسبوعي...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <CalendarClock className="ml-3 text-blue-700" size={32} />
            جدول المواعيد الأسبوعي
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">توزيع المحاضرات على أيام الأسبوع</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-huge border border-slate-100 shadow-sm space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
               <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
               <select 
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-11 pl-4 py-3 text-xs font-bold outline-none appearance-none cursor-pointer"
                 value={filterTeacher}
                 onChange={(e) => setFilterTeacher(e.target.value)}
               >
                  <option value="الكل">كافة المحاضرين</option>
                  {teachers.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
               </select>
               <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>

            <div className="relative">
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
               <input 
                 type="text" 
                 placeholder="بحث عن طالب أو حصة..." 
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-11 pl-4 py-3 text-xs font-bold outline-none"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3 gap-6">
        {DAYS.map(day => (
          <div key={day} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-sm">{day}</h3>
              <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-lg">{scheduleData[day].length} حصص</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {scheduleData[day].length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-2 opacity-50">
                  <Clock size={24} />
                  <p className="text-[10px] font-bold">لا توجد محاضرات</p>
                </div>
              ) : scheduleData[day].map((cls, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-[10px] font-black text-blue-700">
                         <Clock size={12} className="ml-1" />
                         {cls.start_time}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">{cls.duration}د</span>
                   </div>
                   <h4 className="text-xs font-black text-slate-800 mb-1 truncate">{cls.target_student || 'طالب غير محدد'}</h4>
                   <div className="flex items-center text-[9px] font-bold text-slate-500">
                      <GraduationCap size={10} className="ml-1 text-emerald-500" />
                      {cls.teacher}
                   </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;