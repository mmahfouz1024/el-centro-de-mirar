
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <HandCoins className="ml-3 text-purple-700" size={36} />
            مستحقات المحاضرين
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

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {monthlySummary.map(item => (
             <div key={item.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:border-purple-200 transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 rounded-xl bg-white border-2 border-purple-100 flex items-center justify-center text-purple-600 font-black text-lg">
                      {item.full_name[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-sm">{item.full_name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{item.branch || 'الرئيسي'}</p>
                    </div>
                  </div>
                  {item.isPaid ? (
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[8px] font-black border border-emerald-100">تم الصرف</span>
                  ) : (
                    <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-lg text-[8px] font-black border border-rose-100">بانتظار الصرف</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                   <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                      <span className="block text-xs font-black text-slate-800">{item.classesCount}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">حصة منفذة</span>
                   </div>
                   <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                      <span className="block text-xs font-black text-purple-600">{item.earnedSalary}ج</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">صافي المستحق</span>
                   </div>
                </div>

                {!item.isPaid && (
                  <button 
                    onClick={() => { setSelectedTeacherForPayment(item); setIsPaymentModalOpen(true); }}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl text-xs font-black shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center"
                  >
                    <CheckCircle size={16} className="ml-2" />
                    تسجيل صرف الراتب
                  </button>
                )}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default StaffEarnings;
