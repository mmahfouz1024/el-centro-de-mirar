
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
  Filter,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/supabase';
import { Student, Gender } from '../types';

const Students: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupervisor, setFilterSupervisor] = useState('الكل');
  const [filterTeacher, setFilterTeacher] = useState('الكل');
  const [filterCountry, setFilterCountry] = useState('الكل');

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const [studentsData, profilesData] = await Promise.all([
        db.students.getAll(),
        db.profiles.getAll()
      ]);
      
      let filteredStudents = studentsData || [];
      if (user && user.role === 'teacher') {
        filteredStudents = filteredStudents.filter((s: Student) => s.teacher_name === user.full_name);
      }
      setStudents(filteredStudents);
      setProfiles(profilesData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const teachersList = useMemo(() => profiles.filter(p => p.role === 'teacher'), [profiles]);
  const supervisorsList = useMemo(() => profiles.filter(p => p.role === 'supervisor'), [profiles]);
  const uniqueCountries = useMemo(() => [...new Set(students.map(s => s.country))].filter(Boolean), [students]);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
    try {
      await db.students.delete(id);
      fetchStudents();
    } catch (error) {
      alert('فشل الحذف');
    }
  };

  const goToAddStudent = () => {
    navigate('/students/form');
  };

  const goToEditStudent = (student: any) => {
    navigate('/students/form', { state: { data: student } });
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.student_phone && s.student_phone.includes(searchTerm));
      const matchesCountry = filterCountry === 'الكل' || s.country === filterCountry;
      const matchesTeacher = filterTeacher === 'الكل' || s.teacher_name === filterTeacher;
      const matchesSupervisor = filterSupervisor === 'الكل' || s.supervisor_name === filterSupervisor;
      
      return matchesSearch && matchesCountry && matchesTeacher && matchesSupervisor;
    });
  }, [students, searchTerm, filterCountry, filterTeacher, filterSupervisor]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Users className="ml-3 text-blue-700" size={32} />
            شؤون الطلاب
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">إدارة ملفات الطلاب وبياناتهم الأكاديمية والمالية</p>
        </div>
        <div className="flex gap-2">
          {user?.role !== 'teacher' && user?.role !== 'manager' && (
            <button onClick={goToAddStudent} className="bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all active:scale-95">
              <Plus size={18} className="ml-2" />
              تسجيل طالب جديد
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
         <div className="flex items-center space-x-2 space-x-reverse text-slate-400 mb-2">
            <Filter size={16} />
            <span className="text-xs font-black uppercase tracking-widest">أدوات الفلترة والبحث</span>
         </div>
         
         <div className={`grid grid-cols-1 md:grid-cols-2 ${!isTeacher ? 'lg:grid-cols-4' : ''} gap-4`}>
            <div className={`relative ${!isTeacher ? 'lg:col-span-1' : 'md:col-span-2'}`}>
               <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="بحث بالاسم أو الكود..." 
                 className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-9 pl-3 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            {!isTeacher && (
              <>
                <div className="relative">
                   <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                   <select className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-9 pl-3 py-3 text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/10 appearance-none" value={filterSupervisor} onChange={(e) => setFilterSupervisor(e.target.value)}>
                      <option value="الكل">كل المشرفين</option>
                      {supervisorsList.map(s => <option key={s.id} value={s.full_name}>{s.full_name}</option>)}
                   </select>
                </div>
                <div className="relative">
                   <User className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                   <select className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-9 pl-3 py-3 text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/10 appearance-none" value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}>
                      <option value="الكل">كل المعلمين</option>
                      {teachersList.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
                   </select>
                </div>
                <div className="relative">
                   <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
                   <select className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-9 pl-3 py-3 text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-amber-500/10 appearance-none" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
                      <option value="الكل">كل الدول</option>
                      {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
              </>
            )}
         </div>
      </div>

      {/* Students Table View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <span className="font-bold tracking-widest text-xs uppercase">جاري تحميل البيانات...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-24 text-center">
          <Users size={64} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-800 mb-2">لا يوجد طلاب مسجلين</h3>
          <p className="text-slate-400 font-bold text-sm">لا توجد نتائج تطابق معايير البحث والفلترة الحالية.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-right">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">الطالب</th>
                       <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">البيانات الشخصية</th>
                       {!isTeacher && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">الموقع</th>}
                       <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">المستوى / المسار</th>
                       {!isTeacher && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">التواصل</th>}
                       {!isTeacher && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">التجديد</th>}
                       <th className="px-6 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredStudents.map(student => (
                       <tr key={student.id} className="group hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center space-x-3 space-x-reverse">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-sm ${student.gender === Gender.MALE ? 'bg-blue-600' : 'bg-rose-500'}`}>
                                   {student.name.charAt(0)}
                                </div>
                                <div>
                                   <h4 className="text-sm font-black text-slate-800">{student.name}</h4>
                                   <span className="text-[9px] font-bold text-slate-400 block mt-0.5">كود: {student.student_number}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="space-y-1">
                                <div className="text-[10px] font-bold text-slate-600">{student.age} سنة • {student.gender}</div>
                                <div className="text-[9px] text-slate-400">{student.edu_stage}</div>
                             </div>
                          </td>
                          {!isTeacher && (
                            <td className="px-6 py-4">
                               <div className="flex items-center text-[10px] font-bold text-slate-600">
                                  <Globe size={12} className="ml-1 text-amber-500" />
                                  {student.country}
                               </div>
                            </td>
                          )}
                          <td className="px-6 py-4">
                             <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-black mb-1">
                                {student.level}
                             </span>
                             <div className="text-[9px] text-slate-400 font-bold">حفظ: {student.total_memorized} جزء</div>
                          </td>
                          {!isTeacher && (
                            <td className="px-6 py-4">
                               <div className="text-[10px] font-bold text-slate-600 dir-ltr">{student.parent_phone}</div>
                               <span className="text-[8px] text-slate-400 font-bold uppercase">ولي الأمر</span>
                            </td>
                          )}
                          {!isTeacher && (
                            <td className="px-6 py-4 text-center">
                               {student.renewal_status === 'yes' && <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full" title="سيجدد"></span>}
                               {student.renewal_status === 'no' && <span className="inline-block w-3 h-3 bg-rose-500 rounded-full" title="لن يجدد"></span>}
                               {(!student.renewal_status || student.renewal_status === 'undecided') && <span className="inline-block w-3 h-3 bg-slate-300 rounded-full" title="لم يحدد"></span>}
                            </td>
                          )}
                          <td className="px-6 py-4 text-left">
                             <div className="flex justify-end space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => goToEditStudent(student)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-lg transition-all"><Edit2 size={14} /></button>
                                {user?.role !== 'teacher' && (
                                   <button onClick={() => handleDelete(student.id)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-lg transition-all"><Trash2 size={14} /></button>
                                )}
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <div className="bg-slate-50 p-4 text-center text-[10px] font-bold text-slate-400 border-t border-slate-100">
              إجمالي الطلاب المعروضين: {filteredStudents.length}
           </div>
        </div>
      )}
    </div>
  );
};

export default Students;
