
import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Loader2, 
  Trash2, 
  Edit2, 
  Users2, 
  Briefcase, 
  Smartphone, 
  User, 
  Coins,
  Globe,
  Award,
  CreditCard,
  Phone,
  ArrowLeftRight
} from 'lucide-react';
import { db } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const LANGUAGE_OPTIONS = ['اسبانى', 'انجليزى', 'المانى', 'فرنساوى', 'ايطالى'];

const Teachers: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('الكل');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const teachersData = await db.teachers.getAll();
      setTeachers(teachersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToAddTeacher = () => {
    navigate('/teachers/form');
  };

  const goToEditTeacher = (teacher: any) => {
    navigate('/teachers/form', { state: { data: teacher } });
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch = 
        (t.full_name || '').toLowerCase().includes(lowerSearch) ||
        (t.phone || '').includes(lowerSearch) ||
        (t.vodafone_cash || '').includes(lowerSearch) ||
        (t.instapay || '').toLowerCase().includes(lowerSearch) ||
        (t.username || '').toLowerCase().includes(lowerSearch);

      const matchSpec = filterSpecialization === 'الكل' || t.specialization === filterSpecialization;

      return matchSearch && matchSpec;
    });
  }, [teachers, searchTerm, filterSpecialization]);

  return (
    <div className="space-y-8 pb-10 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <div className="p-3 bg-blue-700 text-white rounded-2xl ml-4 shadow-xl">
               <UserCheck size={28} />
            </div>
            إدارة المحاضرين
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 mr-16">سجل بيانات أعضاء هيئة التدريس المعتمدين</p>
        </div>
        <button onClick={goToAddTeacher} className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-8 py-4 rounded-3xl font-black text-sm flex items-center shadow-xl hover:scale-105 transition-all">
          <Plus size={18} className="ml-2" />
          إضافة محاضر جديد
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-6">
         <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="بحث (الاسم، الهاتف، الحساب البنكي)..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         
         <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-full sm:w-auto">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600"><Briefcase size={16} /></div>
            <select 
               className="bg-transparent text-slate-600 text-[11px] font-black outline-none cursor-pointer w-full sm:w-48 px-2 py-1.5"
               value={filterSpecialization}
               onChange={(e) => setFilterSpecialization(e.target.value)}
            >
               <option value="الكل">كل لغات التخصص</option>
               {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
         </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300">
            <Loader2 className="animate-spin mb-4" size={48} />
            <span className="font-bold tracking-widest text-xs uppercase">جاري مزامنة سجل المحاضرين...</span>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="py-40 text-center">
            <Users2 size={80} className="mx-auto text-slate-100 mb-6" />
            <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد سجلات مطابقة</h3>
            <p className="text-slate-400 font-bold text-sm">لم يتم العثور على محاضرين مسجلين بهذه البيانات.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">المحاضر</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">التخصص</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">فودافون كاش</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">انستا باي</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">سعر الساعة</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTeachers.map(teacher => (
                  <tr key={teacher.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-inner shrink-0">
                          {teacher.avatar ? (
                            <img src={teacher.avatar} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="text-lg font-black text-blue-600 uppercase">{teacher.full_name?.[0]}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 text-sm">{teacher.full_name}</h4>
                          <div className="flex items-center text-[9px] font-bold text-slate-400 mt-0.5">
                             <Phone size={10} className="ml-1 text-emerald-500" />
                             <span className="dir-ltr">{teacher.phone}</span>
                             <span className="mx-2">|</span>
                             <span>{teacher.age} سنة • {teacher.gender}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase">
                        {teacher.specialization}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {teacher.vodafone_cash ? (
                        <div className="inline-flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                           <Smartphone size={14} className="text-rose-500" />
                           <span className="text-xs font-black text-rose-700">{teacher.vodafone_cash}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold">---</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      {teacher.instapay ? (
                        <div className="inline-flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                           <CreditCard size={14} className="text-purple-600" />
                           <span className="text-xs font-black text-purple-700">{teacher.instapay}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold">---</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                       <div className="inline-flex items-center gap-1.5 font-black text-amber-600">
                          <Coins size={14} className="text-amber-500" />
                          <span className="text-sm">{teacher.hourly_rate || 0}</span>
                          <span className="text-[9px]">ج.م</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => goToEditTeacher(teacher)} 
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-blue-100 transition-all"
                        >
                          <Edit2 size={18}/>
                        </button>
                        <button 
                          onClick={() => { if(confirm('هل أنت متأكد من حذف بيانات هذا المحاضر نهائياً؟')) db.teachers.delete(teacher.id).then(fetchInitialData); }} 
                          className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-rose-100 transition-all"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {!loading && filteredTeachers.length > 0 && (
        <div className="flex items-center justify-between px-10 py-5 bg-slate-900 rounded-[2rem] text-white shadow-2xl">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">إجمالي المحاضرين:</span>
                 <span className="text-base font-black">{filteredTeachers.length} معلم</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="h-10 w-px bg-white/10 hidden md:block"></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] hidden sm:block">Center Dawood • HR Management</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
