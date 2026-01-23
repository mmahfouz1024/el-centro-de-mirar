
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Shield, 
  Bell, 
  LogOut, 
  Check, 
  Award, 
  Clock, 
  Users,
  Settings,
  ChevronLeft,
  X,
  TrendingUp,
  CalendarDays,
  ShieldCheck,
  Briefcase,
  Star,
  Save,
  Lock,
  Eye,
  Calendar,
  CheckCircle2,
  Sparkles,
  Crown,
  Zap,
  FileText
} from 'lucide-react';
import { db } from '../services/supabase';

interface ProfileProps {
  user?: any;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    username: '',
    password: '', // Only used for updates if provided
    address: '',
    birth_date: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await db.profiles.getById(user.id);
      if (data) {
        setProfileData(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          username: data.username || '',
          password: data.password || '', // Usually shouldn't expose password, but this seems to be the design
          address: data.address || '',
          birth_date: data.birth_date || ''
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await db.profiles.update(user.id, formData);
      alert('تم تحديث البيانات بنجاح');
      fetchProfile();
    } catch (error) {
      alert('فشل التحديث');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>يرجى تسجيل الدخول</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
               <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1 shadow-2xl overflow-hidden">
                  <div className="w-full h-full bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 font-black text-4xl uppercase">
                     {user.full_name?.[0]}
                  </div>
               </div>
               <button className="absolute bottom-0 right-0 p-3 bg-blue-600 rounded-2xl shadow-lg hover:bg-blue-500 transition-colors">
                  <Camera size={20} />
               </button>
            </div>
            
            <div className="text-center md:text-right flex-1">
               <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-3 backdrop-blur-md">
                  <Crown size={14} className="text-amber-400 ml-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{user.role} Account</span>
               </div>
               <h2 className="text-3xl font-black mb-2">{user.full_name}</h2>
               <p className="text-slate-400 font-medium">@{user.username}</p>
               
               <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                  <div className="flex items-center px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                     <Clock size={16} className="ml-2 text-emerald-400" />
                     <span className="text-xs font-bold">آخر ظهور: اليوم</span>
                  </div>
                  <div className="flex items-center px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                     <ShieldCheck size={16} className="ml-2 text-blue-400" />
                     <span className="text-xs font-bold">الحساب مؤمن</span>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from)_0%,_transparent_70%)] from-blue-500/10 opacity-50"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Sidebar Info */}
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
               <h3 className="font-black text-slate-800 text-lg flex items-center">
                  <User size={20} className="ml-2 text-blue-600" /> المعلومات الشخصية
               </h3>
               
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                     <div className="flex items-center">
                        <Briefcase size={18} className="ml-3 text-slate-400" />
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase">القسم</p>
                           <p className="text-xs font-bold text-slate-700">{profileData?.branch || 'الرئيسي'}</p>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                     <div className="flex items-center">
                        <Phone size={18} className="ml-3 text-slate-400" />
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase">الهاتف</p>
                           <p className="text-xs font-bold text-slate-700 dir-ltr">{formData.phone || '---'}</p>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                     <div className="flex items-center">
                        <MapPin size={18} className="ml-3 text-slate-400" />
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase">العنوان</p>
                           <p className="text-xs font-bold text-slate-700">{formData.address || '---'}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <button 
               onClick={onLogout} 
               className="w-full bg-rose-50 text-rose-600 py-4 rounded-[2rem] font-black text-sm flex items-center justify-center hover:bg-rose-100 transition-all border border-rose-100"
            >
               <LogOut size={18} className="ml-2" />
               تسجيل الخروج
            </button>
            
            <div className="text-center space-y-1">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">El Centro de Mirar للتعليم واللغات</p>
               <p className="text-[8px] font-bold text-slate-200 uppercase tracking-[0.4em]">v2.5.0 Enterprise</p>
            </div>
         </div>

         {/* Edit Form */}
         <div className="lg:col-span-2">
            <div className="bg-white p-8 lg:p-10 rounded-[3rem] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-slate-800 text-xl">تحديث البيانات</h3>
                  <button onClick={fetchProfile} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl"><RefreshCwIcon size={18}/></button>
               </div>

               <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الاسم الكامل</label>
                        <input 
                           type="text" 
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                           value={formData.full_name}
                           onChange={e => setFormData({...formData, full_name: e.target.value})}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم الهاتف</label>
                        <input 
                           type="tel" 
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                           value={formData.phone}
                           onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم المستخدم</label>
                        <input 
                           type="text" 
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                           value={formData.username}
                           onChange={e => setFormData({...formData, username: e.target.value})}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">كلمة المرور</label>
                        <div className="relative">
                           <input 
                              type="text" 
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                              value={formData.password}
                              onChange={e => setFormData({...formData, password: e.target.value})}
                           />
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        </div>
                     </div>
                     <div className="col-span-full space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">العنوان</label>
                        <input 
                           type="text" 
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                           value={formData.address}
                           onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                     </div>
                  </div>

                  <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black shadow-xl flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 mt-8"
                  >
                     {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-2"></div> : <Save className="ml-2" size={18} />}
                     حفظ التغييرات
                  </button>
               </form>
            </div>
         </div>
      </div>
    </div>
  );
};

const RefreshCwIcon = ({ size }: { size: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

export default Profile;
