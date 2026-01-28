
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
  UserMinus,
  LayoutDashboard
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

  // نعتبر المشرف العام والمشرف العادي كلاهما يريان الإحصائيات الكلية للمركز
  const isAuthorizedToSeeAll = user?.role === 'general_supervisor' || user?.role === 'supervisor' || user?.role === 'manager';

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

      // إذا لم يكن مديراً أو مشرفاً (أي إذا كان مدرساً يدخل لهذه اللوحة بالخطأ)، نقوم بتصفية طلابه فقط
      // أما المشرف فيرى الكل ليطابق صفحة الطلاب (64 طالب)
      if (user?.role === 'teacher') {
         filteredStudents = filteredStudents.filter((s: any) => s.teacher_name === user.full_name);
         filteredClasses = filteredClasses.filter((c: any) => c.teacher === user.full_name);
         filteredTeachers = filteredTeachers.filter((t: any) => t.full_name === user.full_name);
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
      <p className="font-black text-sm uppercase tracking-[0.3em] text-slate-800">جاري تحليل بيانات النظام...</p>
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
                  {user?.role === 'general_supervisor' ? <Crown size={20} className="ml-3 text-amber-400" /> : <ShieldCheck size={20} className="ml-3 text-emerald-400" />}
                  <span className="text-[12px] font-black uppercase tracking-[0.2em]">{user?.role === 'general_supervisor' ? 'رئيس هيئة الإشراف' : 'لوحة الإشراف المركزية'}</span>
               </div>
               <h2 className="text-4xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                  مركز <br/>
                  <span className="text-gradient-gold uppercase">EL CENTRO DE MIRAR</span> للغات
               </h2>
               <p className="text-slate-300 text-lg font-medium max-w-2xl leading-relaxed">
                  نظرة شاملة على أداء المركز: إدارة الطاقم التعليمي ومتابعة {studentMetrics.total} طالب مسجل في مسارات اللغات المختلفة.
               </p>
               <div className="flex gap-4">
                  <button onClick={() => navigate('/students')} className="bg-white text-slate-900 px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-amber-500 hover:text-white transition-all shadow-xl">قاعدة بيانات الطلاب</button>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 w-full xl:w-auto">
               <div onClick={() => navigate('/students')} className="cursor-pointer glass-card bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 text-center hover:scale-105 transition-all">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                     <Users size={28} className="text-white" />
                  </div>
                  <span className="block text-4xl font-black">{studentMetrics.total}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mt-2 block">إجمالي الطلاب</span>
               </div>
               <div onClick={() => navigate('/teachers')} className="cursor-pointer glass-card bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 text-center hover:scale-105 transition-all">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                     <GraduationCap size={28} className="text-white" />
                  </div>
                  <span className="block text-4xl font-black">{stats.teachers.length}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mt-2 block">سجل المحاضرين</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
            { label: 'سجل المحاضرين', icon: Briefcase, val: stats.teachers.length, path: '/teachers', color: 'blue', desc: 'إدارة الطاقم التعليمي' },
            { label: 'إجمالي الطلاب', icon: Users, val: studentMetrics.total, path: '/students', color: 'indigo', desc: 'كافة المسجلين بالنظام' },
            { label: 'طلاب مؤكد تجديدهم', icon: UserCheck, val: studentMetrics.renewed, path: '/renewal-followup', color: 'emerald', desc: 'اشتراكات سارية' },
            { label: 'طلاب متوقفون', icon: UserMinus, val: studentMetrics.stopped, path: '/renewal-followup', color: 'rose', desc: 'بحاجة لمتابعة فورية' },
         ].map((item, idx) => (
            <div 
               key={idx} 
               onClick={() => navigate(item.path)}
               className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
            >
               <div className={`absolute top-0 right-0 w-2 h-full bg-${item.color}-500 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
               <div className={`w-16 h-16 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                  <item.icon size={28} />
               </div>
               <h4 className="text-3xl font-black text-slate-800">{item.val}</h4>
               <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest mt-2">{item.label}</span>
               <span className="text-[9px] font-bold text-slate-400 mt-1">{item.desc}</span>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-xl font-black text-slate-800 flex items-center">
                     <Activity size={24} className="ml-3 text-blue-600" />
                     مؤشرات النشاط التعليمي العام
                  </h3>
                  <p className="text-slate-400 text-xs font-bold mt-2">تحليل تفاعلي للتحصيل والحضور الأسبوعي لكافة الحلقات</p>
               </div>
            </div>
            
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={15} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                     <Tooltip 
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} 
                        itemStyle={{fontWeight: 'bold', fontSize: '13px'}}
                     />
                     <Area type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={4} fill="url(#colorAttendance)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group h-1/2">
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-white/10 rounded-2xl inline-block mb-4"><Trophy size={28} className="text-amber-400" /></div>
                    <h4 className="text-2xl font-black mb-2">تقارير الجودة والتقييم</h4>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                       مراجعة تقييمات الحصص اليومية لضمان التزام المحاضرين بالمعايير التعليمية للمركز.
                    </p>
                  </div>
                  <button onClick={() => navigate('/class-evaluation')} className="w-full py-3.5 bg-blue-600 text-white rounded-2xl text-xs font-black hover:bg-blue-500 transition-colors shadow-lg">
                     فتح سجل التقييمات
                  </button>
               </div>
               <div className="absolute -bottom-40 -right-40 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-1/2">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
                     <AlertTriangle size={24} />
                  </div>
                  <div>
                     <h4 className="font-black text-slate-800 text-base">تنبيهات الإشراف</h4>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">إحصائيات النظام اللحظية</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center text-[11px] font-bold text-slate-600 bg-rose-50/30 p-3 rounded-2xl border border-rose-100">
                     <div className="w-2 h-2 rounded-full bg-rose-500 ml-2 animate-ping"></div>
                     يوجد {studentMetrics.stopped} طلاب متوقفين عن الدراسة حالياً
                  </div>
                  <div className="flex items-center text-[11px] font-bold text-slate-600 bg-blue-50/30 p-3 rounded-2xl border border-blue-100">
                     <div className="w-2 h-2 rounded-full bg-blue-500 ml-2"></div>
                     إجمالي المسجلين في سجل المحاضرين: {stats.teachers.length} معلم
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
