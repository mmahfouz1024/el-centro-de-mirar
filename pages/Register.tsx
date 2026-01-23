
import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Users, 
  MapPin, 
  MessageSquare, 
  HelpCircle, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { db } from '../services/supabase';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    schoolName: '',
    username: '',
    supervisorName: '',
    phone: '',
    email: '',
    studentsCount: '',
    location: '',
    referralSource: '',
    notes: ''
  });

  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'يجب أن يكون اسم المستخدم بالأحرف الإنجليزية والأرقام فقط';
    }
    if (formData.phone.length < 11) {
      newErrors.phone = 'يرجى إدخال رقم موبايل صحيح مكون من 11 رقم';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      await db.subscriptions.create(formData);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-right" dir="rtl">
        <div className="max-w-xl w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-emerald-50 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">تم استلام طلبك بنجاح!</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            شكراً لاهتمامكم بالانضمام لمنصة تبصرة. سيقوم فريقنا بمراجعة بيانات مدرسة <span className="text-emerald-600 font-black">"{formData.schoolName}"</span> والتواصل معكم عبر رقم الموبايل المرفق خلال 24 ساعة.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center mx-auto hover:bg-slate-800 transition-all"
          >
            العودة للرئيسية
            <ArrowRight size={20} className="mr-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-12 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center space-x-4 space-x-reverse cursor-pointer" onClick={() => navigate('/')}>
            <Logo size={80} />
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter">طلب اشتراك جديد</h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">انضم إلى مجتمع منصة تبصرة التعليمي</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-slate-400 font-bold hover:text-blue-700 transition-colors"
          >
            إلغاء والعودة
            <ChevronLeft size={20} className="mr-1" />
          </button>
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100 grid grid-cols-1 lg:grid-cols-12">
          {/* Form Sidebar Info */}
          <div className="lg:col-span-4 bg-blue-700 p-10 text-white relative overflow-hidden">
             <div className="relative z-10">
                <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/20">
                   <Sparkles size={32} />
                </div>
                <h3 className="text-2xl font-black mb-6">خطوات بسيطة للبدء</h3>
                <ul className="space-y-6">
                   <li className="flex items-start">
                      <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-3 text-xs font-black">1</div>
                      <p className="text-sm font-medium leading-relaxed">املأ بيانات مدرستك أو مركزك في النموذج المقابل بدقة.</p>
                   </li>
                   <li className="flex items-start">
                      <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-3 text-xs font-black">2</div>
                      <p className="text-sm font-medium leading-relaxed">سيتم إنشاء حساب تجريبي وتجهيز لوحة التحكم الخاصة بكم.</p>
                   </li>
                   <li className="flex items-start">
                      <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-3 text-xs font-black">3</div>
                      <p className="text-sm font-medium leading-relaxed">سنتواصل معك هاتفياً لإتمام التفعيل والتدريب على المنصة.</p>
                   </li>
                </ul>
             </div>
             <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-8 p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* School Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم المدرسة / المركز</label>
                  <div className="relative">
                    <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="مثال: مدرسة النور القرآنية"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم المستخدم (إنجليزي)</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" required
                      dir="ltr"
                      className={`w-full bg-slate-50 border rounded-2xl pr-12 pl-4 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-right ${errors.username ? 'border-rose-300 bg-rose-50' : 'border-slate-100'}`}
                      placeholder="e.g. noor_school"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                  {errors.username && <p className="text-rose-500 text-[10px] font-bold mt-1 mr-1">{errors.username}</p>}
                </div>

                {/* Supervisor Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم المشرف المسؤول</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="الاسم الثلاثي"
                      value={formData.supervisorName}
                      onChange={(e) => setFormData({...formData, supervisorName: e.target.value})}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم الموبايل</label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="tel" required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="01xxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  {errors.phone && <p className="text-rose-500 text-[10px] font-bold mt-1 mr-1">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="email" required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                {/* Students Count */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">عدد الطلاب / الطالبات</label>
                  <div className="relative">
                    <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="number" required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="مثال: 150"
                      value={formData.studentsCount}
                      onChange={(e) => setFormData({...formData, studentsCount: e.target.value})}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">المدينة - الحي</label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="مثال: القاهرة - حلوان"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>

                {/* Referral Source */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">كيف تعرفت على منصة تبصرة؟</label>
                  <div className="relative">
                    <HelpCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none"
                      value={formData.referralSource}
                      onChange={(e) => setFormData({...formData, referralSource: e.target.value})}
                    >
                      <option value="">اختر خياراً...</option>
                      <option value="social">وسائل التواصل الاجتماعي</option>
                      <option value="friend">صديق أو زميل</option>
                      <option value="search">بحث جوجل</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">ملاحظات أخرى (اختياري)</label>
                  <div className="relative">
                    <MessageSquare className="absolute right-4 top-6 text-slate-300" size={18} />
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none h-32 resize-none"
                      placeholder="أي معلومات إضافية ترغب في ذكرها..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all flex items-center justify-center active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin ml-2" size={24} /> : null}
                إرسال طلب الانضمام
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
