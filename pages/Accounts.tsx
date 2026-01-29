
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Wallet, 
  Plus, 
  Loader2, 
  Check, 
  Trash2, 
  TrendingDown, 
  ArrowUpRight,
  Coins,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingDown as TrendingDownIcon,
  X,
  Activity,
  CalendarDays,
  FileText,
  Calendar
} from 'lucide-react';
import Salaries from './Salaries';
import StudentExpenses from './StudentExpenses';
import { db, supabase } from '../services/supabase';

// 1. تعريف المكونات الفرعية أولاً لتجنب خطأ Initialization
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

const MonthlyReportView = () => {
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  
  const [data, setData] = useState({
    income: [] as any[],
    salaries: [] as any[],
    expenses: [] as any[],
    loading: true
  });

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedDate]);

  const fetchMonthlyData = async () => {
    setData(prev => ({ ...prev, loading: true }));
    try {
      const [allIncome, allSalaries, allExpenses] = await Promise.all([
        db.finance.studentExpenses.getAll(),
        db.finance.salaries.getAll(),
        db.finance.otherExpenses.getAll()
      ]);

      const monthlyIncome = allIncome.filter(item => {
        const d = new Date(item.date);
        return (d.getMonth() + 1) === selectedDate.month && d.getFullYear() === selectedDate.year;
      });

      const monthlySalaries = allSalaries.filter(item => {
        if (item.month && item.year) {
          return item.month === selectedDate.month && item.year === selectedDate.year;
        }
        const d = new Date(item.payment_date || item.created_at);
        return (d.getMonth() + 1) === selectedDate.month && d.getFullYear() === selectedDate.year;
      });

      const monthlyExpenses = allExpenses.filter(item => {
        const d = new Date(item.date);
        return (d.getMonth() + 1) === selectedDate.month && d.getFullYear() === selectedDate.year;
      });

      setData({
        income: monthlyIncome,
        salaries: monthlySalaries,
        expenses: monthlyExpenses,
        loading: false
      });
    } catch (error) {
      console.error(error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const stats = useMemo(() => {
    const totalIncome = data.income.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalTeacherAccounts = data.income.reduce((sum, i) => sum + (Number(i.teacher_ratio) || 0), 0);
    const adminSalaries = data.salaries
        .filter(s => s.role !== 'teacher')
        .reduce((sum, s) => sum + (Number(s.final_amount) || 0), 0);
    const totalExpenses = data.expenses.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalOut = totalTeacherAccounts + adminSalaries + totalExpenses;
    const net = totalIncome - totalOut;
    return { totalIncome, totalTeacherAccounts, adminSalaries, totalExpenses, totalOut, net };
  }, [data]);

  const months = [
    { v: 1, l: 'يناير' }, { v: 2, l: 'فبراير' }, { v: 3, l: 'مارس' }, { v: 4, l: 'أبريل' },
    { v: 5, l: 'مايو' }, { v: 6, l: 'يونيو' }, { v: 7, l: 'يوليو' }, { v: 8, l: 'أغسطس' },
    { v: 9, l: 'سبتمبر' }, { v: 10, l: 'أكتوبر' }, { v: 11, l: 'نوفمبر' }, { v: 12, l: 'ديسمبر' }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
               <Calendar size={24} />
            </div>
            <div>
               <h3 className="text-lg font-black text-slate-800">تحديد الفترة المالية</h3>
               <p className="text-[10px] font-bold text-slate-400">اختر الشهر والسنة لعرض التقرير</p>
            </div>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <select className="bg-slate-50 border border-slate-100 text-slate-700 font-black text-sm rounded-xl px-4 py-3 outline-none cursor-pointer w-full md:w-40" value={selectedDate.month} onChange={(e) => setSelectedDate({ ...selectedDate, month: parseInt(e.target.value) })}>
               {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
            <select className="bg-slate-50 border border-slate-100 text-slate-700 font-black text-sm rounded-xl px-4 py-3 outline-none cursor-pointer w-full md:w-32" value={selectedDate.year} onChange={(e) => setSelectedDate({ ...selectedDate, year: parseInt(e.target.value) })}>
               {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
         </div>
      </div>

      {data.loading ? (
         <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={48} /></div>
      ) : (
         <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden group">
                  <div className="relative z-10">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">إجمالي الإيرادات</p>
                     <h4 className="text-3xl font-black text-emerald-700">{stats.totalIncome.toLocaleString()} <span className="text-sm">ج.م</span></h4>
                  </div>
                  <ArrowUpCircle className="absolute -bottom-4 -left-4 text-emerald-200 opacity-50 group-hover:scale-110 transition-transform" size={100} />
               </div>
               <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 relative overflow-hidden group">
                  <div className="relative z-10">
                     <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">إجمالي المصروفات (الصافي)</p>
                     <h4 className="text-3xl font-black text-rose-700">{stats.totalOut.toLocaleString()} <span className="text-sm">ج.م</span></h4>
                     <p className="text-[9px] font-bold text-rose-400 mt-1">(محاضرين: {stats.totalTeacherAccounts.toLocaleString()} + إداري: {stats.adminSalaries.toLocaleString()} + تشغيل: {stats.totalExpenses.toLocaleString()})</p>
                  </div>
                  <ArrowDownCircle className="absolute -bottom-4 -left-4 text-rose-200 opacity-50 group-hover:scale-110 transition-transform" size={100} />
               </div>
               <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden group ${stats.net >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="relative z-10">
                     <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${stats.net >= 0 ? 'text-blue-600' : 'text-slate-500'}`}>صافي الدخل الشهري</p>
                     <h4 className={`text-3xl font-black ${stats.net >= 0 ? 'text-blue-700' : 'text-slate-700'}`}>{stats.net.toLocaleString()} <span className="text-sm">ج.م</span></h4>
                  </div>
                  <Activity className={`absolute -bottom-4 -left-4 opacity-20 group-hover:scale-110 transition-transform ${stats.net >= 0 ? 'text-blue-300' : 'text-slate-300'}`} size={100} />
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-emerald-50/30">
                     <h3 className="font-black text-emerald-800 flex items-center"><ArrowUpRight size={18} className="ml-2"/> تفاصيل الإيرادات</h3>
                     <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-slate-100">{data.income.length} عملية</span>
                  </div>
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                     <table className="w-full text-right">
                        <thead className="bg-slate-50 sticky top-0">
                           <tr>
                              <th className="p-4 text-[9px] font-black text-slate-400 uppercase">البند / الطالب</th>
                              <th className="p-4 text-[9px] font-black text-slate-400 uppercase">التاريخ</th>
                              <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-center">المبلغ</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {data.income.length === 0 ? (
                              <tr><td colSpan={3} className="p-8 text-center text-slate-300 font-bold">لا توجد إيرادات هذا الشهر</td></tr>
                           ) : data.income.map((item, i) => (
                              <tr key={i} className="hover:bg-slate-50/50">
                                 <td className="p-4 text-xs font-black text-slate-700">{item.student_name}</td>
                                 <td className="p-4 text-[10px] font-bold text-slate-400">{new Date(item.date).toLocaleDateString('ar-EG')}</td>
                                 <td className="p-4 text-xs font-black text-emerald-600 text-center">+{Number(item.amount).toLocaleString()}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-rose-50/30">
                     <h3 className="font-black text-rose-800 flex items-center"><TrendingDown size={18} className="ml-2"/> تفاصيل المصروفات</h3>
                     <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-slate-100">{data.expenses.length + (stats.totalTeacherAccounts > 0 ? 1 : 0) + data.salaries.filter(s => s.role !== 'teacher').length} عملية</span>
                  </div>
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                     <table className="w-full text-right">
                        <thead className="bg-slate-50 sticky top-0">
                           <tr>
                              <th className="p-4 text-[9px] font-black text-slate-400 uppercase">البند</th>
                              <th className="p-4 text-[9px] font-black text-slate-400 uppercase">النوع</th>
                              <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-center">المبلغ</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {stats.totalTeacherAccounts > 0 && (
                              <tr className="hover:bg-slate-50/50 bg-rose-50/20">
                                 <td className="p-4 text-xs font-black text-slate-800">مستحقات المحاضرين (حساب النسب)</td>
                                 <td className="p-4 text-[10px] font-bold text-slate-400">حساب محاضرين</td>
                                 <td className="p-4 text-xs font-black text-rose-600 text-center">-{stats.totalTeacherAccounts.toLocaleString()}</td>
                              </tr>
                           )}
                           {data.salaries.filter(s => s.role !== 'teacher').map((sal, i) => (
                              <tr key={`adm-sal-${i}`} className="hover:bg-slate-50/50 bg-purple-50/20">
                                 <td className="p-4 text-xs font-black text-slate-700">{sal.employee_name}</td>
                                 <td className="p-4 text-[10px] font-bold text-slate-400">راتب إداري ({sal.role === 'supervisor' ? 'مشرف' : sal.role === 'sales' ? 'مبيعات' : 'إداري'})</td>
                                 <td className="p-4 text-xs font-black text-rose-600 text-center">-{Number(sal.final_amount).toLocaleString()}</td>
                              </tr>
                           ))}
                           {data.expenses.map((exp, i) => (
                              <tr key={`exp-${i}`} className="hover:bg-slate-50/50">
                                 <td className="p-4 text-xs font-black text-slate-700">{exp.description}</td>
                                 <td className="p-4 text-[10px] font-bold text-slate-400">{exp.category}</td>
                                 <td className="p-4 text-xs font-black text-rose-600 text-center">-{Number(exp.amount).toLocaleString()}</td>
                              </tr>
                           ))}
                           {stats.totalTeacherAccounts === 0 && stats.adminSalaries === 0 && data.expenses.length === 0 && (
                              <tr><td colSpan={3} className="p-8 text-center text-slate-300 font-bold">لا توجد مصروفات هذا الشهر</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </>
      )}
    </div>
  );
};

// 2. المكون الرئيسي يأتي في النهاية
const Accounts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'salaries' | 'students' | 'expenses' | 'monthly_report'>('monthly_report');
  const [vaultData, setVaultData] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    loading: true,
    lastUpdate: new Date().toLocaleTimeString('ar-EG')
  });

  const calculateVault = useCallback(async () => {
    try {
      const [stdExp, salaries, otherExp] = await Promise.all([
        db.finance.studentExpenses.getAll(),
        db.finance.salaries.getAll(),
        db.finance.otherExpenses.getAll()
      ]);
      const stdIncome = stdExp.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const totalIn = stdIncome;
      const salariesOut = salaries.reduce((sum, item) => sum + (Number(item.final_amount) || 0), 0);
      const otherOut = otherExp.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const totalOut = salariesOut + otherOut;
      setVaultData({
        balance: totalIn - totalOut,
        totalIncome: totalIn,
        totalExpense: totalOut,
        loading: false,
        lastUpdate: new Date().toLocaleTimeString('ar-EG')
      });
    } catch (error) {
      console.error("Vault Calculation Error:", error);
      setVaultData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    calculateVault();
    const channel = supabase
      .channel('realtime-finance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_expenses' }, () => calculateVault())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'salaries' }, () => calculateVault())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'other_expenses' }, () => calculateVault())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [calculateVault]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Calculator className="ml-3 text-blue-700" size={32} />
            مركز الحسابات والمالية
          </h2>
          <div className="flex items-center mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2"></div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">تحديث مالي لحظي نشط (Live)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-900 px-8 py-4 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center gap-6 relative overflow-hidden group min-w-[320px]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-transparent opacity-50"></div>
            <div className="p-4 bg-white/5 rounded-2xl text-amber-400 z-10 group-hover:scale-110 transition-transform">
              <Coins size={32} className={vaultData.loading ? 'animate-bounce' : ''} />
            </div>
            <div className="z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 flex items-center">رصيد الخزينة العامة</p>
              <div className="flex items-center gap-3">
                {vaultData.loading ? (
                  <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse"></div>
                ) : (
                  <span className={`text-3xl font-black transition-all duration-700 ${vaultData.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {vaultData.balance.toLocaleString()} <span className="text-xs text-slate-500 font-bold">ج.م</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-4 no-scrollbar">
        {[
          { id: 'monthly_report', label: 'التقرير الشهري', icon: FileText },
          { id: 'salaries', label: 'رواتب المحاضرين', icon: DollarSign },
          { id: 'students', label: 'اشتراكات الطلاب', icon: Wallet },
          { id: 'expenses', label: 'مصروفات إدارية', icon: TrendingDownIcon },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-8 py-4 rounded-2xl text-xs font-black whitespace-nowrap flex items-center transition-all border ${activeTab === tab.id ? 'bg-blue-700 text-white border-blue-700 shadow-xl scale-105' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}>
            <tab.icon size={18} className="ml-2" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'monthly_report' && <MonthlyReportView />}
        {activeTab === 'salaries' && <Salaries onUpdate={calculateVault} selectedBranch="الكل" />}
        {activeTab === 'students' && <StudentExpenses onUpdate={calculateVault} selectedBranch="الكل" />}
        {activeTab === 'expenses' && <OtherExpensesView onUpdate={calculateVault} selectedBranch="الكل" />}
      </div>
    </div>
  );
};

export default Accounts;
