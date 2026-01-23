
import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Loader2, 
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { db } from '../services/supabase';

interface ManagerLoginProps {
  onLogin: (userData: any) => void;
}

const ManagerLogin: React.FC<ManagerLoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // التحقق من أن الدور هو 'manager' حصراً لهذه الصفحة
      const userData = await db.auth.signIn(username, password);
      if (userData && userData.role === 'manager') {
        onLogin(userData);
      } else {
        setError('بيانات الدخول غير صحيحة أو ليس لديك صلاحية المدير العام.');
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالنظام.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-blue-900/20 opacity-50"></div>
      
      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="text-center mb-10">
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-[3rem] border border-white/10 inline-block mb-8 shadow-2xl">
             <Logo size={80} />
          </div>
          <div className="inline-flex items-center px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full mb-4">
             <ShieldCheck size={16} className="ml-2" />
             <span className="text-[10px] font-black uppercase tracking-widest">بوابة القيادة العليا (GM Access)</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">تسجيل دخول المدير العام</h1>
          <p className="text-slate-400 font-bold text-sm mt-2">يرجى إدخال مفتاح الوصول السري</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-8 lg:p-10 rounded-[3rem] shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6 text-right">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">معرف المدير</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold text-white focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-600"
                  placeholder="Manager ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">المفتاح السري</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pr-12 pl-12 py-4 text-sm font-bold text-white focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-slate-900 py-4 rounded-2xl font-black shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-all flex items-center justify-center space-x-2 space-x-reverse active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin ml-2" size={20} /> : (
                <>
                  <span>ولوج للنظام</span>
                  <ShieldCheck size={20} />
                </>
              )}
            </button>
          </form>

          <button 
            onClick={() => navigate('/landing')}
            className="w-full mt-8 py-3 border border-white/5 rounded-2xl text-[10px] font-black text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all uppercase tracking-widest flex items-center justify-center"
          >
            <ArrowRight size={14} className="ml-2" />
            العودة للمنصة العامة
          </button>
        </div>
      </div>
      
      <p className="text-slate-600 font-black text-[9px] mt-12 uppercase tracking-[0.3em]">
        Proprietary Access • Center Dawood GM Portal v2.5
      </p>
    </div>
  );
};

export default ManagerLogin;
