
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

  // Helper to get Arabic Day from a specific date string
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

  const goToAddClass = () => {
    // Pass the selected filter date to pre-fill the form
    navigate('/classes/form', { state: { initialDate: filterDate } });
  };

  const goToEditClass = (halaqa: Halaqa) => {
    navigate('/classes/form', { state: { data: halaqa } });
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحلقة نهائياً؟')) return;
    try {
      setActionLoading(true);
      await db.classes.delete(id);
      fetchData();
    } catch (error) {
      alert('فشل الحذف');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      
      {/* Top Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <BookOpen className="ml-3 text-blue-700" size={32} />
            {user?.role === 'teacher' ? 'إدارة حلقاتي' : 'سجل الحلقات الدراسية'}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">عرض الحلقات حسب التاريخ والطالب</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
            {/* Date Filter Input */}
            <div className="flex items-center bg-white border-2 border-slate-100 rounded-2xl px-4 py-2 shadow-sm w-full sm:w-auto focus-within:border-blue-500 transition-colors">
               <Calendar size={20} className="text-blue-600 ml-3" />
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">تاريخ عرض الحلقات</span>
                  <input 
                    type="date" 
                    value={filterDate} 
                    onChange={handleDateFilterChange}
                    className="font-black text-slate-800 outline-none text-sm bg-transparent cursor-pointer"
                  />
               </div>
            </div>

            {/* Student Filter Input */}
            <div className="flex items-center bg-white border-2 border-slate-100 rounded-2xl px-4 py-2 shadow-sm w-full sm:w-auto focus-within:border-emerald-500 transition-colors">
               <GraduationCap size={20} className="text-emerald-600 ml-3" />
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">تصفية بالطالب</span>
                  <select 
                    value={filterStudent}
                    onChange={(e) => setFilterStudent(e.target.value)}
                    className="font-black text-slate-800 outline-none text-sm bg-transparent cursor-pointer w-40"
                  >
                    <option value="">جميع الطلاب</option>
                    {studentsList.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
               </div>
            </div>

            <button 
              onClick={goToAddClass} 
              className="w-full sm:w-auto bg-blue-700 text-white px-8 py-3.5 rounded-[1.5rem] font-black text-sm flex items-center justify-center shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all"
            >
              <Plus size={20} className="ml-2" />
              {user?.role === 'teacher' ? 'تسجيل حلقة جديدة' : 'إنشاء حلقة'}
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-300">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-black text-xs uppercase">جاري مزامنة الحلقات...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-32 text-center">
          <Calendar size={64} className="mx-auto text-slate-200 mb-6 opacity-20" />
          <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد حلقات مطابقة للبحث</h3>
          <p className="text-slate-400 font-bold mb-6">
             {getArabicDay(filterDate)}، {filterDate} {filterStudent && ` - الطالب: ${filterStudent}`}
          </p>
          <button onClick={goToAddClass} className="text-blue-600 font-black text-sm hover:underline">
             تسجيل حلقة جديدة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClasses.map(halaqa => {
            const indexInfo = classIndices[halaqa.id];
            return (
            <div key={halaqa.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 hover:border-blue-200 transition-all text-right relative overflow-hidden group">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                    <BookOpen size={24} />
                  </div>
                  
                  <div className="flex space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => goToEditClass(halaqa)} className="p-2 text-slate-300 hover:text-blue-600"><Edit2 size={16}/></button>
                    <button disabled={actionLoading} onClick={() => handleDelete(halaqa.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                  </div>
               </div>

               <h3 className="text-lg font-black text-slate-800 mb-1 line-clamp-1">{halaqa.name}</h3>
               
               <div className="flex items-center text-slate-500 text-xs font-bold mb-3">
                  <User size={14} className="ml-1 text-blue-500" />
                  المعلم: {halaqa.teacher}
               </div>

               <div className="bg-slate-50/80 p-4 rounded-2xl mb-4 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-500 pb-2 border-b border-slate-200/50">
                    <span className="flex items-center"><Calendar size={12} className="ml-1.5 text-slate-400"/> التاريخ:</span>
                    <span>{halaqa.registration_day} {halaqa.registration_date}</span>
                  </div>
                  {halaqa.target_student && (
                    <div className="flex items-center text-[11px] font-black text-slate-600">
                      <GraduationCap size={14} className="ml-2 text-emerald-600" />
                      الطالب: {halaqa.target_student}
                    </div>
                  )}
                  {halaqa.class_type && (
                    <div className="flex items-center text-[11px] font-black text-slate-600">
                      <List size={14} className="ml-2 text-purple-600" />
                      النوع: {halaqa.class_type}
                    </div>
                  )}
                  {halaqa.duration && (
                    <div className="flex items-center text-[11px] font-black text-slate-600">
                      <Clock size={14} className="ml-2 text-amber-600" />
                      المدة: {halaqa.duration} دقيقة
                    </div>
                  )}
                  {indexInfo && (
                    <div className="flex items-center text-[11px] font-black text-slate-600 border-t border-slate-200/50 pt-2 mt-2">
                      <ListOrdered size={14} className="ml-2 text-blue-500" />
                      ترتيب الحلقة: <span className="text-blue-600 mx-1">{indexInfo.current}</span> من <span className="text-slate-400 mx-1">{indexInfo.total}</span>
                    </div>
                  )}
               </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default Classes;
