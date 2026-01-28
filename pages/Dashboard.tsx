
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Trophy,
  Crown,
  Loader2,
  UserCheck,
  Star,
  ShieldCheck,
  Users,
  Briefcase,
  BookOpen,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ArrowUpRight,
  Activity,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/supabase';

const Dashboard: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: [] as any[],
    teachers: [] as any[],
    classes: [] as any[],
    supervisors: [] as any[],
    loading: true
  });

  const isGenSup = user?.role === 'general_supervisor';

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      const [studentsData, classesData, profilesData] = await Promise.all([
        db.students.getAll(),
        db.classes.getAll(),
        db.profiles.getAll()
      ]);
      
      let filteredStudents = studentsData || [];
      let filteredClasses = classesData || [];
      let filteredTeachers = profilesData?.filter((p: any) => p.role === 'teacher') || [];
      const supervisorsList = profilesData?.filter((p: any) => p.role === 'supervisor') || [];

      if (!isGenSup && user?.role === 'supervisor') {
         filteredStudents = filteredStudents.filter((s: any) => s.supervisor_name === user.full_name);
         const teacherNames = [...new Set(filteredStudents.map((s: any) => s.teacher_name))];
         filteredTeachers = filteredTeachers.filter((t: any) => teacherNames.includes(t.full_name));
         filteredClasses = filteredClasses.filter((c: any) => teacherNames.includes(c.teacher));
      }

      setStats({
        students: filteredStudents,
        classes: filteredClasses,
        teachers: filteredTeachers,
        supervisors: supervisorsList,
        loading: false
      });
    } catch (error) {
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // حساب إحصائيات الطلاب المطلوبة
  const studentMetrics = useMemo(() => {
    const total = stats.students.length;
    const renewed = stats.students.filter(s => s.renewal_status === 'yes').length;
    const stopped = stats.students.filter(s => s.renewal_status === 'no').length;
    return { total, renewed, stopped };
  }, [stats.students]);

  const chartData = useMemo(() => {
    const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
    const baseValue = stats.students.length > 0 ? stats.students.length * 0.8 : 10;
    return days.map((day) => ({
      name: day,
      attendance: Math.round(baseValue * (0.85 + Math.random() * 0.1)),
      memorization: Math.round(baseValue * (0.6 + Math.random() * 0.2))
    }));
  }, [stats.students]);

  if (stats.loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-6" size={60} />
      <p className="font-black text-sm uppercase tracking-[0.3em] text-slate-800">جاري تحليل البيانات...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 text-right" dir="rtl">
      
      {/* Welcome Hero */}
      <div className={`p-10 lg:p-14 rounded-3xl text-white shadow-2xl relative overflow-hidden bg-premium-dark`}>
         <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
         <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

         <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-10">
            <div className="text-right space-y-6">
               <div className="inline-flex items-center px-6 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
                  {isGenSup ? <Crown size={20} className="ml-3 text-amber-400" /> : <ShieldCheck size={20} className="ml-3 text-emerald-400" />}
                  <span className="text-[12px] font-black uppercase tracking-[0.3em]">{isGenSup ? 'رئيس هيئة الإشراف' : 'لوحة الإشراف الذكية'}</span>
               </div>
               <h2 className="text-4xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                  مرحباً بك في <br/>
                  <span className="text-gradient-gold">El Centro de Mirar</span>
               </h2>
               <p className="text-slate-300 text-lg font-medium max-w-2xl leading-relaxed">
                  نظام إدارة شامل مدعوم بالذكاء الاصطناعي لضمان أعلى مستويات الجودة في تعليم اللغات والعلوم.
               </p>
               <div className="flex gap-4">
                  <button onClick={() => navigate('/students')} className="bg-white text-slate-900 px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-amber-500 hover:text-white transition-all shadow-xl">بدء المتابعة</button>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 w-full xl:w-auto">
               <div className="glass-card bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 text-center hover:scale-105 transition-all">
                  <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                     <Users size={28} className="text-white" />
                  </div>
                  <span className="block text-4xl font-black">{studentMetrics.total}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mt-2 block">طالب نشط</span>
               </div>
               <div className="glass-card bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 text-center hover:scale-105 transition-all">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                     <BookOpen size={28} className="text-white" />
                  </div>
                  <span className="block text-4xl font-black">{stats.classes.length}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mt-2 block">حلقة دراسية</span>
               </div>
            </div>
         </div>
      </div>

      {/* KPI Stats Grid - تم تحديث العناصر المطلوبة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
            { label: 'سجل المحاضرين', icon: GraduationCap, val: stats.teachers.length, path: '/teachers', color: 'blue' },
            { label: 'إجمالي الطلاب', icon: Users, val: studentMetrics.total, path: '/students', color: 'indigo' },
            { label: 'الطلاب المجددون', icon: UserCheck, val: studentMetrics.renewed, path: '/renewal-followup', color: 'emerald' },
            { label: 'الطلاب المتوقفون', icon: UserMinus, val: studentMetrics.stopped, path: '/renewal-followup', color: 'rose' },
         ].map((item, idx) => (
            <div 
               key={idx} 
               onClick={() => navigate(item.path)}
               className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl custom-shadow hover:-translate-y-2 transition-all cursor-pointer group flex flex-col items-center text-center border border-slate-100"
            >
               <div className={`w-16 h-16 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                  <item.icon size={28} />
               </div>
               <h4 className="text-2xl font-black text-slate-800">{item.val}</h4>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{item.label}</span>
            </div>
         ))}
      </div>

      {/* Large Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-gradient-to-br from-white via-white to-slate-50/50 p-10 rounded-3xl custom-shadow relative overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-xl font-black text-slate-800 flex items-center">
                     <TrendingUp size={24} className="ml-3 text-amber-500" />
                     مؤشرات الأداء الأسبوعي
                  </h3>
                  <p className="text-slate-400 text-xs font-bold mt-2">تحليل الحضور ومعدلات التحصيل الأكاديمي</p>
               </div>
            </div>
            
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={15} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                     <Tooltip 
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} 
                        itemStyle={{fontWeight: 'bold', fontSize: '13px'}}
                     />
                     <Area type="monotone" dataKey="attendance" stroke="#d97706" strokeWidth={4} fill="url(#colorAttendance)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Side Cards */}
         <div className="space-y-6">
            <div className="bg-premium-dark p-8 rounded-3xl text-white relative overflow-hidden group h-1/2">
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-white/10 rounded-2xl inline-block mb-4"><Trophy size={28} className="text-amber-400" /></div>
                    <h4 className="text-2xl font-black mb-2">نخبة الطلاب</h4>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                       طالب واحد من المستوى الثالث حقق الدرجة الكاملة اليوم.
                    </p>
                  </div>
                  <button onClick={() => navigate('/achievements')} className="w-full py-3.5 bg-amber-500 text-slate-900 rounded-2xl text-xs font-black hover:bg-amber-400 transition-colors shadow-lg">
                     فتح لوحة الأوائل
                  </button>
               </div>
               <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl custom-shadow border border-slate-100 h-1/2">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
                     <AlertTriangle size={24} />
                  </div>
                  <div>
                     <h4 className="font-black text-slate-800 text-base">تنبيهات حرجة</h4>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">إجراءات مطلوبة</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center text-[11px] font-bold text-slate-600 bg-rose-50/30 p-3 rounded-2xl border border-rose-100">
                     <div className="w-2 h-2 rounded-full bg-rose-500 ml-2 animate-ping"></div>
                     انتهاء صلاحية اشتراك {studentMetrics.stopped} طلاب
                  </div>
                  <div className="flex items-center text-[11px] font-bold text-slate-600 bg-amber-50/30 p-3 rounded-2xl border border-amber-100">
                     <div className="w-2 h-2 rounded-full bg-amber-500 ml-2"></div>
                     تحذير: ضرورة مراجعة سجلات الحضور
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
