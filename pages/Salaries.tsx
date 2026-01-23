
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DollarSign, 
  Plus, 
  Users, 
  Loader2, 
  Trash2, 
  X, 
  CheckCircle, 
  // Add missing Check icon
  Check,
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

const OtherExpensesView: React.FC<{ onUpdate?: () => void, selectedBranch: string }> = ({ onUpdate, selectedBranch }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'نثريات',
    branch: 'الرئيسي'
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await db.finance.otherExpenses.getAll();
      setExpenses(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    setActionLoading(true);
    try {
      await db.finance.otherExpenses.create({
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        branch: formData.branch,
        date: new Date().toISOString()
      });
      await fetchExpenses();
      onUpdate?.();
      setIsModalOpen(false);
      setFormData({ description: '', amount: '', category: 'نثريات', branch: 'الرئيسي' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      await db.finance.otherExpenses.delete(id);
      await fetchExpenses();
      onUpdate?.();
    } catch (err) {
      alert('فشل الحذف');
    }
  };

  const filtered = expenses.filter(e => selectedBranch === 'الكل' || e.branch === selectedBranch);

  return (
    <div className="space-y-6 text-right" dir="rtl">
       <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800">سجل المصروفات التشغيلية</h3>
          <button onClick={() => setIsModalOpen(true)} className="bg-rose-600 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center shadow-lg">
             <Plus size={16} className="ml-2" /> إضافة مصروف جديد
          </button>
       </div>

       <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
             <table className="w-full text-right">
                <thead className="bg-slate-50">
                   <tr>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">البيان / الوصف</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">الفئة</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المبلغ</th>
                      <th className="p-4"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {loading ? (
                      <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={32}/></td></tr>
                   ) : filtered.length === 0 ? (
                      <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-bold">لا توجد مصروفات مسجلة</td></tr>
                   ) : filtered.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                         <td className="p-4 text-xs font-black text-slate-700">{exp.description}</td>
                         <td className="p-4 text-[10px] font-bold text-slate-400">{exp.category}</td>
                         <td className="p-4 text-xs font-black text-rose-600 text-center">-{Number(exp.amount).toLocaleString()} ج.م</td>
                         <td className="p-4 text-left">
                            <button onClick={() => handleDelete(exp.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
             <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xl font-black text-slate-800">تسجيل مصروف جديد</h3>
                   <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 text-right">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase">وصف المصروف</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-rose-500/10" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="مثال: فاتورة كهرباء شهر 5" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase">المبلغ</label>
                         <input required type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase">الفئة</label>
                         <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option value="نثريات">نثريات</option>
                            <option value="إيجار">إيجار</option>
                            <option value="كهرباء/مياه">كهرباء/مياه</option>
                            <option value="أدوات مكتبية">أدوات مكتبية</option>
                            <option value="أخرى">أخرى</option>
                         </select>
                      </div>
                   </div>
                   <button disabled={actionLoading} className="w-full bg-rose-600 text-white py-4 rounded-xl font-black shadow-lg hover:bg-rose-700 transition-all flex items-center justify-center">
                      {actionLoading ? <Loader2 size={18} className="ml-2 animate-spin"/> : <Check size={18} className="ml-2"/>}
                      اعتماد المصروف
                   </button>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};

const Salaries: React.FC<SalariesProps> = ({ onUpdate, selectedBranch }) => {
  const [salaryTab, setSalaryTab] = useState<'sales' | 'supervisors' | 'teachers'>('teachers');
  const [viewMode, setViewMode] = useState<'payroll' | 'accounts'>('payroll');

  const [salaries, setSalaries] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [supervisorsList, setSupervisorsList] = useState<any[]>([]);
  const [salesList, setSalesList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]); 
  const [studentExpenses, setStudentExpenses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchingStats, setFetchingStats] = useState(false);

  const [formData, setFormData] = useState({
    employee_name: '',
    employee_id: '',
    role: 'teacher',
    base_salary: '',
    bonuses: '0',
    deductions: '0',
    final_amount: '0',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: 'تم الصرف',
    branch: '',
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

  useEffect(() => { fetchData(); }, []);

  // دالة حساب مستحقات المحاضر بناءً على سعر ساعته الشخصي
  const calculateTeacherWage = (teacherName: string) => {
    const teacherProfile = teachersList.find(t => t.full_name === teacherName);
    const hourlyRate = teacherProfile?.hourly_rate || 65; // استخدام سعر الساعة من البروفايل أو 65 كاحتياطي
    
    const teacherClasses = classesList.filter(c => c.teacher === teacherName);
    let totalSalary = 0;
    let details = [];

    for (const cls of teacherClasses) {
      const duration = parseInt(cls.duration) || 30;
      const hoursPerSession = duration / 60;
      const sessionCost = hoursPerSession * hourlyRate;
      
      totalSalary += sessionCost;
      details.push(`${cls.name}: ${duration}د (بمعدل ${hourlyRate}ج/س) = ${sessionCost.toFixed(2)}ج`);
    }

    return { total: parseFloat(totalSalary.toFixed(2)), details: details.join(' | ') };
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
          calc_details: calcDetails
        });
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
    if (salaryTab === 'sales') filtered = filtered.filter(s => s.role === 'sales');
    else if (salaryTab === 'supervisors') filtered = filtered.filter(s => s.role === 'supervisor' || s.role === 'general_supervisor');
    else filtered = filtered.filter(s => s.role === 'teacher' || !s.role);

    if (selectedBranch !== 'الكل') filtered = filtered.filter(s => s.branch === selectedBranch);
    return filtered;
  }, [salaries, selectedBranch, salaryTab]);

  const totalPayroll = filteredSalaries.reduce((acc, curr) => acc + (Number(curr.final_amount) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex bg-white p-1.5 rounded-[2rem] border border-slate-100 shadow-sm w-full md:w-fit overflow-x-auto no-scrollbar">
        <button onClick={() => { setSalaryTab('sales'); setViewMode('payroll'); }} className={`flex items-center px-6 py-3 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap ${salaryTab === 'sales' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-purple-600'}`}>
            <Headphones size={16} className="ml-2" /> رواتب خدمة العملاء
        </button>
        <button onClick={() => { setSalaryTab('supervisors'); setViewMode('payroll'); }} className={`flex items-center px-6 py-3 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap ${salaryTab === 'supervisors' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-blue-600'}`}>
            <ShieldCheck size={16} className="ml-2" /> رواتب المشرفين
        </button>
        <button onClick={() => setSalaryTab('teachers')} className={`flex items-center px-6 py-3 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap ${salaryTab === 'teachers' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-emerald-600'}`}>
            <GraduationCap size={16} className="ml-2" /> رواتب المحاضرين
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center">
            <DollarSign className="ml-3 text-emerald-600" size={28} />
            {salaryTab === 'sales' ? 'مسيرات رواتب المبيعات' : salaryTab === 'supervisors' ? 'مسيرات رواتب الإشراف' : 'مسيرات رواتب المحاضرين'}
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">إدارة المستحقات المالية والخصومات</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center shadow-xl">
          <Plus size={20} className="ml-2" /> إصدار راتب جديد
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">الموظف</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">الأساسي</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">صافي الراتب</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">الفترة</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={32}/></td></tr>
              ) : filteredSalaries.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold">لا توجد رواتب مسجلة</td></tr>
              ) : filteredSalaries.map(sal => (
                <tr key={sal.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-800">{sal.employee_name}</span>
                    <span className="block text-[9px] text-slate-400 font-bold mt-0.5">{sal.role}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{Number(sal.base_salary).toLocaleString()} ج.م</td>
                  <td className="px-6 py-4 font-black text-blue-700 text-sm text-center">{Number(sal.final_amount).toLocaleString()} ج.م</td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-400">{sal.month} / {sal.year}</td>
                  <td className="px-6 py-4 text-left">
                    <button onClick={() => { if(confirm('حذف؟')) db.finance.salaries.delete(sal.id).then(fetchData); }} className="p-2 text-slate-200 hover:text-rose-500"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsModalOpen(false)}></div>
           <div className="relative w-full max-w-2xl bg-white rounded-[3.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8 text-right" dir="rtl">
                <h3 className="text-xl font-black text-slate-800">إصدار مستحق مالي</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl"><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">اسم الموظف</label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none" value={formData.employee_id} onChange={(e) => handleEmployeeSelect(e.target.value)}>
                    <option value="">-- اختر الموظف --</option>
                    {salaryTab === 'sales' && salesList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                    {salaryTab === 'supervisors' && supervisorsList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                    {salaryTab === 'teachers' && teachersList.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">المبلغ الأساسي (محسوب)</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold" value={formData.base_salary} onChange={e => setFormData({...formData, base_salary: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">صافي المستحق</label>
                    <input readOnly className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-black text-blue-600" value={formData.final_amount} />
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl text-[10px] font-bold text-blue-700 leading-relaxed">
                   {formData.calc_details || 'سيتم حساب الراتب بناءً على سعر الساعة المسجل في ملف المحاضر مضروباً في مدة الحلقات المنفذة.'}
                </div>
                <button type="submit" disabled={actionLoading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl mt-4">
                  {actionLoading ? 'جاري الحفظ...' : 'تأكيد وصرف الراتب'}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Salaries;
