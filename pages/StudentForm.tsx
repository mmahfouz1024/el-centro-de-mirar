
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
  CalendarDays,
  Globe,
  Layers,
  Clock,
  Timer,
  Hash,
  Check,
  Edit3
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../services/supabase';
import { StudentLevel, Gender, EduSystem } from '../types';

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
const CURRENCIES = ['درهم إماراتي', 'ريال سعودي', 'ريال عماني', 'ريال قطري', 'دينار أردني', 'دينار كويتي', 'دولار امريكي', 'جنيه مصري', 'ليرة تركية', 'يورو'];
const LANGUAGE_OPTIONS = ['اسبانى', 'انجليزى', 'المانى', 'فرنساوى', 'ايطالى'];
const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

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
    last_hifz_date: '',
    total_memorized: 0,
    points: 0,
    branch: 'الرئيسي',
    section: 'بنين' as 'بنين' | 'بنات',
    teacher_name: '',
    supervisor_name: '',
    paid_amount: '',
    currency: 'جنيه مصري', 
    renewal_status: 'undecided',
    recitation_level: 'متوسط',
    memorization_status: '',
    interview_notes: '',
    admission_result: 'قبول',
    enrolled_language: 'اسبانى',
    required_sessions_count: '', // جعلناها نصية للتحكم اليدوي
    session_duration: 30, // قيمة افتراضية في الخلفية فقط
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
        last_hifz_date: editingStudent.last_hifz_date || '',
        join_date: editingStudent.join_date ? editingStudent.join_date.split('T')[0] : new Date().toISOString().split('T')[0],
        required_sessions_count: editingStudent.required_sessions_count?.toString() || '',
        preferred_schedule: editingStudent.preferred_schedule || {},
        renewal_status: editingStudent.renewal_status || 'undecided',
        level: editingStudent.level || 'مبتدئ'
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

  const toggleDaySchedule = (day: string) => {
    const newSchedule = { ...formData.preferred_schedule };
    if (newSchedule[day]) {
      delete newSchedule[day];
    } else {
      newSchedule[day] = { from: '16:00', to: '16:30' };
    }
    setFormData({ ...formData, preferred_schedule: newSchedule });
  };

  const updateDayTime = (day: string, type: 'from' | 'to', value: string) => {
    setFormData({
      ...formData,
      preferred_schedule: {
        ...formData.preferred_schedule,
        [day]: { ...formData.preferred_schedule[day], [type]: value }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const studentNum = editingStudent?.student_number || Math.floor(10000 + Math.random() * 90000).toString();
      
      const payload = {
        name: formData.name,
        age: Number(formData.age) || 0,
        country: formData.country,
        gender: formData.gender,
        address: formData.address,
        edu_stage: formData.edu_stage,
        edu_system: formData.edu_system,
        school_name: formData.school_name,
        student_phone: formData.student_phone,
        parent_phone: formData.parent_phone,
        parent_country_code: formData.parent_country_code,
        level: formData.level,
        current_juz: Number(formData.current_juz) || 30,
        total_memorized: Number(formData.total_memorized) || 0,
        points: Number(formData.points) || 0,
        branch: formData.branch,
        section: formData.section,
        teacher_name: formData.teacher_name,
        supervisor_name: formData.supervisor_name,
        paid_amount: Number(formData.paid_amount) || 0,
        currency: formData.currency,
        renewal_status: formData.renewal_status,
        student_number: studentNum,
        last_hifz_date: formData.last_hifz_date || null,
        join_date: formData.join_date || new Date().toISOString(),
        enrolled_language: formData.enrolled_language,
        required_sessions_count: Number(formData.required_sessions_count) || 0,
        session_duration: 30, // محذوف من الواجهة ولكن محفوظ بقيمة افتراضية
        preferred_schedule: formData.preferred_schedule
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

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 lg:p-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* 1. المعلومات الأساسية واللغة */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 space-x-reverse text-blue-700 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-black text-sm">1</div>
              <h4 className="font-black text-lg">المعلومات الأساسية ومسار اللغة</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">اللغة المراد الالتحاق بها</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setFormData({...formData, enrolled_language: lang})}
                      className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                        formData.enrolled_language === lang 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الاسم الثلاثي للطالب</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="الاسم الكامل للطالب" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المستوى</label>
                <div className="relative">
                  <Layers className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" 
                    value={formData.level} 
                    onChange={e => setFormData({...formData, level: e.target.value})} 
                    placeholder="مثال: A1، تمهيدي، متقدم..." 
                  />
                </div>
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
            </div>
          </section>

          {/* 4. تفاصيل المواعيد والجدول الدراسي */}
          <section className="space-y-6 border-t border-slate-50 pt-8">
            <div className="flex items-center space-x-2 space-x-reverse text-purple-700 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-black text-sm">2</div>
              <h4 className="font-black text-lg">تفاصيل المواعيد والجدول الدراسي</h4>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-1.5 max-w-md">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                  <Edit3 size={12} className="ml-1 text-purple-600" /> إجمالي عدد المحاضرات (يدوي)
                </label>
                <div className="relative">
                  <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="number" 
                    required 
                    min="1"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all"
                    value={formData.required_sessions_count}
                    onChange={e => setFormData({...formData, required_sessions_count: e.target.value})}
                    placeholder="أدخل عدد المحاضرات الإجمالي..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                <Clock size={12} className="ml-1 text-purple-600" /> تحديد المواعيد المفضلة أسبوعياً
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {DAYS_OF_WEEK.map(day => {
                  const isSelected = !!formData.preferred_schedule[day];
                  return (
                    <div key={day} className={`p-4 rounded-2xl border-2 transition-all ${isSelected ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-50 hover:border-slate-100'}`}>
                       <button 
                        type="button"
                        onClick={() => toggleDaySchedule(day)}
                        className="flex items-center justify-between w-full mb-3"
                       >
                          <span className={`text-xs font-black ${isSelected ? 'text-purple-700' : 'text-slate-400'}`}>{day}</span>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-transparent'}`}>
                             <Check size={14} />
                          </div>
                       </button>

                       {isSelected && (
                         <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between">
                               <span className="text-[8px] font-black text-slate-400 uppercase">من</span>
                               <input 
                                type="time" 
                                className="bg-white border border-purple-100 rounded-lg px-2 py-1 text-[10px] font-bold outline-none"
                                value={formData.preferred_schedule[day].from}
                                onChange={e => updateDayTime(day, 'from', e.target.value)}
                               />
                            </div>
                            <div className="flex items-center justify-between">
                               <span className="text-[8px] font-black text-slate-400 uppercase">إلى</span>
                               <input 
                                type="time" 
                                className="bg-white border border-purple-100 rounded-lg px-2 py-1 text-[10px] font-bold outline-none"
                                value={formData.preferred_schedule[day].to}
                                onChange={e => updateDayTime(day, 'to', e.target.value)}
                               />
                            </div>
                         </div>
                       )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* 2. التواصل والموقع الجغرافي */}
          <section className="space-y-6 border-t border-slate-50 pt-8">
            <div className="flex items-center space-x-2 space-x-reverse text-amber-600 mb-4">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-black text-sm">3</div>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">جوال ولي الأمر (واتساب)</label>
                <div className="flex direction-ltr" dir="ltr">
                  <div className="w-20 bg-slate-100 border border-slate-200 rounded-l-2xl px-3 py-3.5 text-sm font-bold text-center flex items-center justify-center text-slate-600">{formData.parent_country_code}</div>
                  <input type="tel" className="flex-1 bg-slate-50 border border-slate-100 rounded-r-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10" value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} placeholder="5xxxxxxxx" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">العنوان بالتفصيل</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="الحي، الشارع..." />
              </div>
            </div>
          </section>

          {/* 3. بيانات الاشتراك والمالية */}
          <section className="space-y-6 border-t border-slate-50 pt-8">
            <div className="flex items-center space-x-2 space-x-reverse text-emerald-700 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-black text-sm">4</div>
              <h4 className="font-black text-lg">بيانات الاشتراك والمالية</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                  <Wallet size={12} className="ml-1 text-emerald-600" /> المبلغ المحصل
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
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer appearance-none"
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                  <Calendar size={12} className="ml-1 text-blue-600" /> تاريخ الانضمام
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
                  <CalendarDays size={12} className="ml-1 text-purple-600" /> موعد أول حصة
                </label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" 
                  value={formData.subscription_start_date} 
                  onChange={e => setFormData({...formData, subscription_start_date: e.target.value})} 
                />
              </div>
            </div>
          </section>

          <button type="submit" disabled={actionLoading} className="w-full bg-blue-700 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all flex items-center justify-center active:scale-95 disabled:opacity-50 mt-8">
            {actionLoading ? <Loader2 className="animate-spin ml-2" size={24} /> : <CheckCircle2 className="ml-2" size={24} />}
            {editingStudent ? 'تحديث بيانات الطالب' : 'إتمام تسجيل الطالب'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
