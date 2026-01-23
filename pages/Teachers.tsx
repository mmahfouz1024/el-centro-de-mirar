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
  Users
} from 'lucide-react';
import { db } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const TARGET_AUDIENCE_OPTIONS = ['أطفال', 'رجال', 'نساء'];
const SPECIALIZATION_OPTIONS = ['التحفيظ', 'التجويد', 'المتون', 'الإجازات'];

const Teachers: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('الكل');
  const [filterSpecialization, setFilterSpecialization] = useState('الكل');
  const [filterAudience, setFilterAudience] = useState('الكل');

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
      // Search in Name, Phone, Vodafone Cash, Instapay, Username
      const matchSearch = 
        (t.full_name || '').toLowerCase().includes(lowerSearch) ||
        (t.phone || '').includes(lowerSearch) ||
        (t.vodafone_cash || '').includes(lowerSearch) ||
        (t.instapay || '').toLowerCase().includes(lowerSearch) ||
        (t.username || '').toLowerCase().includes(lowerSearch);

      // Filters
      const matchGender = filterGender === 'الكل' || t.gender === filterGender;
      const matchSpec = filterSpecialization === 'الكل' || t.specialization === filterSpecialization;
      const matchAudience = filterAudience === 'الكل' || (t.target_audience && t.target_audience.includes(filterAudience));

      return matchSearch && matchGender && matchSpec && matchAudience;
    });
  }, [teachers, searchTerm, filterGender, filterSpecialization, filterAudience]);

  return (
    <div className="space-y-8 pb-10 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <UserCheck className="ml-3 text-blue-700" size={32} />
            إدارة المعلمين
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">سجل بيانات أعضاء هيئة التدريس</p>
        </div>
        <button onClick={goToAddTeacher} className="bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all">
          <Plus size={18} className="ml-2" />
          إضافة معلم
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-6">
         {/* Search Input */}
         <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="بحث (الاسم، الهاتف، الحساب البنكي، المستخدم)..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         
         {/* Dropdown Filters */}
         <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Specialization Filter */}
            <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-1 rounded-2xl border border-slate-100 w-full sm:w-auto">
               <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400">
                  <Briefcase size={16} />
               </div>
               <select 
                  className="bg-transparent text-slate-600 text-xs font-black outline-none cursor-pointer w-full sm:w-40 py-2 px-2"
                  value={filterSpecialization}
                  onChange={(e) => setFilterSpecialization(e.target.value)}
               >
                  <option value="الكل">كل التخصصات</option>
                  {SPECIALIZATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
               </select>
            </div>

            {/* Target Audience Filter */}
            <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-1 rounded-2xl border border-slate-100 w-full sm:w-auto">
               <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400">
                  <Users size={16} />
               </div>
               <select 
                  className="bg-transparent text-slate-600 text-xs font-black outline-none cursor-pointer w-full sm:w-36 py-2 px-2"
                  value={filterAudience}
                  onChange={(e) => setFilterAudience(e.target.value)}
               >
                  <option value="الكل">كل الفئات</option>
                  {TARGET_AUDIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
               </select>
            </div>

            {/* Gender Filter */}
            <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-1 rounded-2xl border border-slate-100 w-full sm:w-auto">
               <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400">
                  <User size={16} />
               </div>
               <select 
                  className="bg-transparent text-slate-600 text-xs font-black outline-none cursor-pointer w-full sm:w-28 py-2 px-2"
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
               >
                  <option value="الكل">الكل</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
               </select>
            </div>
         </div>
      </div>

      {/* Teachers List */}
      <section>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <span className="font-bold tracking-widest text-xs uppercase">جاري التحميل...</span>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-24 text-center">
            <Users2 size={64} className="mx-auto text-slate-200 mb-6" />
            <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد نتائج تطابق البحث</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map(teacher => (
              <div key={teacher.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                      <img src={teacher.avatar} alt={teacher.full_name} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg">{teacher.full_name}</h3>
                      <div className="text-blue-600 text-[10px] font-bold mt-1 flex items-center">
                         <span className="bg-blue-50 px-2 py-0.5 rounded-md ml-2">{teacher.specialization}</span>
                         <span className={teacher.gender === 'ذكر' ? 'text-blue-400' : 'text-rose-400'}>{teacher.gender || 'ذكر'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 space-x-reverse">
                    <button onClick={() => goToEditTeacher(teacher)} className="p-2 text-slate-300 hover:text-blue-600 transition-all">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => { if(confirm('حذف المعلم؟')) db.teachers.delete(teacher.id).then(fetchInitialData); }} className="p-2 text-slate-300 hover:text-rose-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center"><Smartphone size={14} className="ml-2 text-emerald-500"/> {teacher.phone}</div>
                      <div className="flex items-center"><User size={14} className="ml-2 text-slate-400"/> {teacher.age} سنة</div>
                   </div>
                   
                   {teacher.target_audience && teacher.target_audience.length > 0 && (
                     <div className="flex flex-wrap gap-1">
                        {teacher.target_audience.map((aud: string) => (
                           <span key={aud} className="text-[9px] font-black bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100">
                              {aud}
                           </span>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Teachers;