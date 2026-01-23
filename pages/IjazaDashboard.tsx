
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ScrollText, 
  Users, 
  Globe, 
  TrendingUp, 
  Loader2, 
  Plus, 
  ArrowRight, 
  History, 
  ChevronLeft,
  ShieldCheck,
  Star,
  Activity,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/supabase';

const IjazaDashboard: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await db.ijazaStudents.getAll();
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching ijaza data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = students.length;
    const narrations = students.filter(s => s.study_types?.includes('narration')).length;
    const recitations = students.filter(s => s.study_types?.includes('recitation')).length;
    
    // Geographical distribution
    const countries: Record<string, number> = {};
    students.forEach(s => {
      if (s.country) countries[s.country] = (countries[s.country] || 0) + 1;
    });

    const topCountries = Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { total, narrations, recitations, topCountries };
  }, [students]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black text-xs uppercase tracking-widest">جاري تحميل لوحة الإجازة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-right" dir="rtl">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-indigo-700 to-blue-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-3">
              <ScrollText size={14} className="ml-2 text-indigo-300" />
              <span className="text-[10px] font-black uppercase tracking-widest">قطاع الإجازات والقراءات</span>
            </div>
            <h2 className="text-4xl font-black mb-2 tracking-tight">أهلاً بك، مشرف {user?.full_name?.split(' ')[0]}</h2>
            <p className="text-indigo-100/70 font-medium max-w-xl">متابعة شاملة لطلاب الإجازة، وتوزيعهم الجغرافي، ومساراتهم العلمية في الرواية والقراءة.</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/ijaza-students')}
              className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black text-sm flex items-center shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              <Plus size={20} className="ml-2" />
              تسجيل طالب جديد
            </button>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 -translate-x-32 blur-3xl"></div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative group hover:border-indigo-200 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الطلاب</p>
          <h4 className="text-3xl font-black text-slate-800">{stats.total}</h4>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative group hover:border-emerald-200 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">مسار الرواية</p>
          <h4 className="text-3xl font-black text-slate-800">{stats.narrations}</h4>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Activity size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">مسار القراءة</p>
          <h4 className="text-3xl font-black text-slate-800">{stats.recitations}</h4>
        </div>

        <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">أكثر الدول تسجيلاً</p>
          <div className="space-y-1">
             {stats.topCountries.map(([country, count]) => (
                <div key={country} className="flex justify-between items-center text-xs font-black">
                   <span>{country}</span>
                   <span className="text-indigo-200">{count}</span>
                </div>
             ))}
             {stats.topCountries.length === 0 && <span className="text-xs opacity-50">لا توجد بيانات دول</span>}
          </div>
          <Globe className="absolute -bottom-4 -left-4 text-white opacity-10" size={80} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Registrations */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 flex items-center">
                 <History size={24} className="ml-2 text-indigo-600" />
                 آخر الطلاب المسجلين
              </h3>
              <button 
                onClick={() => navigate('/ijaza-students')}
                className="text-[11px] font-black text-indigo-600 hover:underline flex items-center"
              >
                 عرض الكل <ChevronLeft size={14} className="mr-1" />
              </button>
           </div>

           <div className="space-y-4">
              {students.slice(0, 5).map(student => (
                 <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all group">
                    <div className="flex items-center space-x-4 space-x-reverse">
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 font-black shadow-sm group-hover:scale-110 transition-transform">
                          {student.name[0]}
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-slate-800">{student.name}</h4>
                          <div className="flex items-center text-[10px] text-slate-400 font-bold mt-0.5">
                             <Globe size={10} className="ml-1" /> {student.country} • بدأ في {new Date(student.start_date).toLocaleDateString('ar-EG')}
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       {student.study_types?.map((type: string) => (
                          <span key={type} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[9px] font-black">
                             {type === 'narration' ? 'رواية' : 'قراءة'}
                          </span>
                       ))}
                    </div>
                 </div>
              ))}
              {students.length === 0 && (
                 <div className="py-20 text-center text-slate-300">
                    <ScrollText size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">لا يوجد طلاب مسجلين بعد</p>
                 </div>
              )}
           </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group h-fit">
              <div className="relative z-10">
                 <h3 className="text-lg font-black flex items-center mb-6">
                    <TrendingUp size={20} className="ml-2 text-emerald-400" />
                    تحليل المسار العلمي
                 </h3>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span>طلاب الرواية</span>
                          <span className="text-emerald-400">{stats.total > 0 ? Math.round((stats.narrations/stats.total)*100) : 0}%</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.narrations/stats.total)*100 : 0}%` }}></div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span>طلاب القراءة</span>
                          <span className="text-blue-400">{stats.total > 0 ? Math.round((stats.recitations/stats.total)*100) : 0}%</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.recitations/stats.total)*100 : 0}%` }}></div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center px-2">
                 <Star size={14} className="ml-2 text-amber-500" />
                 نصيحة إدارية
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-bold p-2 bg-slate-50 rounded-2xl border border-slate-100">
                 يُنصح بمتابعة طلاب الإجازة بشكل دوري كل ١٥ يوماً للتأكد من انتظام الحلقات وتسجيل حضورهم بدقة لضمان سير الخطة العلمية.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IjazaDashboard;
