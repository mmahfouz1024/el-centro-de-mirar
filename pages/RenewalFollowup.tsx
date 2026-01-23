
import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  UserCheck,
  User,
  ListFilter,
  X,
  Check,
  HelpCircle,
  MoreHorizontal
} from 'lucide-react';
import { db } from '../services/supabase';

const RenewalFollowup: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('الكل');
  const [filterTeacher, setFilterTeacher] = useState('الكل');
  
  // State for managing student list modal
  const [selectedTeacherForEdit, setSelectedTeacherForEdit] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teachersData, studentsData] = await Promise.all([
        db.profiles.getTeachers(),
        db.students.getAll()
      ]);
      setTeachers(teachersData || []);
      setStudents(studentsData || []);
    } catch (error) {
      console.error('Error fetching renewal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (studentId: string, status: 'yes' | 'no' | 'undecided') => {
    setUpdatingId(studentId);
    try {
      await db.students.update(studentId, { renewal_status: status });
      // Update local state to reflect changes immediately
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, renewal_status: status } : s));
    } catch (error) {
      alert('فشل تحديث الحالة');
    } finally {
      setUpdatingId(null);
    }
  };

  const renewalStats = useMemo(() => {
    return teachers
      .filter(t => t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   t.branch.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(t => filterBranch === 'الكل' || t.branch === filterBranch)
      .filter(t => filterTeacher === 'الكل' || t.full_name === filterTeacher)
      .map(teacher => {
        const teacherStudents = students.filter(s => s.teacher_name === teacher.full_name);
        const total = teacherStudents.length;
        const renewing = teacherStudents.filter(s => s.renewal_status === 'yes').length;
        const notRenewing = teacherStudents.filter(s => s.renewal_status === 'no').length;
        const undecided = teacherStudents.filter(s => !s.renewal_status || s.renewal_status === 'undecided').length;
        
        const rate = total > 0 ? Math.round((renewing / total) * 100) : 0;

        return {
          ...teacher,
          stats: { total, renewing, notRenewing, undecided, rate }
        };
      })
      .sort((a, b) => b.stats.rate - a.stats.rate);
  }, [teachers, students, searchTerm, filterBranch, filterTeacher]);

  const overallStats = useMemo(() => {
    const totalStudents = renewalStats.reduce((acc, curr) => acc + curr.stats.total, 0);
    const totalRenewing = renewalStats.reduce((acc, curr) => acc + curr.stats.renewing, 0);
    const totalRate = totalStudents > 0 ? Math.round((totalRenewing / totalStudents) * 100) : 0;
    return { totalStudents, totalRenewing, totalRate };
  }, [renewalStats]);

  const uniqueBranches = useMemo(() => [...new Set(teachers.map(t => t.branch))].filter(Boolean), [teachers]);

  // Students list for the selected teacher modal
  const currentTeacherStudents = useMemo(() => {
    if (!selectedTeacherForEdit) return [];
    return students.filter(s => s.teacher_name === selectedTeacherForEdit.full_name);
  }, [students, selectedTeacherForEdit]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest">جاري تحليل بيانات التجديد...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <RefreshCw className="ml-3 text-emerald-600" size={32} />
            متابعة التجديدات الشهرية
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">مراقبة وتسجيل حالات تجديد الاشتراكات</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">نسبة التجديد العامة</p>
              <h3 className="text-4xl font-black">{overallStats.totalRate}%</h3>
              <div className="mt-4 w-full bg-black/20 rounded-full h-1.5">
                 <div className="bg-white h-1.5 rounded-full" style={{ width: `${overallStats.totalRate}%` }}></div>
              </div>
           </div>
           <TrendingUp className="absolute -bottom-4 -left-4 text-emerald-500 opacity-50" size={100} />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
              <Users size={24} />
           </div>
           <h4 className="text-2xl font-black text-slate-800">{overallStats.totalStudents}</h4>
           <p className="text-[10px] font-bold text-slate-400 uppercase">إجمالي الطلاب النشطين</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
              <UserCheck size={24} />
           </div>
           <h4 className="text-2xl font-black text-slate-800">{overallStats.totalRenewing}</h4>
           <p className="text-[10px] font-bold text-slate-400 uppercase">أكدوا التجديد</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-6">
         <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="بحث سريع..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-3 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         
         <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-1 rounded-2xl border border-slate-100 w-full sm:w-auto">
               <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400">
                  <User size={16} />
               </div>
               <select 
                  className="bg-transparent text-slate-600 text-xs font-black outline-none cursor-pointer w-full sm:w-48 py-2"
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
               >
                  <option value="الكل">كافة المعلمين</option>
                  {teachers.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
               </select>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-1 rounded-2xl border border-slate-100 w-full sm:w-auto">
               <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400">
                  <Filter size={16} />
               </div>
               <select 
                  className="bg-transparent text-slate-600 text-xs font-black outline-none cursor-pointer w-full sm:w-40 py-2"
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
               >
                  <option value="الكل">كافة الفروع</option>
                  {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
               </select>
            </div>
         </div>
      </div>

      {/* Teachers Renewal Grid */}
      <div className="grid grid-cols-1 gap-4">
         {renewalStats.map((teacher) => (
            <div key={teacher.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
               <div className="flex flex-col lg:flex-row items-center gap-6">
                  {/* Teacher Info */}
                  <div className="flex items-center space-x-4 space-x-reverse w-full lg:w-1/4">
                     <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-white shadow-inner flex items-center justify-center overflow-hidden shrink-0">
                        <img src={teacher.avatar} alt="" className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <h4 className="font-black text-slate-800 text-sm">{teacher.full_name}</h4>
                        <div className="flex items-center mt-1 space-x-2 space-x-reverse">
                           <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{teacher.branch}</span>
                           <span className="text-[9px] font-bold text-slate-400">{teacher.stats.total} طالب</span>
                        </div>
                     </div>
                  </div>

                  {/* Progress Bar Section */}
                  <div className="flex-1 w-full">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">معدل التجديد</span>
                        <span className="text-lg font-black text-slate-800">{teacher.stats.rate}%</span>
                     </div>
                     <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(teacher.stats.renewing / teacher.stats.total) * 100}%` }}></div>
                        <div className="bg-rose-400 h-full transition-all duration-1000" style={{ width: `${(teacher.stats.notRenewing / teacher.stats.total) * 100}%` }}></div>
                        <div className="bg-slate-300 h-full transition-all duration-1000 flex-1"></div>
                     </div>
                  </div>

                  {/* Detailed Stats & Action Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                      <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                         <div className="bg-emerald-50 px-4 py-2 rounded-xl text-center border border-emerald-100">
                            <span className="block text-sm font-black text-emerald-700">{teacher.stats.renewing}</span>
                            <span className="text-[8px] font-bold text-emerald-600">جدد</span>
                         </div>
                         <div className="bg-rose-50 px-4 py-2 rounded-xl text-center border border-rose-100">
                            <span className="block text-sm font-black text-rose-700">{teacher.stats.notRenewing}</span>
                            <span className="text-[8px] font-bold text-rose-600">رفض</span>
                         </div>
                         <div className="bg-slate-50 px-4 py-2 rounded-xl text-center border border-slate-100">
                            <span className="block text-sm font-black text-slate-600">{teacher.stats.undecided}</span>
                            <span className="text-[8px] font-bold text-slate-500">متبقي</span>
                         </div>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedTeacherForEdit(teacher)}
                        className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center whitespace-nowrap"
                      >
                        <ListFilter size={16} className="ml-2" />
                        إدارة القائمة
                      </button>
                  </div>
               </div>
            </div>
         ))}

         {renewalStats.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <BarChart3 size={48} className="text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold">لا توجد بيانات للعرض حالياً</p>
            </div>
         )}
      </div>

      {/* Students List Modal for Editing Status */}
      {selectedTeacherForEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTeacherForEdit(null)}></div>
          <div className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800">قائمة طلاب: {selectedTeacherForEdit.full_name}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">تحديث حالة التجديد للشهر القادم</p>
              </div>
              <button onClick={() => setSelectedTeacherForEdit(null)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="space-y-3">
                {currentTeacherStudents.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-bold">لا يوجد طلاب مسجلين لهذا المعلم</div>
                ) : (
                  currentTeacherStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white ${
                          student.gender === 'ذكر' ? 'bg-blue-500' : 'bg-rose-500'
                        }`}>
                          {student.name[0]}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 text-sm">{student.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400">{student.level}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {updatingId === student.id ? (
                          <Loader2 className="animate-spin text-slate-400" size={20} />
                        ) : (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(student.id, 'yes')}
                              className={`flex items-center px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                                student.renewal_status === 'yes' 
                                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-100' 
                                : 'bg-white text-slate-400 border border-slate-200 hover:text-emerald-600 hover:border-emerald-200'
                              }`}
                            >
                              <Check size={14} className="ml-1" /> جدد
                            </button>
                            
                            <button 
                              onClick={() => handleStatusUpdate(student.id, 'no')}
                              className={`flex items-center px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                                student.renewal_status === 'no' 
                                ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-100' 
                                : 'bg-white text-slate-400 border border-slate-200 hover:text-rose-600 hover:border-rose-200'
                              }`}
                            >
                              <X size={14} className="ml-1" /> رفض
                            </button>

                            <button 
                              onClick={() => handleStatusUpdate(student.id, 'undecided')}
                              className={`flex items-center px-3 py-2 rounded-xl text-[10px] font-black transition-all ${
                                !student.renewal_status || student.renewal_status === 'undecided'
                                ? 'bg-slate-200 text-slate-600' 
                                : 'bg-white text-slate-300 border border-slate-200 hover:bg-slate-50'
                              }`}
                              title="لم يحدد بعد"
                            >
                              <HelpCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
               <button onClick={() => setSelectedTeacherForEdit(null)} className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all">
                 إغلاق وحفظ
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenewalFollowup;
