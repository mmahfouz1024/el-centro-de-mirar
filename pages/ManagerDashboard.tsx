
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  PieChart as PieChartIcon, 
  ShieldCheck, 
  BarChart3, 
  Activity, 
  Award, 
  RefreshCw, 
  Wallet,
  Briefcase,
  Headphones,
  UserCheck,
  UserPlus,
  UserMinus,
  Percent,
  Coins,
  ArrowUpRight,
  Sparkles,
  Target,
  Gem
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { db } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    students: [] as any[],
    profiles: [] as any[],
    salesTeam: [] as any[],
    expenses: [] as any[],
    salaries: [] as any[]
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [students, profiles, salesTeam, expenses, salaries] = await Promise.all([
        db.students.getAll(),
        db.profiles.getAll(),
        db.salesTeam.getAll(),
        db.finance.studentExpenses.getAll(),
        db.finance.salaries.getAll()
      ]);
      
      setData({
        students: students || [],
        profiles: profiles || [],
        salesTeam: salesTeam || [],
        expenses: expenses || [],
        salaries: salaries || []
      });
    } catch (error) {
      console.error('Error fetching manager dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Staff Stats
  const staffStats = useMemo(() => {
    const teachers = data.profiles.filter(p => p.role === 'teacher').length;
    const supervisors = data.profiles.filter(p => p.role === 'supervisor').length;
    const sales = data.salesTeam.length;
    return { teachers, supervisors, sales };
  }, [data.profiles, data.salesTeam]);

  // 2. Student & Renewal Stats
  const studentStats = useMemo(() => {
    const totalStudents = data.students.length;
    const renewing = data.students.filter(s => s.renewal_status === 'yes').length;
    const notRenewing = data.students.filter(s => s.renewal_status === 'no').length;
    const renewalRate = totalStudents > 0 ? Math.round((renewing / totalStudents) * 100) : 0;
    return { renewing, notRenewing, renewalRate, totalStudents };
  }, [data.students]);

  // 3. Financial Stats
  const totalRevenue = useMemo(() => {
    return data.expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [data.expenses]);

  const chartData = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const currentMonth = new Date().getMonth();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      const monthName = months[monthIdx];
      const monthlySum = data.expenses
        .filter(exp => new Date(exp.date).getMonth() === monthIdx)
        .reduce((acc, curr) => acc + curr.amount, 0);
      
      result.push({ name: monthName, value: monthlySum });
    }
    return result;
  }, [data.expenses]);

  const distributionData = useMemo(() => {
    const totalSalaries = data.salaries.reduce((acc, curr) => acc + (curr.final_amount || 0), 0);
    const otherExpenses = totalRevenue * 0.3; // Estimated
    
    return [
      { name: 'الرواتب', value: totalSalaries, color: '#10b981' }, // Emerald
      { name: 'تشغيل', value: otherExpenses, color: '#3b82f6' }, // Blue
      { name: 'أرباح', value: Math.max(0, totalRevenue - totalSalaries - otherExpenses), color: '#f59e0b' } // Amber
    ];
  }, [data.salaries, totalRevenue]);

  return (
    <div className="space-y-10 pb-20 text-right animate-in fade-in duration-700" dir="rtl">
      
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-10 lg:p-14 rounded-[3.5rem] text-white shadow-2xl overflow-hidden group">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] animate-float-slow"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
               <ShieldCheck size={16} className="ml-2 text-amber-400 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-100">بوابة الإدارة العليا</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              الرؤية العامة <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">للمؤسسة</span>
            </h2>
            <p className="text-slate-300 font-medium text-lg max-w-xl leading-relaxed">
              تحليلات استراتيجية فورية للأداء المالي، الكادر البشري، ومؤشرات نمو الطلاب لدعم اتخاذ القرار.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 text-center min-w-[140px] group-hover:bg-white/10 transition-colors">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الطلاب النشطين</p>
                <h3 className="text-4xl font-black text-white">{studentStats.totalStudents}</h3>
             </div>
             <button 
               onClick={fetchAllData} 
               className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 hover:scale-110 hover:rotate-180 transition-all duration-500"
             >
               <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Teacher Stats */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[3rem] -mr-4 -mt-4 transition-all group-hover:scale-150 group-hover:bg-emerald-100"></div>
            <div className="relative z-10">
               <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                  <Award size={28} />
               </div>
               <h4 className="text-3xl font-black text-slate-800 mb-1">{staffStats.teachers}</h4>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">الكادر التعليمي</p>
            </div>
        </div>

        {/* Supervisor Stats */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[3rem] -mr-4 -mt-4 transition-all group-hover:scale-150 group-hover:bg-blue-100"></div>
            <div className="relative z-10">
               <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                  <UserCheck size={28} />
               </div>
               <h4 className="text-3xl font-black text-slate-800 mb-1">{staffStats.supervisors}</h4>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">الإشراف التربوي</p>
            </div>
        </div>

        {/* Sales Stats */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-[3rem] -mr-4 -mt-4 transition-all group-hover:scale-150 group-hover:bg-purple-100"></div>
            <div className="relative z-10">
               <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
                  <Headphones size={28} />
               </div>
               <h4 className="text-3xl font-black text-slate-800 mb-1">{staffStats.sales}</h4>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">فريق المبيعات</p>
            </div>
        </div>

        {/* Renewal Rate - Special Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[3rem] text-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                     <Percent size={28} className="text-amber-400" />
                  </div>
                  <div className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">LIVE</div>
               </div>
               <div>
                  <h4 className="text-4xl font-black text-white mb-1">{studentStats.renewalRate}%</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">نسبة التجديد العامة</p>
                  
                  {/* Mini Progress Bar */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${studentStats.renewalRate}%` }}></div>
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><TrendingUp size={20}/></div>
                    <h3 className="text-xl font-black text-slate-800">تحليل النمو المالي</h3>
                 </div>
                 <p className="text-xs font-bold text-slate-400 mt-2 pr-10">مراقبة تدفق الاشتراكات والإيرادات خلال الـ 6 أشهر الماضية.</p>
              </div>
              <div className="text-left hidden sm:block">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الإيراد الحالي</p>
                 <p className="text-2xl font-black text-emerald-600">{totalRevenue.toLocaleString()} ج.م</p>
              </div>
           </div>

           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                    <defs>
                       <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(val) => `${val/1000}k`} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                       itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                       formatter={(value) => [`${Number(value).toLocaleString()} ج.م`, 'الإيراد']} 
                    />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fill="url(#colorRevenue)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><PieChartIcon size={20}/></div>
                 <h3 className="text-xl font-black text-slate-800">توزيع السيولة</h3>
              </div>
              <p className="text-xs font-bold text-slate-400">تحليل المصروفات مقابل الأرباح الصافية.</p>
           </div>

           <div className="h-64 w-full relative my-4">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={distributionData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                    >
                       {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip formatter={(val) => `${Number(val).toLocaleString()} ج.م`} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                 </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                 <span className="text-[10px] font-black text-slate-400 uppercase">الإجمالي</span>
                 <p className="text-lg font-black text-slate-800">{totalRevenue.toLocaleString()}</p>
              </div>
           </div>

           <div className="space-y-3">
              {distributionData.map((item, i) => (
                 <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                       <span className="text-xs font-black text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-800 dir-ltr">{item.value.toLocaleString()}</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
            { label: 'إدارة المعلمين', icon: Briefcase, path: '/teachers', color: 'bg-emerald-100 text-emerald-700' },
            { label: 'المالية والرواتب', icon: Wallet, path: '/accounts', color: 'bg-blue-100 text-blue-700' },
            { label: 'تقارير الأداء', icon: Activity, path: '/reports', color: 'bg-amber-100 text-amber-700' },
            { label: 'إعدادات النظام', icon: Target, path: '/settings', color: 'bg-slate-100 text-slate-700' },
         ].map((item, idx) => (
            <div 
               key={idx} 
               onClick={() => navigate(item.path)}
               className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-between group"
            >
               <span className="text-xs font-black text-slate-700">{item.label}</span>
               <div className={`p-2 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon size={18} />
               </div>
            </div>
         ))}
      </div>

    </div>
  );
};

export default ManagerDashboard;
