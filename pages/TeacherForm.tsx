
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  User, 
  CreditCard,
  Phone,
  Smartphone,
  Fingerprint,
  Lock,
  Briefcase,
  CheckSquare,
  Square
} from 'lucide-react';
import { db } from '../services/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

const TARGET_AUDIENCE_OPTIONS = ['أطفال', 'رجال', 'نساء'];
const SPECIALIZATION_OPTIONS = ['التحفيظ', 'التجويد', 'المتون', 'الإجازات'];

const TeacherForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingTeacher = location.state?.data;

  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'ذكر',
    phone: '',
    vodafone_cash: '',
    instapay: '',
    username: '',
    password: '',
    target_audience: [] as string[],
    specialization: 'التحفيظ',
    // Hidden default fields
    role: 'teacher',
    avatar: '',
    branch: 'الرئيسي' 
  });

  useEffect(() => {
    if (editingTeacher) {
      setFormData({
        full_name: editingTeacher.full_name || '',
        age: editingTeacher.age ? editingTeacher.age.toString() : '',
        gender: editingTeacher.gender || 'ذكر',
        phone: editingTeacher.phone || '',
        vodafone_cash: editingTeacher.vodafone_cash || '',
        instapay: editingTeacher.instapay || '',
        username: editingTeacher.username || '',
        password: editingTeacher.password || '', 
        target_audience: editingTeacher.target_audience || [],
        specialization: editingTeacher.specialization || 'التحفيظ',
        role: 'teacher',
        avatar: editingTeacher.avatar || '',
        branch: editingTeacher.branch || 'الرئيسي'
      });
    }
  }, [editingTeacher]);

  const handleAudienceToggle = (category: string) => {
    setFormData(prev => {
      const current = prev.target_audience || [];
      if (current.includes(category)) {
        return { ...prev, target_audience: current.filter(c => c !== category) };
      } else {
        return { ...prev, target_audience: [...current, category] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age) || 0,
        avatar: formData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.full_name}`,
      };

      if (editingTeacher) {
        await db.teachers.update(editingTeacher.id, payload);
      } else {
        await db.teachers.create(payload);
      }
      navigate('/teachers');
    } catch (error: any) {
      alert('حدث خطأ أثناء حفظ البيانات: ' + (error.message || 'يرجى مراجعة الاتصال'));
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
          <h2 className="text-2xl font-black text-slate-800">{editingTeacher ? 'تعديل ملف معلم' : 'تسجيل معلم جديد'}</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">إدارة بيانات عضو هيئة التدريس</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 lg:p-12">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* 1. البيانات الشخصية */}
          <div className="space-y-6">
            <h4 className="text-blue-700 font-black text-xs uppercase tracking-widest flex items-center border-b border-blue-50 pb-2">
              <User size={16} className="ml-2" />
              ١. البيانات الأساسية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الاسم</label>
                <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">العمر</label>
                <input type="number" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">النوع</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none cursor-pointer appearance-none"
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. بيانات الاتصال والدفع */}
          <div className="space-y-6">
            <h4 className="text-emerald-700 font-black text-xs uppercase tracking-widest flex items-center border-b border-emerald-50 pb-2">
              <CreditCard size={16} className="ml-2" />
              ٢. الاتصال والدفع
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="tel" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم فودافون كاش</label>
                <div className="relative">
                  <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
                  <input type="tel" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold outline-none" value={formData.vodafone_cash} onChange={e => setFormData({...formData, vodafone_cash: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم انستاباى</label>
                <div className="relative">
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500" size={18} />
                  <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold outline-none" value={formData.instapay} onChange={e => setFormData({...formData, instapay: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          {/* 3. بيانات الحساب */}
          <div className="space-y-6">
            <h4 className="text-amber-600 font-black text-xs uppercase tracking-widest flex items-center border-b border-amber-50 pb-2">
              <Fingerprint size={16} className="ml-2" />
              ٣. بيانات الدخول
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم المستخدم</label>
                <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          {/* 4. التخصص والفئات */}
          <div className="space-y-6">
            <h4 className="text-purple-700 font-black text-xs uppercase tracking-widest flex items-center border-b border-purple-50 pb-2">
              <Briefcase size={16} className="ml-2" />
              ٤. التخصص والفئة المستهدفة
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">التخصص العلمي</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none cursor-pointer appearance-none"
                  value={formData.specialization}
                  onChange={e => setFormData({...formData, specialization: e.target.value})}
                >
                  {SPECIALIZATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الفئة التي يدرسها (اختيار متعدد)</label>
                <div className="flex flex-wrap gap-3">
                  {TARGET_AUDIENCE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAudienceToggle(opt)}
                      className={`flex items-center px-6 py-3 rounded-2xl text-xs font-black transition-all border ${
                        formData.target_audience.includes(opt) 
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                        : 'bg-white text-slate-500 border-slate-100 hover:border-purple-200'
                      }`}
                    >
                      {formData.target_audience.includes(opt) ? <CheckSquare size={16} className="ml-2" /> : <Square size={16} className="ml-2" />}
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={actionLoading} 
            className="w-full bg-blue-700 text-white py-6 rounded-[2.5rem] font-black shadow-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 text-lg"
          >
            {actionLoading ? <Loader2 className="animate-spin ml-2" size={24} /> : <CheckCircle2 className="ml-2" size={24} />}
            {editingTeacher ? 'حفظ التعديلات' : 'تسجيل المعلم'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
