
import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarClock, 
  Clock, 
  User, 
  ShieldCheck, 
  Loader2, 
  GraduationCap,
  CalendarDays,
  Search,
  BookOpen,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';
import { db } from '../services/supabase';

interface ScheduleProps {
  user?: any;
}

const WEEK_DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const Schedule: React.FC<ScheduleProps> = ({ user }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('الكل');
  const [filterSupervisor, setFilterSupervisor] = useState('الكل');
  const [filterDay, setFilterDay] = useState('الكل');

  const isHighLevel = user?.role === 'manager' || user?.role === 'general_supervisor';

  useEffect(() => {
    fetchScheduleData();
  }, [user]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const [allStudents, allProfiles] = await Promise.all([
        db.students.getAll(),
        db.profiles.getAll()
      ]);
      
      let filteredStudents = allStudents || [];

      // تطبيق صلاحيات العرض الأساسية
      if (user?.role === 'supervisor') {
        filteredStudents = filteredStudents.filter((s: any) => s.supervisor_name === user.full_name);
      } else if (user?.role === 'teacher') {
        filteredStudents = filteredStudents.filter((s: any) => s.teacher_name === user.full_name);
      }

      setStudents(filteredStudents);
      setProfiles(allProfiles || []);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const teachersList = useMemo(() => profiles.filter(p => p.role === 'teacher'), [profiles]);
  const supervisorsList = useMemo(() => profiles.filter(p => p.role === 'supervisor' || p.role === 'general_supervisor'), [profiles]);

  // تحويل وقت "HH:MM" إلى دقائق لغرض الترتيب
  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // معالجة البيانات وتطبيق الفلاتر المتقدمة
  const scheduleData = useMemo(() => {
    const scheduleMap: Record<string, any[]> = {};
    WEEK_DAYS.forEach(day => scheduleMap[day] = []);

    students.forEach(student => {
      // 1. فلتر البحث بالاسم
      const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      // 2. فلتر المعلم
      const matchTeacher = filterTeacher === 'الكل' || student.teacher_name === filterTeacher;
      // 3. فلتر المشرف
      const matchSupervisor = filterSupervisor === 'الكل' || student.supervisor_name === filterSupervisor;

      if (matchSearch && matchTeacher && matchSupervisor) {
        if (student.preferred_schedule && typeof student.preferred_schedule === 'object') {
          Object.entries(student.preferred_schedule).forEach(([day, times]: [string, any]) => {
            // 4. فلتر اليوم
            const matchDay = filterDay === 'الكل' || day === filterDay;
            
            if (scheduleMap[day] && matchDay) {
              scheduleMap[day].push({
                studentId: student.id,
                studentName: student.name,
                teacherName: student.teacher_name,
                supervisorName: student.supervisor_name,
                from: times.from,
                to: times.to,
                level: student.level,
                branch: student.branch
              });
            }
          });
        }
      }
    });

    // ترتيب المواعيد داخل كل يوم
    Object.keys(scheduleMap).forEach(day => {
      scheduleMap[day].sort((a, b) => timeToMinutes(a.from) - timeToMinutes(b.from));
    });

    return scheduleMap;
  }, [students, searchTerm, filterTeacher, filterSupervisor, filterDay]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterTeacher('الكل');
    setFilterSupervisor('الكل');
    setFilterDay('الكل');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <CalendarClock className="ml-3 text-blue-700" size={32} />
            جدول المواعيد الأسبوعي
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">تنظيم مواعيد الحلقات وإدارة الكثافة العددية</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 ml-2 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">عرض حي للمواعيد</span>
           </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-400">
               <Filter size={18} className="ml-2" />
               <h3 className="text-xs font-black uppercase tracking-widest">أدوات التحكم والبحث الذكي</h3>
            </div>
            {(searchTerm || filterTeacher !== 'الكل' || filterSupervisor !== 'الكل' || filterDay !== 'الكل') && (
               <button onClick={resetFilters} className="text-[10px] font-black text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg flex items-center transition-all">
                  <X size={14} className="ml-1" /> إعادة ضبط
               </button>
            )}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
               <input 
                 type="text" 
                 placeholder="بحث باسم الطالب..." 
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-11 pl-4 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            {/* Teacher Filter */}
            <div className="relative">
               <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
               <select 
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-11 pl-4 py-3 text-xs font-bold outline-none cursor-pointer appearance-none"
                 value={filterTeacher}
                 onChange={(e) => setFilterTeacher(e.target.value)}
               >
                  <option value="الكل">كافة المعلمين</option>
                  {teachersList.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
               </select>
               <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>

            {/* Supervisor Filter */}
            <div className="relative">
               <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
               <select 
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-11 pl-4 py-3 text-xs font-bold outline-none cursor-pointer appearance-none"
                 value={filterSupervisor}
                 onChange={(e) => setFilterSupervisor(e.target.value)}
               >
                  <option value="الكل">كافة المشرفين</option>
                  {supervisorsList.map(s => <option key={s.id} value={s.full_name}>{s.full_name}</option>)}
               </select>
               <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>

            {/* Day Filter */}
            <div className="relative">
               <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
               <select 
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-11 pl-4 py-3 text-xs font-bold outline-none cursor-pointer appearance-none"
                 value={filterDay}
                 onChange={(e) => setFilterDay(e.target.value)}
               >
                  <option value="الكل">كافة الأيام</option>
                  {WEEK_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
               </select>
               <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>
         </div>
      </div>

      {loading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-black text-xs uppercase tracking-widest">جاري جلب الجدول...</p>
        </div>
      ) : (
        <div className="bg-slate-50/50 rounded-[3rem] p-4 lg:p-8 overflow-x-auto custom-scrollbar border border-slate-100 shadow-inner">
           <div className="flex gap-6 min-w-max pb-4">
              {WEEK_DAYS.map(day => {
                 const dayAppointments = scheduleData[day];
                 const isDayHidden = filterDay !== 'الكل' && filterDay !== day;
                 
                 if (isDayHidden) return null;

                 return (
                 <div key={day} className="w-80 flex flex-col space-y-4">
                    {/* Day Header */}
                    <div className="bg-white p-5 rounded-3xl border-b-4 border-blue-600 shadow-sm flex items-center justify-between sticky top-0 z-10">
                       <h3 className="font-black text-slate-800 text-lg">{day}</h3>
                       <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-xs font-black">
                          {dayAppointments.length} موعد
                       </div>
                    </div>

                    {/* Appointments List */}
                    <div className="space-y-4">
                       {dayAppointments.length > 0 ? (
                          dayAppointments.map((apt, idx) => (
                             <div key={`${day}-${idx}`} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-1.5 h-full bg-slate-100 group-hover:bg-blue-600 transition-colors"></div>
                                
                                <div className="flex justify-between items-start mb-4">
                                   <div className="bg-slate-50 px-3 py-1.5 rounded-xl flex items-center border border-slate-100 shadow-inner">
                                      <Clock size={12} className="text-blue-500 ml-1.5" />
                                      <span className="text-[11px] font-black text-slate-600 dir-ltr">{apt.from} - {apt.to}</span>
                                   </div>
                                   <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg ${
                                      apt.level === 'متقدم' ? 'bg-emerald-50 text-emerald-600' : 
                                      apt.level === 'متوسط' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                   }`}>
                                      {apt.level}
                                   </span>
                                </div>

                                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg ${apt.level === 'متقدم' ? 'bg-emerald-600' : apt.level === 'متوسط' ? 'bg-amber-500' : 'bg-blue-600'}`}>
                                      {apt.studentName[0]}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <h4 className="font-black text-slate-800 text-sm truncate">{apt.studentName}</h4>
                                      <div className="flex items-center text-[9px] text-slate-400 font-bold mt-1">
                                         <BookOpen size={10} className="ml-1 text-slate-300" />
                                         {apt.branch}
                                      </div>
                                   </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 space-y-2">
                                   <div className="flex items-center justify-between text-[10px]">
                                      <span className="text-slate-400 font-bold flex items-center"><GraduationCap size={12} className="ml-1.5 text-emerald-500"/> المعلم:</span>
                                      <span className="font-black text-slate-700">{apt.teacherName || '---'}</span>
                                   </div>
                                   <div className="flex items-center justify-between text-[10px]">
                                      <span className="text-slate-400 font-bold flex items-center"><ShieldCheck size={12} className="ml-1.5 text-purple-500"/> المشرف:</span>
                                      <span className="font-black text-slate-700">{apt.supervisorName || '---'}</span>
                                   </div>
                                </div>
                             </div>
                          ))
                       ) : (
                          <div className="py-16 text-center bg-white/40 rounded-[2rem] border-2 border-dashed border-slate-200">
                             <CalendarDays size={40} className="mx-auto text-slate-200 mb-2 opacity-30" />
                             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">لا توجد مواعيد</p>
                          </div>
                       )}
                    </div>
                 </div>
              )})}
           </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      ` }} />
    </div>
  );
};

export default Schedule;
