
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  Clock, 
  Loader2, 
  TrendingUp, 
  DollarSign, 
  List, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
  CalendarDays,
  ShieldCheck,
  History,
  Stamp,
  BookOpen
} from 'lucide-react';
import { db } from '../services/supabase';

const TeacherEarnings: React.FC<{ user: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'monthly'>('sessions');
  const [classes, setClasses] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [myClasses, allSalaries, profileData] = await Promise.all([
        db.classes.getByTeacher(user.full_name),
        db.finance.salaries.getAll(),
        db.profiles.getById(user.id)
      ]);
      
      setClasses(myClasses || []);
      setSalaries(allSalaries.filter((s: any) => s.employee_name === user.full_name) || []);
      setMyProfile(profileData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hourlyRate = myProfile?.hourly_rate || 65;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleString('ar-EG', { month: 'long' });

  const currentMonthSalary = useMemo(() => {
    return salaries.find(s => s.month === currentMonth && s.year === currentYear);
  }, [salaries, currentMonth, currentYear]);

  const isPaid = currentMonthSalary?.status === 'تم الصرف';

  const earningsData = useMemo(() => {
    let totalPerSession = 0;
    const detailedClasses = classes.map(cls => {
      const duration = parseInt(cls.duration) || 30;
      const hoursPerSession = duration / 60;
      const sessionCost = hoursPerSession * hourlyRate;
      totalPerSession += sessionCost;
      return { ...cls, sessionCost: parseFloat(sessionCost.toFixed(2)) };
    });
    return { classes: detailedClasses, totalPerSession: parseFloat(totalPerSession.toFixed(2)) };
  }, [classes, hourlyRate]);

  const monthlyCalculatedData = useMemo(() => {
    const thisMonthClasses = classes.filter(cls => {
      const clsDate = new Date(cls.registration_date);
      return (clsDate.getMonth() + 1) === currentMonth && clsDate.getFullYear() === currentYear;
    });
    let totalEarned = 0;
    thisMonthClasses.forEach(cls => {
      const duration = parseInt(cls.duration) || 30;
      totalEarned += (duration / 60) * hourlyRate;
    });
    return { classesCount: thisMonthClasses.length, totalEarned: parseFloat(totalEarned.toFixed(2)), classes: thisMonthClasses };
  }, [classes, currentMonth, currentYear, hourlyRate]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest">جاري جلب البيانات المالية...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Wallet className="ml-3 text-emerald-600" size={32} />
            مستحقاتي المالية
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">سعر ساعتك المعتمد: <span className="text-emerald-600">{hourlyRate} ج.م</span></p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
           <button onClick={() => setActiveTab('sessions')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'sessions' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>استحقاق الحصص</button>
           <button onClick={() => setActiveTab('monthly')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'monthly' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>مستحقاتي الشهرية</button>
        </div>
      </div>

      {activeTab === 'sessions' ? (
        <div className="space-y-8">
           <div className="bg-gradient-to-br from-emerald-800 to-teal-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                    <p className="text-emerald-200 text-xs font-black uppercase tracking-widest mb-2">إجمالي استحقاق الجلسة الواحدة</p>
                    <h3 className="text-5xl font-black">{earningsData.totalPerSession} <span className="text-xl text-emerald-300">ج.م</span></h3>
                    <p className="text-emerald-100/60 text-[10px] font-bold mt-2">* يتم احتساب الحصة بناءً على (المدة بالدقائق / 60) مضروباً في سعر ساعتك الشخصي ({hourlyRate}ج).</p>
                 </div>
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/10"><DollarSign size={48} className="text-emerald-300" /></div>
              </div>
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
           </div>

           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center"><List className="ml-2 text-slate-400" size={24} /> تفاصيل الحلقات المسندة إليك</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {earningsData.classes.map((cls) => (
                    <div key={cls.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:border-emerald-200 transition-all group">
                       <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600"><TrendingUp size={24} /></div>
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">{cls.sessionCost} ج.م</span>
                       </div>
                       <h4 className="text-lg font-black text-slate-800 mb-2">{cls.name}</h4>
                       <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-500 bg-white p-2 rounded-xl border border-slate-100">
                             <span className="flex items-center"><Clock size={12} className="ml-1 text-amber-500"/> المدة</span>
                             <span>{cls.duration} دقيقة</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
             <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><CalendarDays size={24} /></div>
                <div><h3 className="text-lg font-black text-slate-800">مستحقات شهر {currentMonthName}</h3></div>
             </div>
             {!isPaid && <div className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black border border-amber-100 animate-pulse">قيد المراجعة</div>}
          </div>

          {isPaid ? (
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[3rem] p-12 text-center flex flex-col items-center space-y-6">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-xl border-4 border-emerald-100 relative"><CheckCircle2 size={48} /><Stamp className="absolute -top-2 -right-2 text-emerald-400 rotate-12" size={32} /></div>
               <div className="max-w-md"><h3 className="text-2xl font-black text-emerald-900 mb-2">تم تسوية المستحقات</h3><p className="text-emerald-700/70 font-bold leading-relaxed">لقد تم صرف مستحقاتك المالية لشهر {currentMonthName} بنجاح.</p></div>
               <div className="bg-white px-8 py-4 rounded-2xl border border-emerald-100 shadow-sm"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">المبلغ المصروف</span><span className="text-3xl font-black text-emerald-600">{currentMonthSalary.final_amount.toLocaleString()} ج.م</span></div>
            </div>
          ) : (
            <>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between group">
                     <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الحلقات المنفذة</p><h4 className="text-3xl font-black text-slate-800">{monthlyCalculatedData.classesCount}</h4></div>
                     <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><BookOpen size={32} /></div>
                  </div>
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between group">
                     <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">صافي المستحق التقديري</p><h4 className="text-3xl font-black text-emerald-600">{monthlyCalculatedData.totalEarned.toLocaleString()} <span className="text-sm">ج.م</span></h4></div>
                     <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={32} /></div>
                  </div>
               </div>
               <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-right">
                        <thead><tr className="bg-slate-50/50"><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">التاريخ</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">المدة</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-center">الاستحقاق</th></tr></thead>
                        <tbody className="divide-y divide-slate-50">
                           {monthlyCalculatedData.classes.map((cls, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-8 py-5 text-sm font-bold text-slate-600">{new Date(cls.registration_date).toLocaleDateString('ar-EG')}</td>
                                 <td className="px-8 py-5 text-xs font-bold text-slate-500">{cls.duration} دقيقة</td>
                                 <td className="px-8 py-5 text-center text-sm font-black text-emerald-600">{((parseInt(cls.duration)/60)*hourlyRate).toFixed(2)} ج.م</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherEarnings;
