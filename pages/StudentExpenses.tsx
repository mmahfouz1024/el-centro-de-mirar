
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  Plus, 
  Search, 
  TrendingUp, 
  Loader2, 
  Trash2, 
  X, 
  CheckCircle2, 
  User, 
  Headphones, 
  ShieldCheck, 
  Coins,
  AlertTriangle
} from 'lucide-react';
import { db } from '../services/supabase';

interface StudentExpensesProps {
  onUpdate?: () => void;
  selectedBranch: string;
}

const LANGUAGE_OPTIONS = ['اسبانى', 'انجليزى', 'المانى', 'فرنساوى', 'ايطالى'];

const StudentExpenses: React.FC<StudentExpensesProps> = ({ onUpdate, selectedBranch }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [salesTeam, setSalesTeam] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    student_name: '',
    subscription_type: 'new', 
    course_type: 'اسبانى', 
    assigned_member: '', 
    amount: '', 
    payment_type: 'full', 
    amount_paid: '',
    amount_remaining: 0,
    installments_count: '1',
    installment_amount: 0,
    teacher_ratio: '', 
    teacher_amount_paid: '',
    teacher_amount_remaining: 0,
    teacher_installments_count: '1',
    teacher_installment_amount: '',
    notes: '',
    payment_method: 'نقدي (كاش)'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.payment_type === 'partial') {
      const total = parseFloat(formData.amount) || 0;
      const paid = parseFloat(formData.amount_paid) || 0;
      const remaining = total - paid;
      const instCount = parseInt(formData.installments_count) || 1;
      
      const tTotal = parseFloat(formData.teacher_ratio) || 0;
      const tPaid = parseFloat(formData.teacher_amount_paid) || 0;
      const tRemaining = tTotal - tPaid;

      setFormData(prev => ({
        ...prev,
        amount_remaining: remaining > 0 ? remaining : 0,
        installment_amount: remaining > 0 ? parseFloat((remaining / instCount).toFixed(2)) : 0,
        teacher_amount_remaining: tRemaining > 0 ? tRemaining : 0
      }));
    }
  }, [formData.amount, formData.amount_paid, formData.installments_count, formData.teacher_ratio, formData.teacher_amount_paid, formData.payment_type]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expData, salesData, profilesData] = await Promise.all([
        db.finance.studentExpenses.getAll(),
        db.salesTeam.getAll(),
        db.profiles.getAll()
      ]);
      
      setExpenses(expData || []);
      setSalesTeam(salesData || []);
      const sups = (profilesData || []).filter((p: any) => p.role === 'supervisor' || p.role === 'general_supervisor');
      setSupervisors(sups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!formData.student_name || !formData.amount) {
      setErrorMessage('يرجى إدخال اسم الطالب والمبلغ الإجمالي');
      return;
    }
    
    setActionLoading(true);
    try {
      const payload = {
        student_name: formData.student_name,
        amount: parseFloat(formData.amount) || 0,
        category: 'رسوم دراسية',
        notes: formData.notes,
        payment_method: formData.payment_method,
        branch: 'الرئيسي',
        date: new Date().toISOString(),
        subscription_type: formData.subscription_type === 'new' ? 'طالب جديد' : 'طالب قديم',
        course_type: formData.course_type,
        assigned_member: formData.assigned_member,
        teacher_ratio: parseFloat(formData.teacher_ratio) || 0,
        payment_type: formData.payment_type,
        amount_paid: parseFloat(formData.amount_paid || formData.amount) || 0,
        amount_remaining: formData.amount_remaining,
        installments_count: parseInt(formData.installments_count) || 1,
        installment_amount: formData.installment_amount,
        teacher_amount_paid: parseFloat(formData.teacher_amount_paid) || 0,
        teacher_amount_remaining: formData.teacher_amount_remaining,
        teacher_installments_count: parseInt(formData.teacher_installments_count) || 1,
        teacher_installment_amount: parseFloat(formData.teacher_installment_amount || '0') || 0
      };

      await db.finance.studentExpenses.create(payload);
      
      fetchData();
      onUpdate?.();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Save Error:", err);
      setErrorMessage(err.message || 'حدث خطأ أثناء الحفظ. تأكد من تهيئة الجدول في قاعدة البيانات.');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      student_name: '',
      subscription_type: 'new',
      course_type: 'اسبانى',
      assigned_member: '',
      amount: '',
      payment_type: 'full',
      amount_paid: '',
      amount_remaining: 0,
      installments_count: '1',
      installment_amount: 0,
      teacher_ratio: '',
      teacher_amount_paid: '',
      teacher_amount_remaining: 0,
      teacher_installments_count: '1',
      teacher_installment_amount: '',
      notes: '',
      payment_method: 'نقدي (كاش)'
    });
    setErrorMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا القيد المالي؟')) return;
    try {
      await db.finance.studentExpenses.delete(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      onUpdate?.();
    } catch (err) {
      alert('فشل الحذف');
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => 
      e.student_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedBranch === 'الكل' || e.branch === selectedBranch)
    );
  }, [expenses, searchTerm, selectedBranch]);

  const totalCollected = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Wallet className="ml-3 text-blue-700" size={32} />
            تحصيل اشتراكات الطلاب
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">سجل المدفوعات والاشتراكات الجديدة والقديمة</p>
        </div>

        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all active:scale-95"
        >
          <Plus size={20} className="ml-2" />
          تحصيل اشتراك جديد
        </button>
      </div>

      <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl flex items-center justify-between group overflow-hidden relative">
         <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي التحصيلات (للفلتر الحالي)</p>
            <h4 className="text-3xl font-black text-amber-400">{totalCollected.toLocaleString()} <span className="text-xs text-white/40">ج.م</span></h4>
         </div>
         <div className="p-4 bg-white/5 text-amber-400 rounded-2xl border border-white/5 relative z-10"><TrendingUp size={28}/></div>
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/50 to-slate-900/50"></div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="ابحث عن عملية تحصيل باسم الطالب..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">الطالب</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المسار</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">نوع الدفع</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المسؤول</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الإجمالي</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المدفوع</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المتبقي</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={8} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={40}/></td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={8} className="py-20 text-center text-slate-300 font-black">لا توجد عمليات تحصيل مسجلة</td></tr>
              ) : filteredExpenses.map(item => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100">
                          {item.student_name[0]}
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-slate-800">{item.student_name}</h4>
                          <span className="text-[9px] font-bold text-slate-400">{new Date(item.date).toLocaleDateString('ar-EG')}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-blue-50 text-blue-600">
                        {item.course_type}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className={`px-3 py-1 rounded-lg text-[9px] font-black ${
                       item.payment_type === 'partial' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                     }`}>
                        {item.payment_type === 'partial' ? 'دفع جزئي' : 'دفع كلي'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-600">
                    {item.assigned_member || '---'}
                  </td>
                  <td className="px-6 py-4 text-center font-black text-sm text-slate-700">
                    {item.amount}ج
                  </td>
                  <td className="px-6 py-4 text-center font-black text-sm text-emerald-600">
                    {item.amount_paid || item.amount}ج
                  </td>
                  <td className="px-6 py-4 text-center font-black text-sm text-rose-600">
                    {item.amount_remaining || 0}ج
                  </td>
                  <td className="px-6 py-4 text-left">
                     <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !actionLoading && setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-8 lg:p-10 animate-in zoom-in duration-300 text-right max-h-[95vh] overflow-y-auto custom-scrollbar">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 flex items-center">
                  <Coins className="ml-2 text-emerald-600" />
                  تحصيل مبلغ اشتراك
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500"><X size={20}/></button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-8">
                {errorMessage && (
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-600 animate-shake">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-black">{errorMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم الطالب</label>
                      <input 
                       type="text" required 
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
                       placeholder="اكتب اسم الطالب..."
                       value={formData.student_name}
                       onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">نوع الاشتراك</label>
                      <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                         <button type="button" onClick={() => setFormData({...formData, subscription_type: 'new'})} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${formData.subscription_type === 'new' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>جديد</button>
                         <button type="button" onClick={() => setFormData({...formData, subscription_type: 'old'})} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${formData.subscription_type === 'old' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>قديم</button>
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المسار التعليمي (اللغة)</label>
                      <select 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none cursor-pointer"
                         value={formData.course_type}
                         onChange={(e) => setFormData({...formData, course_type: e.target.value})}
                      >
                         {LANGUAGE_OPTIONS.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                         ))}
                      </select>
                   </div>
                </div>

                <div className="space-y-1.5 animate-in slide-in-from-top-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                      {formData.subscription_type === 'new' ? <Headphones size={12} className="ml-1 text-purple-500" /> : <ShieldCheck size={12} className="ml-1 text-indigo-500" />}
                      {formData.subscription_type === 'new' ? 'مسؤول المبيعات' : 'المشرف المسؤول'}
                   </label>
                   <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none cursor-pointer"
                    value={formData.assigned_member}
                    onChange={(e) => setFormData({...formData, assigned_member: e.target.value})}
                   >
                     <option value="">-- اختر المسؤول --</option>
                     {formData.subscription_type === 'new' ? salesTeam.map(s => <option key={s.id} value={s.full_name}>{s.full_name}</option>) : supervisors.map(s => <option key={s.id} value={s.full_name}>{s.full_name}</option>)}
                   </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-black text-slate-800 flex items-center">
                      <Coins size={14} className="ml-2" /> طريقة دفع الاشتراك
                    </label>
                    <div className="flex bg-white/50 p-1 rounded-xl border border-slate-200">
                      <button type="button" onClick={() => setFormData({...formData, payment_type: 'full', amount_paid: formData.amount, installments_count: '1'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${formData.payment_type === 'full' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>دفع كلي</button>
                      <button type="button" onClick={() => setFormData({...formData, payment_type: 'partial'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${formData.payment_type === 'partial' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>دفع جزئي</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-700 uppercase">المبلغ الإجمالي</label>
                        <input type="number" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-900 outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-emerald-700 uppercase">المبلغ المدفوع الآن</label>
                        <input type="number" className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm font-black text-emerald-700 outline-none" value={formData.amount_paid} onChange={e => setFormData({...formData, amount_paid: e.target.value})} placeholder="0" />
                     </div>
                     {formData.payment_type === 'partial' && (
                       <>
                         <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-700 uppercase">عدد الدفعات المتبقية</label>
                            <select className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-900 outline-none cursor-pointer" value={formData.installments_count} onChange={e => setFormData({...formData, installments_count: e.target.value})}>
                              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} دفعات</option>)}
                            </select>
                         </div>
                         <div className="bg-white/40 p-3 rounded-xl border border-slate-200 flex flex-col justify-center">
                            <span className="text-[8px] font-black text-blue-600 uppercase block">قيمة القسط الواحد (آلي)</span>
                            <span className="text-sm font-black text-slate-900">{formData.installment_amount} ج.م</span>
                         </div>
                       </>
                     )}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                   <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <h4 className="text-sm font-black text-slate-800 flex items-center">
                         <User size={16} className="ml-2 text-rose-500" /> تفاصيل استحقاق المعلم
                      </h4>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي مستحق المعلم</label>
                         <input 
                           type="number" 
                           className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm font-black text-rose-600 outline-none focus:ring-4 focus:ring-rose-500/10"
                           value={formData.teacher_ratio}
                           onChange={(e) => setFormData({...formData, teacher_ratio: e.target.value})}
                         />
                      </div>

                      {formData.payment_type === 'partial' && (
                        <>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المدفوع للمعلم حالياً</label>
                              <input 
                                type="number" 
                                className="w-full bg-white border border-emerald-100 rounded-2xl px-5 py-3 text-sm font-black text-emerald-600 outline-none"
                                value={formData.teacher_amount_paid}
                                onChange={(e) => setFormData({...formData, teacher_amount_paid: e.target.value})}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">عدد دفعات المعلم</label>
                              <select className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm font-black outline-none" value={formData.teacher_installments_count} onChange={e => setFormData({...formData, teacher_installments_count: e.target.value})}>
                                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} دفعات</option>)}
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">مبلغ قسط المعلم (يدوي)</label>
                              <input 
                                type="number" 
                                className="w-full bg-white border border-blue-100 rounded-2xl px-5 py-3 text-sm font-black text-blue-600 outline-none"
                                value={formData.teacher_installment_amount}
                                onChange={(e) => setFormData({...formData, teacher_installment_amount: e.target.value})}
                                placeholder="حدد القسط يدوياً..."
                              />
                           </div>
                        </>
                      )}
                   </div>
                   
                   {formData.payment_type === 'partial' && (
                     <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase">المتبقي للمعلم:</span>
                        <span className="text-sm font-black text-rose-600">{formData.teacher_amount_remaining} ج.م</span>
                     </div>
                   )}
                </div>

                <button 
                  type="submit" disabled={actionLoading}
                  className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black shadow-2xl flex items-center justify-center transition-all hover:bg-black active:scale-95 disabled:opacity-50 text-lg"
                >
                  {actionLoading ? <Loader2 className="animate-spin ml-3" size={24} /> : <CheckCircle2 className="ml-3" size={24} />}
                  اعتماد قيد التحصيل المالي
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentExpenses;
