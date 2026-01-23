
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
  // Added missing Check icon import
  Check,
  AlertCircle,
  Banknote,
  Stamp,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { db, formatAppDate } from '../services/supabase';

// أسعار الساعات المعتمدة في النظام
const CLASS_RATES: Record<string, number> = {
  'تحفيظ وتجويد': 65,
  'متون': 80,
  'تعليم اللغة العربية لغير الناطقين بها': 100
};

const StaffEarnings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeView, setActiveView] = useState<'transactions' | 'monthly_summary'>('monthly_summary');
  
  // حالات اختيار وسيلة الدفع
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

  // Filters State
  const [filterTeacher, setFilterTeacher] = useState('الكل');
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

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
    } catch (error) {
      console.error('Error fetching staff earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  // وظيفة نسخ الرقم لتسهيل الدفع
  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // وظيفة تنفيذ الدفع الفعلي
  const executePayment = async (method: 'فودافون كاش' | 'انستا باي') => {
    if (!selectedTeacherForPayment) return;
    
    setActionLoading(true);
    try {
      const startDate = new Date(dateRange.start);
      const monthName = startDate.toLocaleString('ar-EG', { month: 'long' });
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
        month: month,
        year: year,
        status: 'تم الصرف',
        branch: selectedTeacherForPayment.branch || 'الرئيسي',
        payment_date: new Date().toISOString(),
        notes: `تم الدفع عبر: ${method} (${usedAccount || 'رقم غير مسجل'}) - كشف شهر ${monthName}`
      });

      setIsPaymentModalOpen(false);
      setSelectedTeacherForPayment(null);
      await fetchInitialData(); 
      alert('تم تسجيل عملية الدفع بنجاح وتوثيق وسيلة الدفع.');
    } catch (error) {
      alert('حدث خطأ أثناء تسجيل الدفع.');
    } finally {
      setActionLoading(false);
    }
  };

  // معالجة بيانات التقرير الشهري للمعلمين مع حالة الدفع
  const monthlySummary = useMemo(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59);
    
    const month = start.getMonth() + 1;
    const year = start.getFullYear();

    return data.teachers.map(teacher => {
      // 1. تصفية حلقات المعلم في الفترة المحددة
      const teacherClasses = data.classes.filter(c => 
        c.teacher === teacher.full_name && 
        new Date(c.registration_date) >= start && 
        new Date(c.registration_date) <= end
      );

      // 2. حساب الراتب المستحق
      let earnedSalary = 0;
      teacherClasses.forEach(cls => {
        const type = cls.class_type || 'تحفيظ وتجويد';
        const rate = CLASS_RATES[type] || 65;
        const duration = parseInt(cls.duration) || 30;
        earnedSalary += (duration / 60) * rate;
      });

      // 3. التحقق من حالة الدفع في جدول الرواتب
      const isPaid = data.salaries.some(s => 
        s.employee_name === teacher.full_name && 
        s.month === month && 
        s.year === year &&
        s.status === 'تم الصرف'
      );

      return {
        ...teacher,
        classesCount: teacherClasses.length,
        earnedSalary: parseFloat(earnedSalary.toFixed(2)),
        isPaid
      };
    }).filter(t => t.classesCount > 0 || filterTeacher === 'الكل' || t.full_name === filterTeacher)
      .filter(t => t.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data.teachers, data.classes, data.salaries, dateRange, filterTeacher, searchTerm]);

  const processedExpenses = useMemo(() => {
    return data.expenses.map(exp => {
      const student = data.students.find(s => s.name === exp.student_name);
      return {
        ...exp,
        supervisor_name: student?.supervisor_name || 'غير محدد',
        teacher_name: student?.teacher_name || 'غير محدد'
      };
    });
  }, [data.expenses, data.students]);

  const filteredRecords = useMemo(() => {
    return processedExpenses.filter(rec => {
      const matchTeacher = filterTeacher === 'الكل' || rec.teacher_name === filterTeacher;
      const matchSearch = rec.student_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchDate = true;
      if (dateRange.start && dateRange.end) {
        const d = new Date(rec.date);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59);
        matchDate = d >= start && d <= end;
      }

      return matchTeacher && matchSearch && matchDate;
    });
  }, [processedExpenses, filterTeacher, dateRange, searchTerm]);

  const stats = useMemo(() => {
    const totalEarned = filteredRecords.reduce((acc, curr) => acc + (Number(curr.teacher_ratio) || 0), 0);
    let filteredSalaries = data.salaries;
    if (filterTeacher !== 'الكل') {
      filteredSalaries = filteredSalaries.filter(s => s.employee_name === filterTeacher);
    }
    if (dateRange.start && dateRange.end) {
       const start = new Date(dateRange.start);
       const end = new Date(dateRange.end);
       filteredSalaries = filteredSalaries.filter(s => {
          const sd = new Date(s.payment_date || s.created_at);
          return sd >= start && sd <= end;
       });
    }
    const totalPaid = filteredSalaries.reduce((acc, curr) => acc + (Number(curr.final_amount) || 0), 0);
    return { totalEarned, totalPaid, balance: totalEarned - totalPaid };
  }, [filteredRecords, data.salaries, filterTeacher, dateRange]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest">جاري مزامنة الدفاتر المالية...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <HandCoins className="ml-3 text-purple-700" size={36} />
            مستحقات المعلمين
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">تتبع كشوف الحصص وحالة الصرف الشهري</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
           <button 
             onClick={() => setActiveView('monthly_summary')}
             className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeView === 'monthly_summary' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
           >
             التقرير الشهري للمستحقات
           </button>
           <button 
             onClick={() => setActiveView('transactions')}
             className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeView === 'transactions' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
           >
             كشف حركات الاشتراكات
           </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 flex items-center mr-1">
                  <Calendar size={12} className="ml-1 text-blue-500" /> الشهر المختار
               </label>
               <input 
                 type="date" 
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/10"
                 value={dateRange.start}
                 onChange={e => setDateRange({...dateRange, start: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 flex items-center mr-1">
                  <UserCheck size={12} className="ml-1 text-emerald-500" /> تصفية بالمعلم
               </label>
               <select 
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none appearance-none cursor-pointer"
                 value={filterTeacher}
                 onChange={e => setFilterTeacher(e.target.value)}
               >
                  <option value="الكل">كافة المعلمين</option>
                  {data.teachers.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
               </select>
            </div>
            <div className="relative pt-6 lg:col-span-2">
               <Search className="absolute right-4 top-10 text-slate-300" size={18} />
               <input 
                  type="text" 
                  placeholder="بحث سريع..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-3 text-sm font-bold outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
      </div>

      {activeView === 'monthly_summary' ? (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500">
           <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center">
                   <FileText size={24} className="ml-2 text-purple-600" />
                   حالة مستحقات المعلمين الشهرية
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">مقارنة الحلقات المسجلة بمدفوعات الرواتب</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center px-6 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 transition-all">
                  <Printer size={16} className="ml-2" /> طباعة المسير
                </button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-right">
                 <thead>
                    <tr className="bg-white border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">المعلم</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">بيانات الدفع</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">إجمالي الحلقات</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المستحق الحالي</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">حالة الصرف</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {monthlySummary.length === 0 ? (
                      <tr><td colSpan={6} className="py-32 text-center text-slate-300 font-black">لا توجد سجلات لهذا الشهر</td></tr>
                    ) : monthlySummary.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-8 py-5">
                            <div className="flex items-center space-x-3 space-x-reverse">
                               <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs border border-purple-100">
                                  {teacher.full_name[0]}
                               </div>
                               <div>
                                  <h4 className="text-sm font-black text-slate-800">{teacher.full_name}</h4>
                                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-1 block w-fit">{teacher.branch}</span>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-center">
                            <div className="flex flex-col gap-1 items-center">
                                {teacher.vodafone_cash && (
                                    <div className="flex items-center space-x-1 space-x-reverse bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                                        <Smartphone size={10} className="text-rose-500" />
                                        <span className="text-[9px] font-black text-rose-700 dir-ltr">{teacher.vodafone_cash}</span>
                                    </div>
                                )}
                                {teacher.instapay && (
                                    <div className="flex items-center space-x-1 space-x-reverse bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                                        <CreditCard size={10} className="text-purple-500" />
                                        <span className="text-[9px] font-black text-purple-700 dir-ltr">{teacher.instapay}</span>
                                    </div>
                                )}
                                {!teacher.vodafone_cash && !teacher.instapay && <span className="text-[10px] text-slate-300 italic">لا توجد بيانات دفع</span>}
                            </div>
                         </td>
                         <td className="px-8 py-5 text-center">
                            <div className="inline-flex flex-col items-center">
                               <div className="flex items-center text-sm font-black text-blue-600">
                                  <BookOpen size={16} className="ml-1.5 opacity-40" />
                                  {teacher.classesCount}
                               </div>
                               <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">حلقة</span>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-center">
                            <div className="inline-flex flex-col items-center">
                               <span className="text-lg font-black text-slate-800">{teacher.earnedSalary.toLocaleString()}</span>
                               <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">ج.م</span>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-center">
                            {teacher.isPaid ? (
                                <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 animate-in fade-in">
                                    <CheckCircle size={14} className="ml-1.5" />
                                    <span className="text-[10px] font-black">تم دفع الراتب</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
                                    <AlertCircle size={14} className="ml-1.5" />
                                    <span className="text-[10px] font-black">لم يتم دفع الراتب بعد</span>
                                </div>
                            )}
                         </td>
                         <td className="px-8 py-5 text-left">
                            {!teacher.isPaid ? (
                                <button 
                                  onClick={() => { setSelectedTeacherForPayment(teacher); setIsPaymentModalOpen(true); }}
                                  className="flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black shadow-lg hover:bg-emerald-600 transition-all active:scale-95"
                                >
                                  <Banknote size={14} className="ml-2" />
                                  تأكيد الدفع الآن
                                </button>
                            ) : (
                                <div className="p-2 text-emerald-500" title="معتمد">
                                   <Stamp size={24} className="rotate-12 opacity-40" />
                                </div>
                            )}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4 space-x-reverse">
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/5">
                    <DollarSign size={24} className="text-amber-400" />
                 </div>
                 <div>
                    <h4 className="font-black text-sm">إجمالي رواتب الفترة المفلترة</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">مجموع استحقاق المعلمين بناءً على الحلقات في التقرير أعلاه</p>
                 </div>
              </div>
              <div className="text-center md:text-left">
                 <span className="text-3xl font-black text-amber-400">
                    {monthlySummary.reduce((acc, curr) => acc + curr.earnedSalary, 0).toLocaleString()} <span className="text-sm font-bold">ج.م</span>
                 </span>
              </div>
           </div>
        </div>
      ) : (
        /* Original Transactions View */
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المستحقات (حصص الطلاب)</p>
                  <h4 className="text-3xl font-black text-emerald-600">{stats.totalEarned.toLocaleString()} <span className="text-sm font-bold">ج.م</span></h4>
               </div>
               <TrendingUp className="absolute -bottom-4 -left-4 text-emerald-500 opacity-10" size={100} />
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المنصرف (رواتب محولة)</p>
                  <h4 className="text-3xl font-black text-rose-600">{stats.totalPaid.toLocaleString()} <span className="text-sm font-bold">ج.م</span></h4>
               </div>
               <ArrowRightLeft className="absolute -bottom-4 -left-4 text-rose-500 opacity-10" size={100} />
            </div>
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">صافي الرصيد المتبقي</p>
                  <h4 className={`text-3xl font-black ${stats.balance >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>{stats.balance.toLocaleString()} <span className="text-sm font-bold">ج.م</span></h4>
               </div>
               <Wallet className="absolute -bottom-4 -left-4 text-white opacity-10" size={100} />
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-800 flex items-center">
                   <History size={20} className="ml-2 text-slate-400" />
                   سجل حركات مستحقات المعلمين
                </h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-right">
                   <thead>
                      <tr className="bg-white border-b border-slate-100">
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ / الطالب</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المعلم</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المحصل</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">حصة المعلم</th>
                         <th className="px-8 py-5"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filteredRecords.length === 0 ? (
                         <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black">لا توجد سجلات</td></tr>
                      ) : (
                         filteredRecords.map((rec) => (
                            <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors group">
                               <td className="px-8 py-5">
                                  <div className="font-black text-slate-800 text-sm">{rec.student_name}</div>
                                  <div className="text-[10px] text-slate-400 font-bold mt-1">{new Date(rec.date).toLocaleDateString('ar-EG')}</div>
                               </td>
                               <td className="px-8 py-5 text-center">
                                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black border border-emerald-100">{rec.teacher_name}</span>
                               </td>
                               <td className="px-8 py-5 text-center text-sm font-black text-slate-700">{rec.amount.toLocaleString()}ج</td>
                               <td className="px-8 py-5 text-center">
                                  <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{rec.teacher_ratio.toLocaleString()}ج</span>
                               </td>
                               <td className="px-8 py-5 text-left"><button className="p-2 text-slate-200 hover:text-blue-600"><ArrowRightLeft size={16}/></button></td>
                            </tr>
                         ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </>
      )}

      {/* Payment Method Selection Modal */}
      {isPaymentModalOpen && selectedTeacherForPayment && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsPaymentModalOpen(false)}></div>
           <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 animate-in zoom-in duration-300 text-right">
              <div className="flex items-center justify-between mb-8">
                 <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Banknote size={28} />
                 </div>
                 <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500 transition-colors"><X size={20}/></button>
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-2">تأكيد وسيلة الدفع</h3>
              <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
                 أنت على وشك تأكيد صرف راتب بقيمة <span className="text-emerald-600">{selectedTeacherForPayment.earnedSalary} ج.م</span> للأستاذ(ة) <span className="text-slate-800 underline">{selectedTeacherForPayment.full_name}</span>.
              </p>

              <div className="space-y-5">
                 {/* Vodafone Cash Button */}
                 <div className="relative group">
                    <button 
                      onClick={() => executePayment('فودافون كاش')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-between p-6 bg-rose-50 border border-rose-100 rounded-[2rem] hover:bg-rose-600 hover:text-white hover:shadow-xl hover:shadow-rose-100 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <div className="flex items-center">
                          <div className="p-3 bg-white rounded-2xl text-rose-500 ml-4 group-hover:bg-white/20 group-hover:text-white transition-colors shadow-sm">
                              <Smartphone size={24} />
                          </div>
                          <div className="text-right">
                              <h4 className="font-black text-base">دفع فودافون كاش</h4>
                              <p className={`text-[10px] font-black ${selectedTeacherForPayment.vodafone_cash ? 'opacity-80' : 'text-slate-400 italic'}`}>
                                 {selectedTeacherForPayment.vodafone_cash ? `رقم: ${selectedTeacherForPayment.vodafone_cash}` : 'رقم غير مسجل'}
                              </p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="opacity-40 group-hover:translate-x-[-4px] transition-transform" />
                    </button>
                    {selectedTeacherForPayment.vodafone_cash && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopy(selectedTeacherForPayment.vodafone_cash); }}
                        className="absolute left-14 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all"
                        title="نسخ الرقم"
                      >
                         {copiedText ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                 </div>

                 {/* InstaPay Button */}
                 <div className="relative group">
                    <button 
                      onClick={() => executePayment('انستا باي')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-between p-6 bg-purple-50 border border-purple-100 rounded-[2rem] hover:bg-purple-600 hover:text-white hover:shadow-xl hover:shadow-purple-100 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <div className="flex items-center">
                          <div className="p-3 bg-white rounded-2xl text-purple-500 ml-4 group-hover:bg-white/20 group-hover:text-white transition-colors shadow-sm">
                              <CreditCard size={24} />
                          </div>
                          <div className="text-right">
                              <h4 className="font-black text-base">دفع انستا باي</h4>
                              <p className={`text-[10px] font-black ${selectedTeacherForPayment.instapay ? 'opacity-80' : 'text-slate-400 italic'}`}>
                                 {selectedTeacherForPayment.instapay ? `ID: ${selectedTeacherForPayment.instapay}` : 'ID غير مسجل'}
                              </p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="opacity-40 group-hover:translate-x-[-4px] transition-transform" />
                    </button>
                    {selectedTeacherForPayment.instapay && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopy(selectedTeacherForPayment.instapay); }}
                        className="absolute left-14 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all"
                        title="نسخ المعرف"
                      >
                         {copiedText ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                 </div>

                 {/* Alert if both missing */}
                 {!selectedTeacherForPayment.vodafone_cash && !selectedTeacherForPayment.instapay && (
                   <div className="flex items-center p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-[10px] font-bold">
                      <AlertTriangle size={14} className="ml-2" />
                      تنبيه: لا توجد بيانات دفع مسجلة لهذا المعلم، يرجى التأكد يدوياً.
                   </div>
                 )}
              </div>

              {actionLoading && (
                 <div className="mt-6 flex items-center justify-center text-slate-400 font-bold text-xs animate-pulse">
                    <Loader2 className="animate-spin ml-2" size={16} /> جاري حفظ العملية...
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffEarnings;
