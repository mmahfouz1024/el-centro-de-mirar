
import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2,
  LogIn,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Globe,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { db } from '../services/supabase';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      setLoading(true);
      setError('');
      try {
        const userData = await db.auth.signIn(username, password);
        if (userData) {
          onLogin(userData);
        } else {
          setError('بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى.');
        }
      } catch (err) {
        setError('تعذر الاتصال بالخادم، يرجى التحقق من الإنترنت.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-['Tajawal'] text-right" dir="rtl">
      
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0 bg-[#0f172a]">
         <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] animate-float-slow"></div>
         <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] animate-float-slow" style={{animationDelay: '2s'}}></div>
         <div className="absolute top-[30%] left-[30%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] animate-pulse-glow"></div>
         
         {/* Pattern Overlay */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      {/* زر العودة */}
      <button 
        onClick={() => navigate('/landing')}
        className="absolute top-8 left-8 z-20 text-white/50 hover:text-amber-400 transition-all flex items-center text-xs font-black uppercase tracking-widest group bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 hover:border-amber-400/50"
      >
        <ArrowLeft size={16} className="ml-2 group-hover:-translate-x-1 transition-transform" />
        العودة للموقع
      </button>

      <div className="relative z-10 w-full max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* نصوص ترحيبية جانبية */}
        <div className="hidden lg:block space-y-10 animate-in fade-in slide-in-from-right duration-1000">
           <div className="space-y-6">
              <div className="inline-flex items-center px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-full mb-2 backdrop-blur-md">
                 <Sparkles size={14} className="ml-2 animate-spin-slow" />
                 <span className="text-[10px] font-black uppercase tracking-widest">بوابة التعليم الذكي</span>
              </div>
              
              <h1 className="text-7xl font-black text-white leading-tight tracking-tighter drop-shadow-lg">
                 El Centro <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">de MIRAR</span>
              </h1>
              
              <p className="text-slate-300 text-2xl font-medium leading-relaxed max-w-md">
                 المركز الأول لتعليم <span className="text-white border-b-2 border-amber-500/50">اللغة الإسبانية</span> والعلوم الحديثة في مدينة الزقازيق.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-6 max-w-md">
              <div className="glass-card bg-white/5 border-white/10 p-5 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-colors group">
                 <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <ShieldCheck size={24} />
                 </div>
                 <span className="text-xs font-black text-white uppercase tracking-widest">تشفير آمن</span>
              </div>
              <div className="glass-card bg-white/5 border-white/10 p-5 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-colors group">
                 <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <Globe size={24} />
                 </div>
                 <span className="text-xs font-black text-white uppercase tracking-widest">وصول سحابي</span>
              </div>
           </div>
        </div>

        {/* كارت تسجيل الدخول */}
        <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in duration-700 delay-200">
          <div className="w-full max-w-[480px] bg-white/10 backdrop-blur-2xl p-10 lg:p-14 rounded-[3.5rem] border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative group overflow-hidden">
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

            <div className="text-center mb-12 relative z-10">
               <div className="inline-block p-1.5 bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 rounded-full mb-6 shadow-2xl shadow-emerald-500/20 animate-float">
                  <div className="bg-[#0f172a] p-4 rounded-full">
                     <Logo size={80} />
                  </div>
               </div>
               <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">بوابة الدخول</h2>
               <p className="text-slate-400 font-bold text-sm mt-3">سجل دخولك لمتابعة العمليات التعليمية</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                {error && (
                  <div className="bg-rose-500/90 backdrop-blur-md text-white p-4 rounded-2xl text-xs font-black text-center flex items-center justify-center shadow-lg animate-shake border border-rose-400/50">
                    <AlertCircle size={16} className="ml-2" />
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-2 flex items-center">
                    <User size={12} className="ml-2 text-emerald-400" /> اسم المستخدم
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500"></div>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-[#0a1122]/80 border border-white/10 rounded-2xl pr-14 pl-4 py-5 text-sm font-bold text-white outline-none transition-all focus:border-emerald-500 focus:bg-[#0a1122] placeholder:text-slate-600 relative z-10"
                      placeholder="Enter Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 z-20 group-focus-within/input:text-emerald-500 transition-colors" size={22} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-2 flex items-center">
                    <Lock size={12} className="ml-2 text-amber-400" /> كلمة المرور
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500"></div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      className="w-full bg-[#0a1122]/80 border border-white/10 rounded-2xl pr-14 pl-14 py-5 text-sm font-bold text-white outline-none transition-all focus:border-amber-500 focus:bg-[#0a1122] placeholder:text-slate-600 relative z-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 z-20 group-focus-within/input:text-amber-500 transition-colors" size={22} />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors z-20"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 rounded-2xl font-black text-lg flex items-center justify-center transition-all shadow-xl shadow-emerald-900/50 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 group/btn relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                  {loading ? (
                    <Loader2 className="animate-spin" size={28} />
                  ) : (
                    <>
                      <span className="relative z-10">دخول للمنصة</span>
                      <LogIn size={24} className="mr-3 group-hover/btn:translate-x-[-4px] transition-transform relative z-10" />
                    </>
                  )}
                </button>
            </form>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center gap-4 relative z-10">
               <div className="flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                     <CheckCircle size={14} className="text-emerald-500" />
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Enterprise Edition</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">v2.5.0</span>
               </div>
               <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">Powered by Software Gates Store</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
