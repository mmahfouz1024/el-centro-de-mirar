
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
      <div className="bg-premium-dark p-14 rounded-huge text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center px-5 py-2 bg-amber-500/20 rounded-full border border-amber-500/30 text-amber-400">
               <HandCoins className="ml-3" size={20} />
               <span className="text-[12px] font-black uppercase tracking-[0.3em]">إدارة مستحقات المحاضرين</span>
            </div>
            <h2 className="text-5xl font-black">تقرير الرواتب المعتمد</h2>
            <p className="text-slate-400 text-lg">الحساب يتم آلياً بناءً على سعر الساعة المسجل لكل محاضر × مدة الحصص المنفذة.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {loading ? (
            <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={60} /></div>
         ) : monthlySummary.map(item => (
           <div key={item.id} className="bg-white p-10 rounded-huge custom-shadow border border-slate-100 hover:border-amber-400/50 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-16 h-16 rounded-[1.8rem] bg-slate-50 flex items-center justify-center text-slate-900 font-black text-2xl">{item.full_name[0]}</div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{item.full_name}</h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">سعر الساعة: {item.hourly_rate || 65}ج</p>
                  </div>
                </div>
                {item.isPaid ? <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-emerald-100">تم الصرف</div> : <div className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl text-[10px] font-black animate-pulse">معلق</div>}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-slate-50 p-5 rounded-[2rem] text-center"><span className="block text-2xl font-black">{item.classesCount}</span><span className="text-[10px] font-black text-slate-400">حصة</span></div>
                 <div className="bg-amber-50 p-5 rounded-[2rem] text-center"><span className="block text-2xl font-black text-amber-600">{item.earnedSalary} <span className="text-xs">ج</span></span><span className="text-[10px] font-black text-amber-800">الاستحقاق</span></div>
              </div>
              <div className="mt-auto">
                {!item.isPaid ? (
                  <button onClick={() => { setSelectedTeacherForPayment(item); setIsPaymentModalOpen(true); }} className="w-full bg-slate-900 text-white py-5 rounded-[1.8rem] text-sm font-black shadow-xl hover:bg-amber-500 transition-all flex items-center justify-center">
                    <CheckCircle size={20} className="ml-3" /> اعتماد الصرف المالي
                  </button>
                ) : (
                  <button className="w-full bg-slate-50 text-slate-300 py-5 rounded-[1.8rem] text-sm font-black cursor-not-allowed">تمت التسوية بنجاح</button>
                )}
              </div>
           </div>
         ))}
      </div>

      {isPaymentModalOpen && selectedTeacherForPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsPaymentModalOpen(false)}></div>
           <div className="relative w-full max-w-xl bg-white rounded-huge shadow-2xl overflow-hidden animate-in zoom-in duration-500">
              <div className="bg-premium-dark p-10 text-white">
                 <h3 className="text-3xl font-black mb-2">توثيق عملية صرف</h3>
                 <p className="text-slate-400 text-sm">صرف مبلغ <span className="text-amber-400 font-black">{selectedTeacherForPayment.earnedSalary} ج.م</span> للمحاضر: {selectedTeacherForPayment.full_name}</p>
                 <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-10 left-10 text-white hover:text-rose-500"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-4">
                 <button onClick={() => executePayment('فودافون كاش')} className="w-full flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-rose-50 transition-all">
                    <div className="flex items-center gap-4"><Smartphone size={32} className="text-rose-500"/><h5 className="font-black">فودافون كاش: {selectedTeacherForPayment.vodafone_cash}</h5></div>
                    <ChevronLeft size={20}/>
                 </button>
                 <button onClick={() => executePayment('انستا باي')} className="w-full flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-purple-50 transition-all">
                    <div className="flex items-center gap-4"><Wallet size={32} className="text-purple-600"/><h5 className="font-black">انستا باي: {selectedTeacherForPayment.instapay}</h5></div>
                    <ChevronLeft size={20}/>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffEarnings;
