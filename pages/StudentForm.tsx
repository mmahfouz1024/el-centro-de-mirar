import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  User, 
  Phone, 
  School, 
  BookOpen, 
  Calendar,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../services/supabase';
import { Gender, EduSystem } from '../types';

const COUNTRY_DATA: Record<string, string> = {
  'السعودية': '+966',
  'مصر': '+20',
  'الإمارات': '+971',
  'تركيا': '+90',
  'عمان': '+968',
  'قطر': '+974',
  'البحرين': '+973',
  'الكويت': '+965',
  'أمريكا': '+1',
  'فرنسا': '+33',
  'بريطانيا': '+44'
};

const COUNTRIES = Object.keys(COUNTRY_DATA);

const StudentForm: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingStudent = location.state?.data;

  const [profiles, setProfiles] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const initialFormState = {
    name: '',
    join_date: new Date().toISOString().split('T')[0],
    age: '', 
    country: 'مصر',
    gender: Gender.MALE,
    address: '',
    edu_stage: 'الابتدائية',
    edu_system: EduSystem.GENERAL,
    school_name: '',
    student_phone: '',
    parent_phone: '',
    parent_country_code: '+20',
    level: 'مبتدئ',
    current_juz: 30,
    last_hifz_date: new Date().toISOString().split('T')[0],
    total_memorized: 0,
    points: 0,
    branch: 'الرئيسي',
    section: 'بنين' as 'بنين' | 'بنات',
    teacher_name: '',
    supervisor_name: '',
    enrollment_programs: [] as string[],
    enrollment_notes: '',
    renewal_status: 'new'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchData = async () => {
      const data = await db.profiles.getAll();
      setProfiles(data || []);
    };
    fetchData();

    if (editingStudent) {
      setFormData({
        ...initialFormState,
        ...editingStudent,
        age: editingStudent.age ? editingStudent.age.toString() : '',
      });
    }
  }, [editingStudent]);

  const teachers = profiles.filter(p => p.role === 'teacher');
  const supervisors = profiles.filter(p => p.role === 'supervisor' || p.role === 'general_supervisor');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age) || 0,
      };

      if (editingStudent) {
        await db.students.update(editingStudent.id, payload);
      } else {
        await db.students.create(payload);
      }
      navigate('/students');
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center space-x-4 space-x-reverse mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800">{editingStudent ? 'تعديل بيانات الطالب' : 'تسجيل طالب جديد'}</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">إدارة الملف الأكاديمي والشخصي</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
        
        {/* Basic Info */}
        <section className="space-y-6">
           <h4 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-2 flex items-center">
              <User size={18} className="ml-2 text-blue-600" /> البيانات الشخصية
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">الاسم الرباعي</label>
                 <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">السن</label>
                 <input type="number" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">النوع</label>
                 <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})}>
                    <option value={Gender.MALE}>ذكر</option>
                    <option value={Gender.FEMALE}>أنثى</option>
                 </select>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">الدولة</label>
                 <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value, parent_country_code: COUNTRY_DATA[e.target.value] || '+20'})}>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase">العنوان بالتفصيل</label>
                 <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
           </div>
        </section>

        {/* Contact Info */}
        <section className="space-y-6">
           <h4 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-2 flex items-center">
              <Phone size={18} className="ml-2 text-emerald-600" /> التواصل
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">رقم ولي الأمر (واتساب)</label>
                 <div className="flex dir-ltr">
                    <div className="bg-slate-100 px-3 py-3 rounded-r-2xl border border-slate-200 text-sm font-bold text-slate-600 flex items-center">{formData.parent_country_code}</div>
                    <input type="tel" required className="flex-1 bg-slate-50 border border-slate-100 rounded-l-2xl px-4 py-3 text-sm font-bold outline-none text-right" value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} placeholder="10xxxxxxxx" />
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">رقم الطالب (اختياري)</label>
                 <input type="tel" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.student_phone} onChange={e => setFormData({...formData, student_phone: e.target.value})} />
              </div>
           </div>
        </section>

        {/* Education Info */}
        <section className="space-y-6">
           <h4 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-2 flex items-center">
              <School size={18} className="ml-2 text-amber-600" /> التعليم العام
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">المرحلة الدراسية</label>
                 <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.edu_stage} onChange={e => setFormData({...formData, edu_stage: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">نظام التعليم</label>
                 <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.edu_system} onChange={e => setFormData({...formData, edu_system: e.target.value as EduSystem})}>
                    <option value={EduSystem.GENERAL}>عام</option>
                    <option value={EduSystem.AZHAR}>أزهري</option>
                 </select>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">اسم المدرسة / المعهد</label>
                 <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.school_name} onChange={e => setFormData({...formData, school_name: e.target.value})} />
              </div>
           </div>
        </section>

        {/* Academic Info */}
        <section className="space-y-6">
           <h4 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-2 flex items-center">
              <BookOpen size={18} className="ml-2 text-purple-600" /> البيانات الأكاديمية
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">المستوى الحالي</label>
                 <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="متوسط">متوسط</option>
                    <option value="متقدم">متقدم</option>
                 </select>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">الفرع</label>
                 <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">المعلم المسؤول</label>
                 <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.teacher_name} onChange={e => setFormData({...formData, teacher_name: e.target.value})}>
                    <option value="">اختر المعلم</option>
                    {teachers.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
                 </select>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase">المشرف المسؤول</label>
                 <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.supervisor_name} onChange={e => setFormData({...formData, supervisor_name: e.target.value})}>
                    <option value="">اختر المشرف</option>
                    {supervisors.map(s => <option key={s.id} value={s.full_name}>{s.full_name}</option>)}
                 </select>
              </div>
           </div>
        </section>

        <button 
          type="submit" 
          disabled={actionLoading} 
          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black shadow-xl hover:bg-black transition-all flex items-center justify-center disabled:opacity-50 active:scale-95"
        >
           {actionLoading ? <Loader2 className="animate-spin ml-2" size={24} /> : <CheckCircle2 className="ml-2" size={24} />}
           {editingStudent ? 'حفظ التعديلات' : 'تسجيل الطالب'}
        </button>

      </form>
    </div>
  );
};

export default StudentForm;