
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Loader2, 
  Trash2, 
  Edit2, 
  Globe, 
  User,
  ShieldCheck,
  Smartphone,
  Layers,
  MapPin,
  Check,
  X,
  Baby
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/supabase';
import { Student, Gender } from '../types';

const Students: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('الكل');
  const [filterLanguage, setFilterLanguage] = useState('الكل');
  const [filterCountry, setFilterCountry] = useState('الكل');
  const [filterSupervisor, setFilterSupervisor] = useState('الكل');

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const [studentsData, profilesData] = await Promise.all([
        db.students.getAll(),
        db.profiles.getAll()
      ]);
      
      let allStudents = studentsData || [];
      
      // تحسين منطق الفلترة لضمان ظهور الطلاب المرتبطين بالمحاضر
      if (isTeacher && user?.full_name) {
        const currentTeacherName = user.full_name.trim().toLowerCase();
        allStudents = allStudents.filter((s: Student) => 
          s.teacher_name?.trim().toLowerCase() === currentTeacherName
        );
      }
      
      setStudents(allStudents);
      setProfiles(profilesData || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const teachersList = useMemo(() => profiles.filter(p => p.role === 'teacher'), [profiles]);
  const supervisorsList = useMemo(() => profiles.filter(p => p.role === 'supervisor' || p.role === 'general_supervisor' || p.role === 'manager'), [profiles]);
  
  const countriesList = useMemo(() => {
    const countries = students.map(s => s.country).filter(Boolean);
    return Array.from(new Set(countries)).sort();
  }, [students]);

  const languages = ['اسبانى', 'انجليزى', 'المانى', 'فرنساوى', 'ايطالى'];

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
    try {
      await db.students.delete(id);
      fetchStudents();
    } catch (error) {
      alert('فشل الحذف');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'yes' | 'no') => {
    setUpdatingId(id);
    try {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, renewal_status: newStatus } : s));
      await db.students.update(id, { renewal_status: newStatus });
    } catch (error) {
      alert('فشل تحديث الحالة');
      fetchStudents();
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.student_number && s.student_number.includes(searchTerm));
      const matchesTeacher = filterTeacher === 'الكل' || s.teacher_name === filterTeacher;
      const matchesLanguage = filterLanguage === 'الكل' || s.enrolled_language === filterLanguage;
      const matchesCountry = filterCountry === 'الكل' || s.country === filterCountry;
      const matchesSupervisor = filterSupervisor === 'الكل' || s.supervisor_name === filterSupervisor;
      
      return matchesSearch && matchesTeacher && matchesLanguage && matchesCountry && matchesSupervisor;
    });
  }, [students, searchTerm, filterTeacher, filterLanguage, filterCountry, filterSupervisor]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-right" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <div className="p-3 bg-blue-700 text-white rounded-2xl ml-4 shadow-xl">
               <Users size={28} />
            </div>
            {isTeacher ? 'قائمة طلابي' : 'شؤون الطلاب'}
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 mr-1">
            {isTeacher ? `الطلاب المرتبطين بالمحاضر: ${user?.full_name}` : 'إدارة الملفات الأكاديمية والبيانات الموحدة'}
          </p>
        </div>
        
        {!isTeacher && (
          <button onClick={() => navigate('/students/form')} className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-sm flex items-center shadow-xl hover:scale-105 transition-all">
            <Plus size={18} className="ml-2" />
            تسجيل طالب جديد
          </button>
        )}
      </div>

      {/* Tools Section */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
         <div className="relative">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="ابحث في قائمة طلابك..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         
         {!isTeacher && (
           <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                 <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600"><Layers size={16} /></div>
                 <select 
                    className="bg-transparent text-slate-600 text-[11px] font-black outline-none cursor-pointer px-3 min-w-[120px]"
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                 >
                    <option value="الكل">كل اللغات</option>
                    {languages.map(l => <option key={l} value={l}>{l}</option>)}
                 </select>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                 <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600"><Globe size={16} /></div>
                 <select 
                    className="bg-transparent text-slate-600 text-[11px] font-black outline-none cursor-pointer px-3 min-w-[120px]"
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                 >
                    <option value="الكل">كل الدول</option>
                    {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                 <div className="p-2 bg-white rounded-xl shadow-sm text-purple-600"><ShieldCheck size={16} /></div>
                 <select 
                    className="bg-transparent text-slate-600 text-[11px] font-black outline-none cursor-pointer px-3 min-w-[140px]"
                    value={filterSupervisor}
                    onChange={(e) => setFilterSupervisor(e.target.value)}
                 >
                    <option value="الكل">جميع المشرفين</option>
                    {supervisorsList.map(s => <option key={s.id} value={s.full_name}>{s.full_name}</option>)}
                 </select>
              </div>
           </div>
         )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="animate-spin mb-6" size={50} />
            <span className="font-black tracking-[0.2em] text-xs uppercase">جاري استدعاء قائمة الطلاب...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-40 text-center">
            <Users size={80} className="mx-auto text-slate-100 mb-6" />
            <h3 className="text-xl font-black text-slate-800 mb-2">لا يوجد طلاب مرتبطة بك</h3>
            <p className="text-slate-400 font-bold text-sm">إذا كنت تعتقد أن هناك خطأ، يرجى مراجعة إدارة المركز.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse">
              <thead>
                {isTeacher ? (
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[12px] font-black text-slate-500 uppercase tracking-widest">اسم الطالب</th>
                    <th className="px-8 py-5 text-[12px] font-black text-slate-500 uppercase tracking-widest text-left">العمر</th>
                  </tr>
                ) : (
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">الطالب / الكود</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المسار</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">حالة الاشتراك</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الموقع</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الاتصال</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المحاضر</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">إجراءات</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="group hover:bg-blue-50/30 transition-colors">
                    {isTeacher ? (
                      <>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-md ${student.gender === Gender.MALE ? 'bg-blue-600' : 'bg-rose-500'}`}>
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-base font-black text-slate-800 leading-none mb-1">{student.name}</p>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">ID: {student.student_number}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-left">
                          <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                             <Baby size={16} className="text-slate-400" />
                             <span className="font-black text-slate-700 text-sm">{student.age} سنة</span>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-sm ${student.gender === Gender.MALE ? 'bg-blue-600' : 'bg-rose-500'}`}>
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 leading-none mb-1">{student.name}</p>
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">ID: {student.student_number}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${student.enrolled_language ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                              {student.enrolled_language || 'عام'}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleStatusUpdate(student.id, 'yes')}
                              disabled={updatingId === student.id}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                                student.renewal_status === 'yes'
                                  ? 'bg-emerald-500 text-white shadow-md scale-105'
                                  : 'bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50'
                              }`}
                            >
                              {student.renewal_status === 'yes' && <Check size={12} />}
                              جدد
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(student.id, 'no')}
                              disabled={updatingId === student.id}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                                student.renewal_status === 'no'
                                  ? 'bg-rose-500 text-white shadow-md scale-105'
                                  : 'bg-white text-rose-600 border border-rose-100 hover:bg-rose-50'
                              }`}
                            >
                              {student.renewal_status === 'no' && <X size={12} />}
                              توقف
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center text-[11px] font-bold text-slate-600">
                            <MapPin size={12} className="ml-1 text-rose-500" />
                            {student.country}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center text-[11px] font-bold text-slate-600 dir-ltr">
                            <Smartphone size={12} className="mr-1 text-emerald-500" />
                            {student.parent_phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <p className="text-[11px] font-black text-slate-700">{student.teacher_name || '---'}</p>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button 
                              onClick={() => navigate('/students/form', { state: { data: student } })} 
                              className="p-2 text-slate-300 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm transition-all"
                            >
                              <Edit2 size={16}/>
                            </button>
                            <button 
                              onClick={() => handleDelete(student.id)} 
                              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-xl shadow-sm transition-all"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {!loading && filteredStudents.length > 0 && (
        <div className="flex items-center justify-between px-8 py-4 bg-slate-900 rounded-3xl text-white shadow-xl">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">عدد طلابك:</span>
                 <span className="text-sm font-black">{filteredStudents.length} طالب</span>
              </div>
           </div>
           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">El Centro de Mirar • Academic Sync</p>
        </div>
      )}
    </div>
  );
};

export default Students;
