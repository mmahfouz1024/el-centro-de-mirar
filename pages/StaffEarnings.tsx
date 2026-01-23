
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
  Zap
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

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

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

      let earnedSalary = 0;
      teacherClasses.forEach(cls => {
        const type = cls.class_type || 'تحفيظ وتجويد';
        const rate = CLASS_RATES[type] || 65;
        const duration = parseInt(cls.duration) || 30;
        earnedSalary += (duration / 60) * rate;
      });

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

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-right">
      
      {/* Header المالي العملاق */}
      <div className="bg-premium-dark p-14 rounded-huge text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center px-5 py-2 bg-amber-500/20 rounded-full border border-amber-500/30 text-amber-400">
               <HandCoins className="ml-3" size={20} />
               <span className="text-[12px] font-black uppercase tracking-[0.3em]">مركز المستحقات المالية</span>
            </div>
            <h2 className="text-5xl font-black tracking-tight leading-tight">مستحقات المحاضرين</h2>
            <p className="text-slate-400 text-lg font-medium max-w-xl">إدارة كشوف الحصص، الرواتب، وتوثيق عمليات الدفع الرقمي لكل أعضاء هيئة التدريس.</p>
          </div>

          <div className="flex bg-white/5 p-2 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
             <button 
               onClick={() => setActiveView('monthly_summary')}
               className={`px-10 py-4 rounded-[2rem] text-sm font-black transition-all ${activeView === 'monthly_summary' ? 'bg-amber-500 text-slate-900 shadow-xl shadow-amber-900/40' : 'text-slate-400 hover:text-white'}`}
             >
               التقرير الشهري
             </button>
             <button 
               onClick={() => setActiveView('transactions')}
               className={`px-10 py-4 rounded-[2rem] text-sm font-black transition-all ${activeView === 'transactions' ? 'bg-amber-500 text-slate-900 shadow-xl shadow-amber-900/40' : 'text-slate-400 hover:text-white'}`}
             >
               حركات الاشتراكات
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {loading ? (
            <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={60} /></div>
         ) : monthlySummary.length === 0 ? (
            <div className="col-span-full bg-white border-4 border-dashed border-slate-100 rounded-huge py-32 text-center text-slate-300 font-black">لا توجد بيانات لهذا الشهر</div>
         ) : monthlySummary.map(item => (
           <div key={item.id} className="bg-white p-10 rounded-huge custom-shadow border border-slate-100 hover:border-amber-400/50 transition-all flex flex-col group">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-16 h-16 rounded-[1.8rem] bg-slate-50 border-2 border-white shadow-inner flex items-center justify-center text-slate-900 font-black text-2xl group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    {item.full_name[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{item.full_name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center">
                       <Zap size={10} className="ml-1 text-amber-500" /> {item.branch || 'الرئيسي'}
                    </p>
                  </div>
                </div>
                {item.isPaid ? (
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-emerald-100 flex items-center">
                     <CheckCircle2 size={12} className="ml-1" /> تم الصرف
                  </div>
                ) : (
                  <div className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-rose-100 animate-pulse">
                     معلق
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 text-center">
                    <span className="block text-2xl font-black text-slate-800">{item.classesCount}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">حصة منفذة</span>
                 </div>
                 <div className="bg-amber-50 p-5 rounded-[2rem] border border-amber-100 text-center">
                    <span className="block text-2xl font-black text-amber-600">{item.earnedSalary} <span className="text-xs">ج</span></span>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-tighter">صافي المستحق</span>
                 </div>
              </div>

              <div className="space-y-2 mb-8">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-600">
                    <div className="flex items-center"><Smartphone size={14} className="ml-2 text-rose-500" /> فودافون كاش:</div>
                    <span className="dir-ltr text-slate-800">{item.vodafone_cash || '---'}</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-600">
                    <div className="flex items-center"><Wallet size={14} className="ml-2 text-purple-500" /> انستا باى:</div>
                    <span className="text-slate-800">{item.instapay || '---'}</span>
                 </div>
              </div>

              <div className="mt-auto">
                {!item.isPaid ? (
                  <button 
                    onClick={() => { setSelectedTeacherForPayment(item); setIsPaymentModalOpen(true); }}
                    className="w-full bg-slate-900 text-white py-5 rounded-[1.8rem] text-sm font-black shadow-xl hover:bg-amber-500 hover:text-slate-900 transition-all flex items-center justify-center group/btn"
                  >
                    <CheckCircle size={20} className="ml-3 group-hover/btn:scale-125 transition-transform" />
                    اعتماد الصرف المالي
                  </button>
                ) : (
                  <button className="w-full bg-slate-50 text-slate-300 py-5 rounded-[1.8rem] text-sm font-black cursor-not-allowed border border-slate-100">
                    تمت التسوية بنجاح
                  </button>
                )}
              </div>
           </div>
         ))}
      </div>

      {/* نافذة الدفع المحدثة */}
      {isPaymentModalOpen && selectedTeacherForPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsPaymentModalOpen(false)}></div>
           <div className="relative w-full max-w-xl bg-white rounded-huge shadow-2xl overflow-hidden animate-in zoom-in duration-500">
              <div className="bg-premium-dark p-10 text-white relative">
                 <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                 <h3 className="text-3xl font-black mb-2 tracking-tight">توثيق عملية صرف</h3>
                 <p className="text-slate-400 text-sm">أنت على وشك صرف مبلغ <span className="text-amber-400 font-black">{selectedTeacherForPayment.earnedSalary} ج.م</span> للمحاضر: {selectedTeacherForPayment.full_name}</p>
                 <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-10 left-10 p-3 bg-white/5 rounded-2xl hover:bg-rose-500 transition-colors"><X size={24}/></button>
              </div>
              
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => executePayment('فودافون كاش')}
                      className="group flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:border-rose-300 hover:bg-rose-50 transition-all text-right"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md text-rose-500 group-hover:scale-110 transition-transform">
                             <Smartphone size={32} />
                          </div>
                          <div>
                             <h5 className="font-black text-slate-800 text-lg">فودافون كاش</h5>
                             <p className="text-[11px] font-bold text-slate-400 dir-ltr">{selectedTeacherForPayment.vodafone_cash || 'رقم غير مسجل'}</p>
                          </div>
                       </div>
                       <ChevronLeft className="text-slate-300 group-hover:text-rose-500 group-hover:translate-x-[-10px] transition-all" />
                    </button>

                    <button 
                      onClick={() => executePayment('انستا باي')}
                      className="group flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:border-purple-300 hover:bg-purple-50 transition-all text-right"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md text-purple-600 group-hover:scale-110 transition-transform">
                             <Wallet size={32} />
                          </div>
                          <div>
                             <h5 className="font-black text-slate-800 text-lg">انستا باي (InstaPay)</h5>
                             <p className="text-[11px] font-bold text-slate-400">{selectedTeacherForPayment.instapay || 'عنوان غير مسجل'}</p>
                          </div>
                       </div>
                       <ChevronLeft className="text-slate-300 group-hover:text-purple-500 group-hover:translate-x-[-10px] transition-all" />
                    </button>
                 </div>

                 <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-start text-amber-800">
                    <AlertTriangle size={24} className="ml-4 shrink-0" />
                    <p className="text-xs font-bold leading-relaxed">
                       عند اختيار وسيلة الدفع، سيتم تسجيل العملية في مسيرات الرواتب الرسمية وخصم المبلغ من الخزينة آلياً مع توثيق اسم الحساب المستخدم.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffEarnings;
