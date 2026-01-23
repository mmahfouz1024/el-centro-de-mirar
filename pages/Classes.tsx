
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  User, 
  Loader2, 
  Edit2, 
  Clock, 
  GraduationCap, 
  Calendar,
  ListOrdered,
  List
} from 'lucide-react';
import { db } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

interface Halaqa {
  id: string;
  name: string;
  teacher: string;
  studentsCount: number;
  target_student?: string;
  duration?: string;
  class_type?: string;
  registration_day?: string;
  registration_date?: string;
  branch: string;
}

const Classes: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Halaqa[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStudent, setFilterStudent] = useState('');

  // Helper to get Arabic Day
  const getArabicDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { weekday: 'long' });
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let classesPromise;
      if (user && user.role === 'teacher') {
        classesPromise = db.classes.getByTeacher(user.full_name);
      } else {
        classesPromise = db.classes.getAll();
      }

      const [classesData, studentsData] = await Promise.all([
        classesPromise,
        db.students.getAll()
      ]);
      
      setClasses(classesData);

      let availableStudents = studentsData || [];
      if (user && user.role === 'teacher') {
        availableStudents = availableStudents.filter((s: any) => s.teacher_name === user.full_name);
      }
      setStudentsList(availableStudents);

    } catch (error) {
      console.error('Error fetching classes data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      const matchDate = c.registration_date === filterDate;
      const matchStudent = filterStudent ? c.target_student === filterStudent : true;
      return matchDate && matchStudent;
    });
  }, [classes, filterDate, filterStudent]);

  const classIndices = useMemo(() => {
    const map: Record<string, { current: number, total: number }> = {};
    const studentGroups: Record<string, Halaqa[]> = {};
    classes.forEach(c => {
      if (c.target_student) {
        if (!studentGroups[c.target_student]) studentGroups[c.target_student] = [];
        studentGroups[c.target_student].push(c);
      }
    });

    Object.keys(studentGroups).forEach(studentName => {
      const group = studentGroups[studentName];
      group.sort((a, b) => {
        const dateA = new Date(a.registration_date || '').getTime();
        const dateB = new Date(b.registration_date || '').getTime();
        return dateA - dateB || a.name.localeCompare(b.name);
      });

      const studentProfile = studentsList.find(s => s.name === studentName);
      const planTotal = studentProfile?.required_sessions_count || 0;
      const finalTotal = Math.max(planTotal, group.length);

      group.forEach((c, index) => {
        map[c.id] = { 
            current: index + 1, 
            total: finalTotal 
        };
      });
    });

    return map;
  }, [classes, studentsList]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      
      {/* Top Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <div className="p-3 bg-blue-700 text-white rounded-2xl ml-4 shadow-xl">
               <BookOpen size={28} />
            </div>
            {user?.role === 'teacher' ? 'إدارة محاضراتي' : 'سجل المحاضرات الدراسية'}
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-3 mr-16">عرض المحاضرات حسب التاريخ والطالب</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
            <div className="flex items-center bg-white border border-slate-200 rounded-3xl px-5 py-2 shadow-sm w-full sm:w-auto focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
               <Calendar size={18} className="text-blue-600 ml-3" />
               <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">تاريخ العرض</span>
                  <input 
                    type="date" 
                    value={filterDate} 
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="font-black text-slate-800 outline-none text-[13px] bg-transparent cursor-pointer"
                  />
               </div>
            </div>

            <button 
              onClick={() => navigate('/classes/form', { state: { initialDate: filterDate } })} 
              className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-3xl font-black text-sm flex items-center justify-center shadow-xl hover:bg-amber-600 transition-all active:scale-95"
            >
              <Plus size={18} className="ml-2" />
              تسجيل محاضرة
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-300">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-black text-xs uppercase">جاري مزامنة المحاضرات...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-32 text-center">
          <Calendar size={64} className="mx-auto text-slate-200 mb-6 opacity-40" />
          <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد محاضرات مسجلة</h3>
          <p className="text-slate-400 font-bold text-xs">
             {getArabicDay(filterDate)}، {filterDate}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClasses.map(halaqa => {
            const indexInfo = classIndices[halaqa.id];
            return (
            <div key={halaqa.id} className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl p-8 shadow-sm border border-slate-100 hover:border-blue-400/30 transition-all text-right relative overflow-hidden group">
               <div className="flex justify-between items-start mb-6">
                  <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  
                  <div className="flex space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate('/classes/form', { state: { data: halaqa } })} className="p-2 text-slate-300 hover:text-blue-600 bg-white rounded-xl shadow-sm border border-slate-100"><Edit2 size={14}/></button>
                    <button onClick={() => {if(confirm('حذف؟')) db.classes.delete(halaqa.id).then(fetchData);}} className="p-2 text-slate-300 hover:text-rose-500 bg-white rounded-xl shadow-sm border border-slate-100"><Trash2 size={14}/></button>
                  </div>
               </div>

               <h3 className="text-lg font-black text-slate-800 mb-2 line-clamp-1">{halaqa.name}</h3>
               
               <div className="flex items-center text-slate-500 text-[11px] font-bold mb-6">
                  <User size={12} className="ml-1.5 text-blue-500" />
                  المحاضر: {halaqa.teacher}
               </div>

               <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl mb-6 border border-slate-100/50 space-y-3 shadow-inner">
                  {halaqa.target_student && (
                    <div className="flex items-center text-[11px] font-black text-slate-600">
                      <GraduationCap size={14} className="ml-2 text-emerald-600" />
                      الطالب: {halaqa.target_student}
                    </div>
                  )}
                  {halaqa.class_type && (
                    <div className="flex items-center text-[11px] font-black text-slate-600">
                      <List size={14} className="ml-2 text-purple-600" />
                      اللغة: {halaqa.class_type}
                    </div>
                  )}
                  {halaqa.duration && (
                    <div className="flex items-center text-[11px] font-black text-slate-600">
                      <Clock size={14} className="ml-2 text-amber-600" />
                      المدة: {halaqa.duration} دقيقة
                    </div>
                  )}
               </div>

               {indexInfo && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[10px] font-black text-slate-400">
                     <span className="flex items-center"><ListOrdered size={12} className="ml-1.5" /> تسلسل الطالب:</span>
                     <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">{indexInfo.current} / {indexInfo.total}</span>
                  </div>
               )}
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default Classes;
