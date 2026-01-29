
import React, { useState, useEffect, useMemo } from 'react';
import { 
  HandCoins, 
  Search, 
  Filter, 
  Calendar, 
  UserCheck, 
  ShieldCheck, 
  Loader2, 
  TrendingUp, 
  Wallet, 
  ArrowRightLeft, 
  History,
  User,
  CheckCircle2,
  X,
  FileText,
  DollarSign,
  Smartphone,
  CreditCard,
  BookOpen,
  ChevronLeft,
  Printer,
  CheckCircle,
  Check,
  AlertCircle,
  Banknote,
  Stamp,
  Copy,
  AlertTriangle,
  Zap,
  MoreHorizontal,
  Briefcase,
  // Added missing Coins import
  Coins
} from 'lucide-react';
import { db, formatAppDate } from '../services/supabase';

const StaffEarnings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeView, setActiveView] = useState<'transactions' | 'monthly_summary'>('monthly_summary');
  
  const [selectedTeacherForPayment, setSelectedTeacherForPayment] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const [data, setData] = useState({
    expenses: [] as any[],
    salaries: [] as any[],
    teachers: [] as any[],
    supervisors: [] as any[],
    students: [] as any[],
    classes: [] as any[]
  });

  const [filterTeacher, setFilterTeacher] = useState('الكل');
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [expData, salData, profilesData, studentsData, classesData] = await Promise.all([
        db.finance.studentExpenses.getAll(),
        db.finance.salaries.getAll(),
        db.profiles.getAll(),
        db.students.getAll(),
        db.classes.getAll()
      ]);

      setData({
        expenses: expData || [],
        salaries: salData || [],
        teachers: profilesData.filter((p: any) => p.role === 'teacher'),
        supervisors: profilesData.filter((p: any) => p.role === 'supervisor' || p.role === 'general_supervisor'),
        students: studentsData || [],
        classes: classesData || []
      });
    } finally { setLoading(false); }
  };

  const executePayment = async (method: 'فودافون كاش' | 'انستا باي') => {
    if (!selectedTeacherForPayment) return;
    setActionLoading(true);
    try {
      const startDate = new Date(dateRange.start);
      const month = startDate.getMonth() + 1;
      const year = startDate.getFullYear();
      const usedAccount = method === 'فودافون كاش' ? selectedTeacherForPayment.vodafone_cash : selectedTeacherForPayment.instapay;

      await db.finance.salaries.create({
        employee_name: selectedTeacherForPayment.full_name,
        role: 'teacher',
        base_salary: selectedTeacherForPayment.earnedSalary,
        bonuses: 0,
        deductions: 0,
        final_amount: selectedTeacherForPayment.earnedSalary,
        month, year,
        status: 'تم الصرف',
        branch: selectedTeacherForPayment.branch || 'الرئيسي',
        payment_date: new Date().toISOString(),
        notes: `دفع: ${method} (${usedAccount}) - مستحق سعر ساعة: ${selectedTeacherForPayment.hourly_rate}ج`
      });

      setIsPaymentModalOpen(false);
      setSelectedTeacherForPayment(null);
      await fetchInitialData(); 
    } catch (error) { alert('خطأ في التسجيل'); } finally { setActionLoading(false); }
  };

  const monthlySummary = useMemo(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59);
    const month = start.getMonth() + 1;
    const year = start.getFullYear();

    return data.teachers.map(teacher => {
      const teacherClasses = data.classes.filter(c => 
        c.teacher === teacher.full_name && 
        new Date(c.registration_date) >= start && 
        new Date(c.registration_date) <= end
      );

      const hRate = teacher.hourly_rate || 65;
      let earnedSalary = 0;
      teacherClasses.forEach(cls => {
        const duration = parseInt(cls.duration) || 30;
        earnedSalary += (duration / 60) * hRate;
      });

      const isPaid = data.salaries.some(s => 
        s.employee_name === teacher.full_name && s.month === month && s.year === year && s.status === 'تم الصرف'
      );

      return { ...teacher, classesCount: teacherClasses.length, earnedSalary: parseFloat(earnedSalary.toFixed(2)), isPaid };
    }).filter(t => t.classesCount > 0 || filterTeacher === 'الكل' || t.full_name === filterTeacher)
      .filter(t => t.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data.teachers, data.classes, data.salaries, dateRange, filterTeacher, searchTerm]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-right">
      <div className="bg-premium-dark p-10 lg:p-14 rounded-huge text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center px-5 py-2 bg-amber-500/20 rounded-full border border-amber-500/30 text-amber-400">
               <HandCoins className="ml-3" size={20} />
               <span className="text-[12px] font-black uppercase tracking-[0.3em]">إدارة مستحقات المحاضرين</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight">تقرير الرواتب المعتمد</h2>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">تتم عملية الاحتساب آلياً بناءً على سعر الساعة المسجل لكل محاضر × مدة الحصص المنفذة خلال الفترة المحددة.</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-6">
         <div className="relative flex-1">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="ابحث باسم المحاضر..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         
         <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-2 rounded-2xl border border-slate-100">
               <Calendar size={18} className="text-blue-600 mr-2" />
               <div className="flex items-center gap-2">
                  <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="bg-transparent text-slate-700 text-xs font-black outline-none" />
                  <span className="text-slate-300">إلى</span>
                  <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="bg-transparent text-slate-700 text-xs font-black outline-none" />
               </div>
            </div>
         </div>
      </div>

      {/* Main Content: Table View */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-32 text-center text-slate-300">
            <Loader2 className="animate-spin mx-auto mb-4" size={50} />
            <p className="font-black text-xs uppercase tracking-widest">جاري استدعاء البيانات المالية...</p>
          </div>
        ) : monthlySummary.length === 0 ? (
          <div className="py-40 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <History size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد سجلات مستحقات</h3>
            <p className="text-slate-400 font-bold text-sm">لم يتم العثور على محاضرات منفذة خلال الفترة المحددة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">المحاضر</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">سعر الساعة</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">إحصائيات الفترة</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">إجمالي المستحق</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {monthlySummary.map(item => (
                  <tr key={item.id} className="group hover:bg-amber-50/30 transition-all duration-300">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-800 font-black text-lg shadow-sm group-hover:scale-110 transition-transform">
                          {item.full_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none mb-1">{item.full_name}</p>
                          <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">أكاديمي نشط</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                         <Coins size={14} className="text-amber-500" />
                         <span className="text-xs font-black text-slate-700">{item.hourly_rate || 65}ج</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-slate-800">{item.classesCount}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">حصة منفذة</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-lg font-black text-emerald-600">{item.earnedSalary.toLocaleString()} <span className="text-[10px] font-bold">ج.م</span></span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {item.isPaid ? (
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-emerald-100 shadow-sm">
                           <CheckCircle2 size={12} />
                           تمت التسوية
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-500 px-3 py-1.5 rounded-xl text-[10px] font-black border border-rose-100 animate-pulse">
                           <AlertCircle size={12} />
                           بانتظار الصرف
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {!item.isPaid ? (
                        <button 
                          onClick={() => { setSelectedTeacherForPayment(item); setIsPaymentModalOpen(true); }}
                          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-amber-500 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                        >
                          <Banknote size={14} />
                          اعتماد الصرف
                        </button>
                      ) : (
                        <div className="text-slate-300 opacity-50 flex items-center justify-center p-2">
                           <Check size={20} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer Stats */}
      {!loading && monthlySummary.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-6 bg-premium-dark rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
           <div className="flex items-center gap-10 relative z-10">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المستحقات للفترة</p>
                 <h4 className="text-2xl font-black text-white">{monthlySummary.reduce((acc, curr) => acc + curr.earnedSalary, 0).toLocaleString()} ج.م</h4>
              </div>
              <div className="w-px h-10 bg-white/10 hidden md:block"></div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المحاضرين المستحقين</p>
                 <h4 className="text-2xl font-black text-amber-400">{monthlySummary.length} معلم</h4>
              </div>
           </div>
           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] relative z-10">Financial Audit System • Enterprise v2.5</p>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedTeacherForPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsPaymentModalOpen(false)}></div>
           <div className="relative w-full max-w-xl bg-white rounded-huge shadow-2xl overflow-hidden animate-in zoom-in duration-500">
              <div className="bg-premium-dark p-10 text-white relative">
                 <h3 className="text-3xl font-black mb-2">توثيق عملية صرف</h3>
                 <p className="text-slate-400 text-sm">سيتم نقل مستحقات <span className="text-amber-400 font-black">{selectedTeacherForPayment.earnedSalary} ج.م</span> لسجل الرواتب المصروفة للمحاضر: {selectedTeacherForPayment.full_name}</p>
                 <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-10 left-10 text-white hover:text-rose-500 transition-colors"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-5">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">اختر وسيلة التحويل المستخدمة:</p>
                 <button onClick={() => executePayment('فودافون كاش')} className="w-full flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2.2rem] hover:bg-rose-50 hover:border-rose-100 transition-all group">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform">
                          <Smartphone size={32} />
                       </div>
                       <div className="text-right">
                          <h5 className="font-black text-slate-800">فودافون كاش</h5>
                          <p className="text-xs font-bold text-slate-400 dir-ltr">{selectedTeacherForPayment.vodafone_cash || 'غير مسجل'}</p>
                       </div>
                    </div>
                    <ChevronLeft size={20} className="text-slate-300" />
                 </button>
                 <button onClick={() => executePayment('انستا باي')} className="w-full flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2.2rem] hover:bg-purple-50 hover:border-purple-100 transition-all group">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                          <Wallet size={32} />
                       </div>
                       <div className="text-right">
                          <h5 className="font-black text-slate-800">انستا باي (InstaPay)</h5>
                          <p className="text-xs font-bold text-slate-400 dir-ltr">{selectedTeacherForPayment.instapay || 'غير مسجل'}</p>
                       </div>
                    </div>
                    <ChevronLeft size={20} className="text-slate-300" />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffEarnings;
