
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  User, 
  Loader2, 
  CheckCircle2, 
  CheckSquare, 
  Square,
  Wallet,
  Coins,
  Calendar,
  CalendarDays
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../services/supabase';
import { StudentLevel, Gender, EduSystem } from '../types';

const COUNTRY_DATA: Record<string, string> = {
  'السعودية': '+966',
  'مصر': '+20',
  'تركيا': '+90',
  'عمان': '+968',
  'قطر': '+974',
  'الامارات': '+971',
  'البحرين': '+973',
  'الكويت': '+965',
  'أمريكا': '+1',
  'فرنسا': '+33',
  'بريطانيا': '+44'
};

const COUNTRIES = Object.keys(COUNTRY_DATA);
const CURRENCIES = ['ريال سعودي', 'ريال عماني', 'ريال قطري', 'دينار أردني', 'دينار كويتي', 'دولار امريكي', 'جنيه مصري', 'ليرة تركية', 'يورو'];
const STUDY_TYPES = [
  { id: 'narration', label: 'رواية' },
  { id: 'recitation', label: 'قراءة' }
];

const StudentForm: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingStudent = location.state?.data;

  const [profiles, setProfiles] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const initialFormState = {
    name: '',
    join_date: new Date().toISOString().split('T')[0],
    subscription_start_date: new Date().toISOString().split('T')[0], 
    age: '', 
    country: 'السعودية',
    gender: Gender.MALE,
    address: '',
    edu_stage: 'الابتدائية',
    edu_system: EduSystem.GENERAL,
    school_name: '',
    student_phone: '',
    parent_phone: '',
    parent_country_code: '+966',
    level: StudentLevel.BEGINNER,
    current_juz: 30,
    last_hifz_date: '',
    total_memorized: 0,
    points: 0,
    branch: 'الرئيسي',
    section: 'بنين' as 'بنين' | 'بنات',
    halaqa: [] as string[],
    enrollment_programs: [] as string[],
    enrollment_notes: '',
    teacher_name: '',
    supervisor_name: '',
    paid_amount: '',
    currency: 'ريال سعودي',
    renewal_status: 'undecided',
    recitation_level: 'متوسط',
    memorization_status: '',
    interview_notes: '',
    admission_result: 'قبول',
    required_sessions_count: 1,
    preferred_schedule: {} as Record<string, { from: string, to: string }>
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchProfiles = async () => {
      const data = await db.profiles.getAll();
      setProfiles(data || []);
    };
    fetchProfiles();

    if (editingStudent) {
      setFormData({
        ...initialFormState,
        ...editingStudent,
        age: editingStudent.age ? editingStudent.age.toString() : '',
        paid_amount: editingStudent.paid_amount ? editingStudent.paid_amount.toString() : '',
        halaqa: Array.isArray(editingStudent.halaqa) ? editingStudent.halaqa : [],
        enrollment_programs: Array.isArray(editingStudent.enrollment_programs) ? editingStudent.enrollment_programs : [],
        last_hifz_date: editingStudent.last_hifz_date || '',
        join_date: editingStudent.join_date ? editingStudent.join_date.split('T')[0] : new Date().toISOString().split('T')[0],
        required_sessions_count: editingStudent.required_sessions_count || 1,
        preferred_schedule: editingStudent.preferred_schedule || {},
        renewal_status: editingStudent.renewal_status || 'undecided'
      });
    }
  }, [editingStudent]);

  const teachersList = useMemo(() => profiles.filter(p => p.role === 'teacher'), [profiles]);
  const supervisorsList = useMemo(() => profiles.filter(p => p.role === 'supervisor'), [profiles]);

  const handleCountryChange = (country: string) => {
    setFormData({
      ...formData,
      country: country,
      parent_country_code: COUNTRY_DATA[country] || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const studentNum = editingStudent?.student_number || Math.floor(10000 + Math.random() * 90000).toString();
      const payload = {
        ...formData,
        age: Number(formData.age) || 0,
        current_juz: Number(formData.current_juz) || 30,
        total_memorized: Number(formData.total_memorized) || 0,
        points: Number(formData.points) || 0,
        paid_amount: Number(formData.paid_amount) || 0,
        student_number: studentNum,
        last_hifz_date: formData.last_hifz_date ? formData.last_hifz_date : null,
        join_date: formData.join_date ? formData.join_date : new Date().toISOString(),
      };

      if (editingStudent) {
        await db.students.update(editingStudent.id, payload);
      } else {
        await db.students.create(payload);
      }
      
      navigate('/students');
    } catch (error: any) {
      alert(`فشل حفظ البيانات: ${error.message || 'يرجى التأكد من الاتصال بالإنترنت'}`); 
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStudyType = (type: string) => {
    // Note: This logic seems specific to Ijaza students, but the form structure was copied from main student form.
    // If regular students don't have study_types, this might be redundant or needs adaptation if merging functionalities.
    // Assuming this form is general student form based on context.
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex items-center space-x-4 space-x-reverse mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800">{editingStudent ? 'تعديل بيانات الطالب' : 'تسجيل طالب جديد'}</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">يرجى تعبئة كافة الأقسام المطلوبة بدقة</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 lg:p-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* 1. المعلومات الأساسية والنوع */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 space-x-reverse text-blue-700 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-black text-sm">1</div>
              <h4 className="font-black text-lg">المعلومات الأساسية والنوع</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الاسم الثلاثي</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="الاسم كما في الهوية" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">النوع</label>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  {[Gender.MALE, Gender.FEMALE].map(g => (
                    <button type="button" key={g} onClick={() => setFormData({...formData, gender: g})} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${formData.gender === g ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">العمر (بالسنين)</label>
                <input type="number" required min="4" max="90" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} placeholder="مثال: 10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المعلم</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer appearance-none" value={formData.teacher_name} onChange={e => setFormData({...formData, teacher_name: e.target.value})} disabled={user?.role === 'teacher'}>
                  <option value="">اختر المعلم</option>
                  {teachersList.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المشرف</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer appearance-none" value={formData.supervisor_name} onChange={e => setFormData({...formData, supervisor_name: e.target.value})}>
                  <option value="">اختر المشرف</option>
                  {supervisorsList.map(s => <option key={s.id} value={s.full_name}>{s.full_name}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* 2. التواصل والموقع الجغرافي */}
          <section className="space-y-6 border-t border-slate-50 pt-8">
            <div className="flex items-center space-x-2 space-x-reverse text-amber-600 mb-4">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-black text-sm">2</div>
              <h4 className="font-black text-lg">التواصل والموقع الجغرافي</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الدولة</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer appearance-none" value={formData.country} onChange={e => handleCountryChange(e.target.value)}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">جوال ولي الأمر</label>
                <div className="flex direction-ltr" dir="ltr">
                  <div className="w-20 bg-slate-100 border border-slate-200 rounded-l-2xl px-3 py-3.5 text-sm font-bold text-center flex items-center justify-center text-slate-600">{formData.parent_country_code}</div>
                  <input type="tel" className="flex-1 bg-slate-50 border border-slate-100 rounded-r-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10" value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} placeholder="5xxxxxxxx" />
                </div>
              </div>
            </div>
          </section>

          {/* 3. بيانات الاشتراك والمالية */}
          <section className="space-y-6 border-t border-slate-50 pt-8">
            <div className="flex items-center space-x-2 space-x-reverse text-emerald-700 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-black text-sm">3</div>
              <h4 className="font-black text-lg">بيانات الاشتراك والمالية</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                  <Wallet size={12} className="ml-1 text-emerald-600" /> المبلغ المدفوع
                </label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10" 
                  value={formData.paid_amount} 
                  onChange={e => setFormData({...formData, paid_amount: e.target.value})} 
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                  <Coins size={12} className="ml-1 text-amber-500" /> العملة
                </label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10 cursor-pointer appearance-none"
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                  <Calendar size={12} className="ml-1 text-blue-600" /> تاريخ الاشتراك
                </label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" 
                  value={formData.join_date} 
                  onChange={e => setFormData({...formData, join_date: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                  <CalendarDays size={12} className="ml-1 text-purple-600" /> تاريخ بداية الدراسة
                </label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/10" 
                  value={formData.subscription_start_date} 
                  onChange={e => setFormData({...formData, subscription_start_date: e.target.value})} 
                />
              </div>
            </div>
          </section>

          <button type="submit" disabled={actionLoading} className="w-full bg-blue-700 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all flex items-center justify-center active:scale-95 disabled:opacity-50 mt-8">
            {actionLoading ? <Loader2 className="animate-spin ml-2" size={24} /> : <CheckCircle2 className="ml-2" size={24} />}
            {editingStudent ? 'حفظ التعديلات' : 'اعتماد تسجيل الطالب'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
