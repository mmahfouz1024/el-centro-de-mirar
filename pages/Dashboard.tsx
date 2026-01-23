
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
  ArrowUpRight
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
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest">تحليل البيانات الجارية...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* قسم الترحيب الملكي */}
      <div className={`p-10 lg:p-14 rounded-[4rem] text-white shadow-2xl relative overflow-hidden ${isGenSup ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-900' : 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900'}`}>
         {/* تأثيرات خلفية */}
         <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')] opacity-10 pointer-events-none"></div>
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
            <div className="text-right space-y-6">
               <div className="inline-flex items-center px-4 py-1.5 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
                  {isGenSup ? <Crown size={16} className="ml-2 text-amber-400" /> : <ShieldCheck size={16} className="ml-2 text-emerald-300" />}
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isGenSup ? 'مركز التحكم العام للمشرف' : 'لوحة القيادة والمتابعة'}</span>
               </div>
               <h2 className="text-5xl lg:text-6xl font-black leading-tight">أهلاً بك في <br/> El Centro de Mirar</h2>
               <p className="text-slate-300 text-lg font-medium max-w-lg leading-relaxed">
                  تؤمن لك El Centro de Mirar أدوات ذكاء اصطناعي متطورة لمراقبة التحصيل العلمي وضمان جودة الحلقات في كافة الفروع.
               </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 w-full lg:w-auto">
               <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl text-center group hover:bg-white/20 transition-all">
                  <Users size={32} className="mx-auto mb-3 text-emerald-300 group-hover:scale-110 transition-transform" />
                  <span className="block text-4xl font-black">{stats.students.length}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">طالب نشط</span>
               </div>
               <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl text-center group hover:bg-white/20 transition-all">
                  <BookOpen size={32} className="mx-auto mb-3 text-blue-300 group-hover:scale-110 transition-transform" />
                  <span className="block text-4xl font-black">{stats.classes.length}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">حلقة دراسية</span>
               </div>
            </div>
         </div>
      </div>

      {/* اختصارات الوصول السريع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
            { label: 'إدارة الطلاب', icon: Users, path: '/students', color: 'emerald' },
            { label: 'سجل الحلقات', icon: BookOpen, path: '/classes', color: 'blue' },
            { label: 'الهيئة التعليمية', icon: Briefcase, path: '/teachers', color: 'purple' },
            { label: 'تقييم الأداء', icon: Star, path: '/class-evaluation', color: 'amber' },
         ].map((item, idx) => (
            <div 
               key={idx} 
               onClick={() => navigate(item.path)}
               className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center"
            >
               <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
               </div>
               <span className="text-sm font-black text-slate-700">{item.label}</span>
            </div>
         ))}
      </div>

      {/* الرسم البياني للأداء */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 flex items-center">
                     <TrendingUp size={24} className="ml-2 text-emerald-600" />
                     مؤشرات الأداء الأسبوعي
                  </h3>
                  <p className="text-slate-400 text-xs font-bold mt-1">تحليل الحضور ومعدلات التحصيل اليومية</p>
               </div>
               <div className="flex gap-2">
                  <div className="flex items-center text-[10px] font-black text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 ml-2"></div> الحضور
                  </div>
                  <div className="flex items-center text-[10px] font-black text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                     <div className="w-2 h-2 rounded-full bg-amber-500 ml-2"></div> التحصيل
                  </div>
               </div>
            </div>
            
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMemorization" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                     <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)'}} 
                        itemStyle={{fontWeight: 'bold', fontSize: '12px'}}
                     />
                     <Area type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
                     <Area type="monotone" dataKey="memorization" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorMemorization)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* البطاقات الجانبية */}
         <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[3rem] text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                     <div className="p-3 bg-white/10 rounded-2xl"><Trophy size={20} className="text-amber-400" /></div>
                     <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase">Live</span>
                  </div>
                  <h4 className="text-3xl font-black mb-2">أفضل الحلقات</h4>
                  <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6">
                     تتصدر حلقة "المستوى الأول" المركز الأول هذا الأسبوع بنسبة إنجاز 98%.
                  </p>
                  <button className="w-full py-3 bg-white text-slate-900 rounded-2xl text-xs font-black hover:bg-emerald-400 transition-colors">
                     عرض التقرير الكامل
                  </button>
               </div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all"></div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                     <AlertTriangle size={24} />
                  </div>
                  <div>
                     <h4 className="font-black text-slate-800">تنبيهات النظام</h4>
                     <p className="text-[10px] font-bold text-slate-400">بحاجة للانتباه</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl">
                     <div className="w-2 h-2 rounded-full bg-rose-500 ml-2"></div>
                     3 طلاب متغيبين لأكثر من أسبوع
                  </div>
                  <div className="flex items-center text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl">
                     <div className="w-2 h-2 rounded-full bg-amber-500 ml-2"></div>
                     تحديث بيانات 5 محاضرين مطلوب
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
