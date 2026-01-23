
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DollarSign, 
  Plus, 
  Users, 
  Loader2, 
  Trash2, 
  X, 
  CheckCircle,
  FileText,
  TrendingUp,
  Lock,
  Calculator,
  PlusCircle,
  MinusCircle,
  Clock,
  CalendarDays,
  RefreshCw,
  Edit3,
  Wallet,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  GraduationCap,
  Smartphone,
  CreditCard,
  Zap,
  Scale,
  ArrowRightLeft
} from 'lucide-react';
import { db } from '../services/supabase';

interface SalariesProps {
  onUpdate?: () => void;
  selectedBranch: string;
}

const HOURS_PER_DAY = 8; 

// تعريف أسعار الساعات حسب نوع الحلقة
const CLASS_RATES: Record<string, number> = {
  'تحفيظ وتجويد': 65,
  'متون': 80,
  'تعليم اللغة العربية لغير الناطقين بها': 100
};

const Salaries: React.FC<SalariesProps> = ({ onUpdate, selectedBranch }) => {
  // Tabs State
  const [salaryTab, setSalaryTab] = useState<'sales' | 'supervisors' | 'teachers'>('teachers');
  const [viewMode, setViewMode] = useState<'payroll' | 'accounts'>('payroll'); // payroll = مسير الرواتب, accounts = كشف الحساب

  const [salaries, setSalaries] = useState<any[]>([]);
  
  // Data for calculation
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [supervisorsList, setSupervisorsList] = useState<any[]>([]);
  const [salesList, setSalesList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]); 
  const [studentExpenses, setStudentExpenses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchingStats, setFetchingStats] = useState(false);

  const [formData, setFormData] = useState({
    employee_name: '',
    employee_id: '',
    role: 'teacher', // teacher | supervisor | sales
    base_salary: '',
    bonuses: '0',
    deductions: '0',
    final_amount: '0',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: 'تم الصرف',
    branch: '',
    payment_info: { vodafone_cash: '', instapay: '' }, // Auto-fetched info
    detailed_finance: {
      perm_absent_days: 0,
      unperm_absent_days: 0,
      unperm_multiplier: 1,
      late_hours: 0,
      extra_hours: 0,
      extra_days: 0
    },
    calc_details: '' // To show how salary was calculated
  });

  // دالة حساب المبالغ المقترحة بناءً على سجل الحضور
  const performFinanceCalculation = useCallback((baseSal: string, details: any) => {
    const salary = parseFloat(baseSal) || 0;
    if (salary === 0) return { bonuses: '0', deductions: '0' };

    const dayRate = salary; 
    const hourRate = dayRate / HOURS_PER_DAY;

    const permDeduction = details.perm_absent_days * dayRate;
    const unpermDeduction = (details.unperm_absent_days * details.unperm_multiplier) * dayRate;
    const lateDeduction = details.late_hours * hourRate;
    
    const extraHoursBonus = details.extra_hours * hourRate;
    const extraDaysBonus = details.extra_days * dayRate;

    const totalBonuses = Math.round(extraHoursBonus + extraDaysBonus);
    const totalDeductions = Math.round(permDeduction + unpermDeduction + lateDeduction);

    return {
      bonuses: totalBonuses.toString(),
      deductions: totalDeductions.toString()
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.base_salary && !fetchingStats) {
      const { bonuses, deductions } = performFinanceCalculation(formData.base_salary, formData.detailed_finance);
      setFormData(prev => ({ ...prev, bonuses, deductions }));
    }
  }, [formData.detailed_finance, formData.base_salary, performFinanceCalculation]);

  useEffect(() => {
    const base = parseFloat(formData.base_salary) || 0;
    const bon = parseFloat(formData.bonuses) || 0;
    const ded = parseFloat(formData.deductions) || 0;
    const final = parseFloat((base + bon - ded).toFixed(2));
    setFormData(prev => ({ ...prev, final_amount: final.toString() }));
  }, [formData.base_salary, formData.bonuses, formData.deductions]);

  useEffect(() => {
    if (formData.employee_id && isModalOpen && (salaryTab === 'teachers' || salaryTab === 'supervisors')) {
      fetchTeacherAttendanceStats(formData.employee_id, formData.month, formData.year);
    }
  }, [formData.employee_id, formData.month, formData.year, isModalOpen, salaryTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salData, allProfiles, salesData, classesData, stdExpensesData, studentsData] = await Promise.all([
        db.finance.salaries.getAll(),
        db.profiles.getAll(),
        db.salesTeam.getAll(),
        db.classes.getAll(),
        db.finance.studentExpenses.getAll(),
        db.students.getAll()
      ]);
      setSalaries(salData || []);
      
      setTeachersList(allProfiles.filter(p => p.role === 'teacher'));
      setSupervisorsList(allProfiles.filter(p => p.role === 'supervisor' || p.role === 'general_supervisor'));
      setSalesList(salesData || []);
      setClassesList(classesData || []);
      setStudentExpenses(stdExpensesData || []);
      setStudents(studentsData || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTeacherWage = (teacherName: string) => {
    const teacherClasses = classesList.filter(c => c.teacher === teacherName);
    let totalSalary = 0;
    let details = [];

    for (const cls of teacherClasses) {
      const type = cls.class_type || 'تحفيظ وتجويد';
      const rate = CLASS_RATES[type] || 65; 
      const duration = parseInt(cls.duration) || 0;
      
      const hoursPerSession = duration / 60;
      const sessionCost = hoursPerSession * rate;
      
      totalSalary += sessionCost;
      const formattedCost = parseFloat(sessionCost.toFixed(2));
      
      details.push(`${cls.name}: ${duration}د (${rate}ج/س) = ${formattedCost}ج`);
    }

    return { total: parseFloat(totalSalary.toFixed(2)), details: details.join(' | ') };
  };

  const timeToMins = (time: string) => {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const fetchTeacherAttendanceStats = async (teacherId: string, month: number, year: number) => {
    try {
      setFetchingStats(true);
      const [history, teacherProfile] = await Promise.all([
        db.teacherAttendance.getByTeacher(teacherId),
        db.profiles.getById(teacherId)
      ]);
      
      const schedule = teacherProfile?.work_schedule || {};
      const periodRecords = history.filter((rec: any) => {
        const date = new Date(rec.record_date);
        return (date.getMonth() + 1) === month && date.getFullYear() === year;
      });

      let permAbsent = 0;
      let unpermAbsent = 0;
      let lateHours = 0;
      let extraHours = 0;
      let extraDays = 0;

      const daysOfWeekEnToAr: Record<string, string> = {
        'Sunday': 'الأحد', 'Monday': 'الاثنين', 'Tuesday': 'الثلاثاء', 
        'Wednesday': 'الأربعاء', 'Thursday': 'الخميس', 'Friday': 'الجمعة', 'Saturday': 'السبت'
      };

      periodRecords.forEach((rec: any) => {
        const date = new Date(rec.record_date);
        const dayNameAr = daysOfWeekEnToAr[date.toLocaleDateString('en-US', { weekday: 'long' })];
        const daySchedule = schedule[dayNameAr];

        if (rec.status === 'permission') permAbsent++;
        else if (rec.status === 'absent') unpermAbsent++;
        else if (rec.status === 'present' || rec.status === 'late') {
          if (!daySchedule) {
            extraDays++;
          } else {
            if (rec.check_in && daySchedule.from) {
              const diff = timeToMins(rec.check_in) - timeToMins(daySchedule.from);
              if (diff > 10) lateHours += 1;
            }
            if (rec.check_out && daySchedule.to) {
              const diff = timeToMins(rec.check_out) - timeToMins(daySchedule.to);
              if (diff >= 30) extraHours += Math.floor(diff / 60) || 1;
            }
          }
        }
      });
      
      const newDetails = {
        perm_absent_days: permAbsent,
        unperm_absent_days: unpermAbsent,
        unperm_multiplier: 1,
        late_hours: lateHours,
        extra_hours: extraHours,
        extra_days: extraDays
      };

      setFormData(prev => ({
        ...prev,
        detailed_finance: newDetails
      }));

    } catch (err) {
      console.error("Auto calculation error:", err);
    } finally {
      setFetchingStats(false);
    }
  };

  const handleEmployeeSelect = (id: string) => {
    let employee: any = null;
    let role = 'teacher';
    let calculatedSalary = '0';
    let calcDetails = '';

    if (salaryTab === 'sales') {
        employee = salesList.find(s => s.id === id);
        role = 'sales';
        calculatedSalary = employee?.base_salary?.toString() || '0';
    } else if (salaryTab === 'supervisors') {
        employee = supervisorsList.find(s => s.id === id);
        role = 'supervisor';
        calculatedSalary = employee?.base_salary?.toString() || '0';
    } else {
        employee = teachersList.find(t => t.id === id);
        role = 'teacher';
        if (employee) {
           const calc = calculateTeacherWage(employee.full_name);
           calculatedSalary = calc.total.toString();
           calcDetails = calc.details;
        }
    }

    if (employee) {
        setFormData({ 
          ...formData, 
          employee_name: employee.full_name, 
          employee_id: employee.id,
          role: role,
          branch: employee.branch || 'الرئيسي',
          base_salary: calculatedSalary,
          bonuses: '0',
          deductions: '0',
          final_amount: calculatedSalary,
          payment_info: {
              vodafone_cash: employee.vodafone_cash || '',
              instapay: employee.instapay || ''
          },
          detailed_finance: {
            perm_absent_days: 0,
            unperm_absent_days: 0,
            unperm_multiplier: 1,
            late_hours: 0,
            extra_hours: 0,
            extra_days: 0
          },
          calc_details: calcDetails
        });
    }
  };

  const handleAutoGenerateSalaries = async () => {
    if (!confirm('هل أنت متأكد من توليد رواتب جميع المعلمين للشهر الحالي آلياً؟ سيتم حساب الراتب بناءً على الحلقات المسجلة.')) return;
    
    setActionLoading(true);
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      let count = 0;
      for (const teacher of teachersList) {
        const calc = calculateTeacherWage(teacher.full_name);
        if (calc.total > 0) {
           await db.finance.salaries.create({
             employee_name: teacher.full_name,
             role: 'teacher',
             base_salary: calc.total,
             bonuses: 0,
             deductions: 0,
             final_amount: calc.total, 
             month: currentMonth,
             year: currentYear,
             status: 'معلق', 
             branch: teacher.branch || 'الرئيسي',
             payment_date: new Date().toISOString(),
             detailed_finance: {},
             notes: `حساب تلقائي (حصة واحدة): ${calc.details}`
           });
           count++;
        }
      }
      
      await fetchData();
      onUpdate?.();
      alert(`تم توليد ${count} سجل راتب بنجاح. يرجى مراجعة الخصومات.`);
    } catch (err: any) {
      alert(`حدث خطأ: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_name || !formData.base_salary) return;

    setActionLoading(true);
    try {
      await db.finance.salaries.create({
        employee_name: formData.employee_name,
        role: formData.role, 
        base_salary: parseFloat(formData.base_salary) || 0,
        bonuses: parseFloat(formData.bonuses) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        final_amount: parseFloat(formData.final_amount) || 0,
        month: formData.month,
        year: formData.year,
        status: formData.status,
        branch: formData.branch,
        payment_date: new Date().toISOString(),
        detailed_finance: formData.detailed_finance,
        notes: formData.calc_details
      });
      await fetchData();
      onUpdate?.();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`فشل الحفظ: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSalaries = useMemo(() => {
    let filtered = salaries;
    
    if (salaryTab === 'sales') {
        filtered = filtered.filter(s => s.role === 'sales');
    } else if (salaryTab === 'supervisors') {
        filtered = filtered.filter(s => s.role === 'supervisor' || s.role === 'general_supervisor');
    } else {
        filtered = filtered.filter(s => s.role === 'teacher' || !s.role);
    }

    if (selectedBranch !== 'الكل') {
        filtered = filtered.filter(s => s.branch === selectedBranch);
    }
    
    return filtered;
  }, [salaries, selectedBranch, salaryTab]);

  // حساب كشف حساب المعلم (الرصيد التراكمي)
  const teacherAccounts = useMemo(() => {
    const acc: Record<string, { name: string, earned: number, paid: number }> = {};

    // 1. حساب المستحقات من نسب الاشتراكات (الدائن)
    studentExpenses.forEach(exp => {
        const teacherShare = Number(exp.teacher_ratio) || 0;
        if (teacherShare > 0) {
            // نربط الدفعة بالمعلم من خلال الطالب
            const student = students.find(s => s.name === exp.student_name);
            const teacherName = student?.teacher_name;
            if (teacherName) {
                if (!acc[teacherName]) acc[teacherName] = { name: teacherName, earned: 0, paid: 0 };
                acc[teacherName].earned += teacherShare;
            }
        }
    });

    // 2. حساب المدفوعات من الرواتب (المدين)
    // نستخدم filteredSalaries أو الرواتب الكلية للمعلمين
    const teacherSalaries = salaries.filter(s => s.role === 'teacher');
    teacherSalaries.forEach(sal => {
        const name = sal.employee_name;
        const amount = Number(sal.final_amount) || 0;
        if (!acc[name]) acc[name] = { name: name, earned: 0, paid: 0 };
        acc[name].paid += amount;
    });

    return Object.values(acc).map(a => ({
        ...a,
        balance: a.earned - a.paid
    }));
  }, [studentExpenses, salaries, students]);

  const totalPayroll = filteredSalaries.reduce((acc, curr) => acc + (Number(curr.final_amount) || 0), 0);
  const currentStaffCount = salaryTab === 'sales' ? salesList.length : salaryTab === 'supervisors' ? supervisorsList.length : teachersList.length;

  const openNewSalaryModal = (existingSalary?: any) => {
      setFormData({
        employee_name: '',
        employee_id: '',
        role: salaryTab === 'sales' ? 'sales' : salaryTab === 'supervisors' ? 'supervisor' : 'teacher',
        base_salary: '',
        bonuses: '0',
        deductions: '0',
        final_amount: '0',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: 'تم الصرف',
        branch: 'الرئيسي',
        payment_info: { vodafone_cash: '', instapay: '' },
        detailed_finance: {
          perm_absent_days: 0,
          unperm_absent_days: 0,
          unperm_multiplier: 1,
          late_hours: 0,
          extra_hours: 0,
          extra_days: 0
        },
        calc_details: ''
      });
      setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      
      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-[2rem] border border-slate-100 shadow-sm w-full md:w-fit overflow-x-auto no-scrollbar">
        <button 
            onClick={() => { setSalaryTab('sales'); setViewMode('payroll'); }}
            className={`flex items-center px-6 py-3 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap ${salaryTab === 'sales' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-purple-600'}`}
        >
            <Headphones size={16} className="ml-2" />
            رواتب خدمة العملاء
        </button>
        <button 
            onClick={() => { setSalaryTab('supervisors'); setViewMode('payroll'); }}
            className={`flex items-center px-6 py-3 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap ${salaryTab === 'supervisors' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-blue-600'}`}
        >
            <ShieldCheck size={16} className="ml-2" />
            رواتب المشرفين
        </button>
        <button 
            onClick={() => setSalaryTab('teachers')}
            className={`flex items-center px-6 py-3 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap ${salaryTab === 'teachers' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-emerald-600'}`}
        >
            <GraduationCap size={16} className="ml-2" />
            رواتب المعلمين
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
            <DollarSign className="ml-3 text-emerald-600" size={28} />
            {salaryTab === 'sales' ? 'مسيرات رواتب المبيعات' : salaryTab === 'supervisors' ? 'مسيرات رواتب الإشراف' : 'مسيرات رواتب المعلمين'}
            {selectedBranch !== 'الكل' && ` (فرع ${selectedBranch})`}
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">إدارة المستحقات المالية والخصومات</p>
        </div>
        
        {salaryTab === 'teachers' ? (
            <div className="flex gap-2">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                    <button 
                        onClick={() => setViewMode('payroll')} 
                        className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'payroll' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                    >
                        مسير الرواتب
                    </button>
                    <button 
                        onClick={() => setViewMode('accounts')} 
                        className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'accounts' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                    >
                        كشف حساب المعلم
                    </button>
                </div>
                <button 
                  onClick={handleAutoGenerateSalaries}
                  disabled={actionLoading || viewMode === 'accounts'}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center shadow-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-60 disabled:hidden"
                >
                  {actionLoading ? <Loader2 className="animate-spin ml-2" size={16}/> : <Zap size={16} className="ml-2" />}
                  توليد الرواتب
                </button>
            </div>
        ) : (
            <button 
              onClick={() => openNewSalaryModal()}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center shadow-xl hover:bg-slate-800 transition-all active:scale-95"
            >
              <Plus size={20} className="ml-2" />
              إصدار راتب جديد
            </button>
        )}
      </div>

      {viewMode === 'payroll' ? (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الرواتب المصروفة</p>
                    <h4 className="text-2xl font-black text-slate-800">{totalPayroll.toLocaleString()} <span className="text-xs text-slate-400">ج.م</span></h4>
                </div>
                <TrendingUp className="text-emerald-500 opacity-20" size={28} />
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">عدد الموظفين في القائمة</p>
                    <h4 className="text-2xl font-black text-slate-800">{loading ? '...' : currentStaffCount}</h4>
                </div>
                <Users className="text-blue-500 opacity-20" size={28} />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800 flex items-center">
                    <FileText size={20} className="ml-2 text-slate-400" />
                    سجل الرواتب
                </h3>
                </div>

                <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">الموظف</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">الفرع</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">الأساسي</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">صافي الراتب</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">الفترة</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {loading ? (
                        <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={32}/></td></tr>
                    ) : filteredSalaries.length === 0 ? (
                        <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold">لا توجد رواتب مسجلة لهذا التصنيف</td></tr>
                    ) : filteredSalaries.map(sal => (
                        <tr key={sal.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <span className="text-sm font-black text-slate-800">{sal.employee_name}</span>
                            <span className="block text-[9px] text-slate-400 font-bold mt-0.5">{sal.role === 'sales' ? 'خدمة عملاء' : sal.role === 'supervisor' ? 'مشرف' : 'معلم'}</span>
                        </td>
                        <td className="px-6 py-4"><span className="text-[10px] font-bold text-slate-500">{sal.branch}</span></td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{Number(sal.base_salary).toLocaleString()} ج.م</td>
                        <td className="px-6 py-4 font-black text-blue-700 text-sm text-center">{Number(sal.final_amount).toLocaleString()} ج.م</td>
                        <td className="px-6 py-4 text-[11px] font-bold text-slate-400">{sal.month} / {sal.year}</td>
                        <td className="px-6 py-4 text-left">
                            <button onClick={() => { if(confirm('حذف السجل؟')) db.finance.salaries.delete(sal.id).then(fetchData); }} className="p-2 text-slate-200 hover:text-rose-500"><Trash2 size={16}/></button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        </>
      ) : (
        /* Teacher Accounts View */
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-left-4 duration-500">
            <div className="p-6 border-b border-slate-50 bg-emerald-50/30 flex items-center justify-between">
               <h3 className="text-lg font-black text-slate-800 flex items-center">
                 <Scale size={20} className="ml-2 text-emerald-600" />
                 كشف حساب المعلم (المستحقات vs المصروفات)
               </h3>
               <p className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                  الرصيد = (نسبة المعلم في الاشتراكات) - (الرواتب المستلمة)
               </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">المعلم</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">إجمالي المستحقات (له)</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">إجمالي المصروف (عليه)</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">الرصيد المتبقي</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {teacherAccounts.length === 0 ? (
                        <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-bold">لا توجد بيانات حسابات للمعلمين</td></tr>
                    ) : teacherAccounts.map((acc, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <span className="text-sm font-black text-slate-800">{acc.name}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className="text-sm font-black text-emerald-600">{acc.earned.toLocaleString()} ج.م</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className="text-sm font-black text-rose-600">{acc.paid.toLocaleString()} ج.م</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className={`text-sm font-black px-3 py-1 rounded-lg ${acc.balance >= 0 ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>
                                {acc.balance.toLocaleString()} ج.م
                            </span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300 text-right max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800">إصدار أمر صرف راتب</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500"><X size={20}/></button>
             </div>
             <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">
                          {salaryTab === 'sales' ? 'موظف المبيعات' : salaryTab === 'supervisors' ? 'المشرف' : 'المعلم'}
                      </label>
                      <select 
                        required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold outline-none"
                        value={formData.employee_id}
                        onChange={(e) => handleEmployeeSelect(e.target.value)}
                      >
                        <option value="">اختر الموظف...</option>
                        {salaryTab === 'sales' && salesList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                        {salaryTab === 'supervisors' && supervisorsList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                        {salaryTab === 'teachers' && teachersList.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                      </select>
                   </div>

                   {/* Payment Info Box */}
                   {(formData.payment_info.vodafone_cash || formData.payment_info.instapay) && (
                       <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-2 animate-in slide-in-from-top-2">
                           <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">بيانات الدفع (من النظام)</p>
                           <div className="grid grid-cols-2 gap-2">
                               <div className="flex items-center space-x-2 space-x-reverse bg-white p-2 rounded-xl border border-slate-100">
                                   <Smartphone size={14} className="text-rose-500 ml-1.5" />
                                   <div>
                                       <span className="text-[8px] font-bold text-slate-400 block">فودافون كاش</span>
                                       <span className="text-[10px] font-black text-slate-700 dir-ltr block">{formData.payment_info.vodafone_cash || '---'}</span>
                                   </div>
                               </div>
                               <div className="flex items-center space-x-2 space-x-reverse bg-white p-2 rounded-xl border border-slate-100">
                                   <CreditCard size={14} className="text-purple-500 ml-1.5" />
                                   <div>
                                       <span className="text-[8px] font-bold text-slate-400 block">انستاباى</span>
                                       <span className="text-[10px] font-black text-slate-700 dir-ltr block">{formData.payment_info.instapay || '---'}</span>
                                   </div>
                               </div>
                           </div>
                       </div>
                   )}
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">شهر الصرف</label>
                        <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.month} onChange={e => setFormData({...formData, month: parseInt(e.target.value)})}>
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">السنة</label>
                        <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}>
                          {[2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                   </div>
                </div>
                
                <div className="col-span-2 space-y-1.5 pt-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                      <Lock size={12} className="ml-1 text-amber-500" /> الراتب الأساسي (محسوب آلياً)
                   </label>
                   <input 
                    type="number" 
                    readOnly 
                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-black text-slate-800 outline-none cursor-not-allowed" 
                    value={formData.base_salary} 
                   />
                   {formData.calc_details && (
                     <div className="text-[9px] text-slate-500 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed">
                        {formData.calc_details}
                     </div>
                   )}
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mr-1">حوافز ومكافآت (قابلة للتعديل)</label>
                   <div className="relative">
                      <input 
                        type="number" 
                        className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-4 text-sm font-black text-emerald-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                        value={formData.bonuses} 
                        onChange={e => setFormData({...formData, bonuses: e.target.value})}
                      />
                      {(salaryTab === 'teachers' || salaryTab === 'supervisors') && (
                        <button type="button" onClick={() => setIsDetailModalOpen(true)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 shadow-sm"><Calculator size={14}/></button>
                      )}
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest mr-1">خصومات (قابلة للتعديل)</label>
                   <div className="relative">
                      <input 
                        type="number" 
                        className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-4 text-sm font-black text-rose-700 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all" 
                        value={formData.deductions} 
                        onChange={e => setFormData({...formData, deductions: e.target.value})}
                      />
                      {(salaryTab === 'teachers' || salaryTab === 'supervisors') && (
                        <button type="button" onClick={() => setIsDetailModalOpen(true)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 shadow-sm"><Calculator size={14}/></button>
                      )}
                   </div>
                </div>

                <div className="col-span-2 space-y-1.5 pt-4">
                   <label className="text-[11px] font-black text-blue-700 uppercase tracking-widest mr-1 flex items-center">
                      <Wallet size={14} className="ml-1 text-blue-600" /> الراتب النهائي المستحق (للتأكيد)
                   </label>
                   <div className="relative">
                      <input 
                        type="number" 
                        readOnly 
                        className="w-full bg-blue-50 border-2 border-blue-200 rounded-2xl px-5 py-5 text-xl font-black text-blue-800 outline-none shadow-inner" 
                        value={formData.final_amount} 
                      />
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-blue-400">ج.م</span>
                   </div>
                </div>
                
                <div className="col-span-2 mt-4">
                  <button type="submit" disabled={actionLoading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-xl flex items-center justify-center active:scale-95 disabled:opacity-50">
                    {actionLoading ? <Loader2 className="animate-spin ml-2" size={20} /> : <CheckCircle className="ml-2" size={20} />}
                    تأكيد وإتمام الصرف
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 text-right">
             <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                   <div className="p-3 bg-white/10 rounded-2xl text-amber-400"><Calculator size={28}/></div>
                   <div>
                      <h3 className="text-xl font-black">المعادلة الذكية للمستحقات</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">تحليل الحضور لـ {formData.employee_name}</p>
                   </div>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"><X size={24}/></button>
             </div>

             <div className="p-8 lg:p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {fetchingStats && (
                  <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xs animate-pulse">
                     <RefreshCw className="animate-spin ml-2" size={16} />
                     جاري تحليل سجل الحضور والجدول الرسمي...
                  </div>
                )}

                <div className="space-y-6">
                   <h4 className="text-rose-600 font-black text-xs uppercase tracking-widest flex items-center border-b border-rose-50 pb-2">
                      <MinusCircle size={16} className="ml-2" />
                      ١. الخصومات المقترحة (يمكنك التعديل اليدوي لاحقاً)
                   </h4>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 group">
                         <label className="text-[10px] font-black text-slate-400 flex items-center justify-between mb-2">
                            <span>غياب بإذن (أيام)</span>
                            <Edit3 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </label>
                         <div className="flex items-center justify-between">
                            <input 
                              type="number" min="0"
                              className="bg-transparent text-xl font-black text-slate-800 outline-none w-20"
                              value={formData.detailed_finance.perm_absent_days}
                              onChange={e => setFormData({...formData, detailed_finance: {...formData.detailed_finance, perm_absent_days: parseInt(e.target.value) || 0}})}
                            />
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black">سجل الحضور</span>
                         </div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 group">
                         <label className="text-[10px] font-black text-slate-400 flex items-center justify-between mb-2">
                            <span>غياب بدون إذن</span>
                            <Edit3 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </label>
                         <div className="flex items-center gap-4">
                            <input 
                              type="number" min="0"
                              className="bg-transparent text-xl font-black text-rose-600 outline-none w-20"
                              value={formData.detailed_finance.unperm_absent_days}
                              onChange={e => setFormData({...formData, detailed_finance: {...formData.detailed_finance, unperm_absent_days: parseInt(e.target.value) || 0}})}
                            />
                            <select className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-[10px] font-black outline-none" value={formData.detailed_finance.unperm_multiplier} onChange={e => setFormData({...formData, detailed_finance: {...formData.detailed_finance, unperm_multiplier: parseInt(e.target.value) || 1}})}>
                               <option value="1">خصم ١</option>
                               <option value="2">خصم ٢</option>
                               <option value="3">خصم ٣</option>
                            </select>
                         </div>
                      </div>

                      <div className="col-span-full bg-rose-50/30 p-5 rounded-[2rem] border border-rose-100 flex items-center justify-between group">
                         <div>
                            <label className="text-[10px] font-black text-rose-600 uppercase flex items-center">
                               <Clock size={12} className="ml-1" /> ساعات التأخير التراكمية
                            </label>
                            <p className="text-[8px] text-rose-400 font-bold mt-1">كل تأخير {'>'} ١٠ دقائق = ساعة خصم</p>
                         </div>
                         <div className="flex items-center">
                            <input 
                              type="number" min="0"
                              className="bg-white/50 border border-rose-100 rounded-xl px-3 py-1 text-xl font-black text-rose-700 outline-none w-24 text-center ml-2"
                              value={formData.detailed_finance.late_hours}
                              onChange={e => setFormData({...formData, detailed_finance: {...formData.detailed_finance, late_hours: parseInt(e.target.value) || 0}})}
                            />
                            <span className="text-xs font-black text-rose-400">ساعة</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-emerald-700 font-black text-xs uppercase tracking-widest flex items-center border-b border-emerald-50 pb-2">
                      <PlusCircle size={16} className="ml-2" />
                      ٢. الحوافز المقترحة (يمكنك التعديل اليدوي لاحقاً)
                   </h4>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-50/30 p-5 rounded-[2rem] border border-emerald-100 flex items-center justify-between group">
                         <div>
                            <label className="text-[10px] font-black text-emerald-600 uppercase flex items-center">
                               <Clock size={12} className="ml-1" /> ساعات عمل إضافية
                            </label>
                            <p className="text-[8px] text-emerald-400 font-bold mt-1">تجاوز الانصراف بـ ٣٠ دقيقة</p>
                         </div>
                         <div className="flex items-center">
                            <input 
                              type="number" min="0"
                              className="bg-white/50 border border-emerald-100 rounded-xl px-3 py-1 text-xl font-black text-emerald-700 outline-none w-24 text-center ml-2"
                              value={formData.detailed_finance.extra_hours}
                              onChange={e => setFormData({...formData, detailed_finance: {...formData.detailed_finance, extra_hours: parseInt(e.target.value) || 0}})}
                            />
                            <span className="text-xs font-black text-emerald-400">ساعة</span>
                         </div>
                      </div>

                      <div className="bg-blue-50/30 p-5 rounded-[2rem] border border-blue-100 flex items-center justify-between group">
                         <div>
                            <label className="text-[10px] font-black text-blue-600 uppercase flex items-center">
                               <CalendarDays size={12} className="ml-1" /> أيام عمل خارج الجدول
                            </label>
                            <p className="text-[8px] text-blue-400 font-bold mt-1">انتداب أو أيام حضور غير مجدولة</p>
                         </div>
                         <div className="flex items-center">
                            <input 
                              type="number" min="0"
                              className="bg-white/50 border border-blue-100 rounded-xl px-3 py-1 text-xl font-black text-blue-700 outline-none w-24 text-center ml-2 shadow-inner"
                              value={formData.detailed_finance.extra_days}
                              onChange={e => setFormData({...formData, detailed_finance: {...formData.detailed_finance, extra_days: parseInt(e.target.value) || 0}})}
                            />
                            <span className="text-xs font-black text-blue-400">يوم</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="text-right">
                   <span className="block text-[9px] font-black text-slate-400 uppercase">النتائج المحسوبة لحظياً</span>
                   <div className="flex space-x-4 space-x-reverse">
                      <span className="text-xs font-black text-rose-500">الخصم: {formData.deductions} ج.م</span>
                      <span className="text-xs font-black text-emerald-600">الإضافي: {formData.bonuses} ج.م</span>
                   </div>
                </div>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center"
                >
                   <CheckCircle className="ml-2" size={18} />
                   العودة للاستمارة الرئيسية
                </button>
             </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      ` }} />
    </div>
  );
};

export default Salaries;
