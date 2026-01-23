
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ScrollText, 
  Plus, 
  Search, 
  Loader2, 
  Trash2, 
  Edit2, 
  X, 
  CheckCircle2, 
  User, 
  Globe, 
  Phone, 
  Calendar,
  CheckSquare,
  Square,
  ArrowRight,
  Wallet,
  Coins,
  DollarSign
} from 'lucide-react';
import { db } from '../services/supabase';

const COUNTRY_DATA: Record<string, string> = {
  'السعودية': '+966',
  'مصر': '+20',
  'تركيا': '+90',
  'عمان': '+968',
  'قطر': '+974',
  'الامارات': '+971',
  'البحرين': '+973',
  'الكويت': '+965',
  'أمريكا': '+1',
  'فرنسا': '+33',
  'بريطانيا': '+44'
};

const COUNTRIES = Object.keys(COUNTRY_DATA);

const STUDY_TYPES = [
  { id: 'narration', label: 'رواية' },
  { id: 'recitation', label: 'قراءة' }
];

const IjazaStudents: React.FC<{ user?: any }> = ({ user }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  // States for Financial Modal (Manager Only)
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [financeFormData, setFinanceFormData] = useState({
    student_name: '',
    amount: '',
    payment_type: 'full', // full | partial
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
    branch: 'الرئيسي'
  });

  const isManager = user?.role === 'manager';
  // يمكن للمدير أو من لديه الصلاحية إضافة الطلاب، ولكن المدير فقط يستطيع التعامل مع الأمور المالية
  const canManageStudents = isManager || user?.permissions?.page_ijaza;

  const [formData, setFormData] = useState({
    name: '',
    country: 'السعودية',
    age: '',
    phone: '',
    country_code: '+966',
    start_date: new Date().toISOString().split('T')[0],
    study_types: [] as string[]
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  // الحسابات الآلية للمبالغ المتبقية والأقساط في النافذة المالية
  useEffect(() => {
    if (isFinanceModalOpen && financeFormData.payment_type === 'partial') {
      const total = parseFloat(financeFormData.amount) || 0;
      const paid = parseFloat(financeFormData.amount_paid) || 0;
      const remaining = total - paid;
      const instCount = parseInt(financeFormData.installments_count) || 1;
      
      const tTotal = parseFloat(financeFormData.teacher_ratio) || 0;
      const tPaid = parseFloat(financeFormData.teacher_amount_paid) || 0;
      const tRemaining = tTotal - tPaid;

      setFinanceFormData(prev => ({
        ...prev,
        amount_remaining: remaining > 0 ? remaining : 0,
        installment_amount: remaining > 0 ? parseFloat((remaining / instCount).toFixed(2)) : 0,
        teacher_amount_remaining: tRemaining > 0 ? tRemaining : 0
      }));
    }
  }, [financeFormData.amount, financeFormData.amount_paid, financeFormData.installments_count, financeFormData.teacher_ratio, financeFormData.teacher_amount_paid, financeFormData.payment_type, isFinanceModalOpen]);


  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await db.ijazaStudents.getAll();
      setStudents(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (country: string) => {
    setFormData({
      ...formData,
      country: country,
      country_code: COUNTRY_DATA[country] || ''
    });
  };

  const toggleStudyType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      study_types: prev.study_types.includes(type)
        ? prev.study_types.filter(t => t !== type)
        : [...prev.study_types, type]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.study_types.length === 0) {
      alert('يرجى اختيار نوع الدراسة (رواية/قراءة)');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        name: formData.name,
        age: parseInt(formData.age),
        country: formData.country,
        phone: formData.country_code + formData.phone,
        start_date: formData.start_date,
        study_types: formData.study_types,
        supervisor_name: user?.full_name || 'مشرف إجازة'
      };

      if (editingStudent) {
        await db.ijazaStudents.update(editingStudent.id, payload);
      } else {
        await db.ijazaStudents.create(payload);
      }
      
      await fetchStudents();
      setIsModalOpen(false);
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
    try {
      await db.ijazaStudents.delete(id);
      fetchStudents();
    } catch (error) {
      alert('فشل الحذف');
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ 
      name: '', country: 'السعودية', age: '', phone: '', country_code: '+966', 
      start_date: new Date().toISOString().split('T')[0], study_types: [] 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    const code = COUNTRIES.find(c => student.phone.startsWith(COUNTRY_DATA[c])) ? 
                 COUNTRY_DATA[COUNTRIES.find(c => student.phone.startsWith(COUNTRY_DATA[c]))!] : '+966';
    
    setFormData({
      name: student.name,
      country: student.country,
      age: student.age.toString(),
      phone: student.phone.replace(code, ''),
      country_code: code,
      start_date: student.start_date,
      study_types: student.study_types || []
    });
    setIsModalOpen(true);
  };

  // دوال الملف المالي للمدير
  const openFinanceModal = (student: any) => {
    setFinanceFormData({
      student_name: student.name,
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
      branch: 'الرئيسي'
    });
    setIsFinanceModalOpen(true);
  };

  const handleFinanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!financeFormData.amount) return;
    
    setActionLoading(true);
    try {
      const payload = {
        student_name: financeFormData.student_name,
        amount: parseFloat(financeFormData.amount) || 0,
        category: 'رسوم دراسية',
        notes: financeFormData.notes,
        branch: financeFormData.branch,
        date: new Date().toISOString(),
        subscription_type: 'طالب إجازة', // نوع ثابت هنا
        course_type: 'إجازة', // نوع ثابت هنا
        assigned_member: 'قسم الإجازة',
        teacher_ratio: parseFloat(financeFormData.teacher_ratio) || 0,
        // الحقول التفصيلية
        payment_type: financeFormData.payment_type,
        amount_paid: parseFloat(financeFormData.amount_paid) || 0,
        amount_remaining: financeFormData.amount_remaining,
        installments_count: parseInt(financeFormData.installments_count) || 1,
        installment_amount: financeFormData.installment_amount,
        teacher_amount_paid: parseFloat(financeFormData.teacher_amount_paid) || 0,
        teacher_amount_remaining: financeFormData.teacher_amount_remaining,
        teacher_installments_count: parseInt(financeFormData.teacher_installments_count) || 1,
        teacher_installment_amount: parseFloat(financeFormData.teacher_installment_amount) || 0
      };

      await db.finance.studentExpenses.create(payload);
      alert('تم استكمال الملف المالي وتسجيل الدفعة بنجاح');
      setIsFinanceModalOpen(false);
    } catch (err) {
      alert('حدث خطأ أثناء حفظ البيانات المالية');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
            <ScrollText size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">طلاب الإجازة والقراءات</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">إدارة مسارات الإجازة العلمية للطلاب</p>
          </div>
        </div>
        
        {/* السماح بالإضافة للمدير أو من لديه صلاحية */}
        {canManageStudents && (
          <button onClick={openAddModal} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
            <Plus size={18} className="ml-2" />
            تسجيل طالب إجازة جديد
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center relative">
        <Search className="absolute right-8 text-slate-300" size={20} />
        <input 
          type="text" 
          placeholder="بحث باسم الطالب..." 
          className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-14 pl-4 py-3 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="font-black text-xs uppercase tracking-widest">جاري تحميل القائمة...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-24 text-center">
          <ScrollText size={64} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-800 mb-2">لا يوجد طلاب إجازة مسجلين</h3>
          <p className="text-slate-400 font-bold text-sm">ابدأ بإضافة الطلاب لإدارة مسارهم التعليمي</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map(student => (
            <div key={student.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl">
                  {student.name[0]}
                </div>
                
                {/* الأزرار العلوية حسب الصلاحية */}
                <div className="flex space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                   {canManageStudents && !isManager && (
                     <>
                        <button onClick={() => openEditModal(student)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(student.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                     </>
                   )}
                   {isManager && (
                     <button 
                       onClick={() => openFinanceModal(student)} 
                       className="flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl text-[9px] font-black transition-all border border-emerald-100"
                       title="إضافة تفاصيل الدفع والاشتراك"
                     >
                       <Wallet size={14} className="ml-1" />
                       استكمال المالي
                     </button>
                   )}
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-800 mb-2">{student.name}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-xs font-bold text-slate-500">
                  <Globe size={14} className="ml-2 text-blue-500" />
                  {student.country} ({student.age} سنة)
                </div>
                <div className="flex items-center text-xs font-bold text-slate-500">
                  <Phone size={14} className="ml-2 text-emerald-500" />
                  <span className="dir-ltr">{student.phone}</span>
                </div>
                <div className="flex items-center text-xs font-bold text-slate-500">
                  <Calendar size={14} className="ml-2 text-amber-500" />
                  بدأ في: {new Date(student.start_date).toLocaleDateString('ar-EG')}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                {student.study_types?.map((type: string) => (
                  <span key={type} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase">
                    {type === 'narration' ? 'رواية' : 'قراءة'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !actionLoading && setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-8 lg:p-10 animate-in zoom-in duration-300 text-right overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black text-slate-800">
                 {editingStudent ? 'تعديل بيانات الطالب' : 'تسجيل طالب إجازة'}
               </h3>
               <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الاسم الثلاثي</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="الاسم الكامل للطالب" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">البلد / الدولة</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer appearance-none"
                    value={formData.country}
                    onChange={e => handleCountryChange(e.target.value)}
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">العمر</label>
                  <input required type="number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} placeholder="مثال: 25" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم الهاتف</label>
                <div className="flex direction-ltr" dir="ltr">
                  <div className="w-20 bg-slate-100 border border-slate-200 rounded-l-2xl px-3 py-4 text-sm font-black text-center flex items-center justify-center text-slate-600">
                    {formData.country_code}
                  </div>
                  <input type="tel" required className="flex-1 bg-slate-50 border border-slate-100 rounded-r-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="5xxxxxxxx" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">تاريخ البدء</label>
                <input required type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">نوع الدراسة (اختيار متعدد)</label>
                <div className="flex space-x-3 space-x-reverse">
                  {STUDY_TYPES.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleStudyType(type.id)}
                      className={`flex-1 flex items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        formData.study_types.includes(type.id) 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'
                      }`}
                    >
                      {formData.study_types.includes(type.id) ? <CheckSquare size={18} className="ml-2" /> : <Square size={18} className="ml-2" />}
                      <span className="font-black text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={actionLoading} 
                className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center active:scale-95 disabled:opacity-50 mt-8"
              >
                {actionLoading ? <Loader2 className="animate-spin ml-2" size={24} /> : <CheckCircle2 className="ml-2" size={24} />}
                {editingStudent ? 'حفظ التعديلات' : 'اعتماد تسجيل الطالب'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Finance Completion Modal (For Managers) */}
      {isFinanceModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => !actionLoading && setIsFinanceModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-8 animate-in slide-in-from-bottom-8 duration-500 text-right overflow-y-auto max-h-[90vh]">
             
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                <div className="flex items-center">
                   <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl mr-3 shadow-sm border border-emerald-100">
                      <Wallet size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-800">استكمال الملف المالي</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1">الطالب: {financeFormData.student_name}</p>
                   </div>
                </div>
                <button onClick={() => setIsFinanceModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500"><X size={20}/></button>
             </div>

             <form onSubmit={handleFinanceSubmit} className="space-y-6">
                
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                   <div className="flex items-center justify-between mb-4">
                      <label className="text-xs font-black text-amber-800 flex items-center">
                         <Coins size={14} className="ml-2" /> طريقة دفع اشتراك الإجازة
                      </label>
                      <div className="flex bg-white/50 p-1 rounded-xl border border-amber-200">
                         <button type="button" onClick={() => setFinanceFormData({...financeFormData, payment_type: 'full', amount_paid: financeFormData.amount, installments_count: '1'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${financeFormData.payment_type === 'full' ? 'bg-amber-600 text-white' : 'text-amber-400'}`}>دفع كلي</button>
                         <button type="button" onClick={() => setFinanceFormData({...financeFormData, payment_type: 'partial'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${financeFormData.payment_type === 'partial' ? 'bg-amber-600 text-white' : 'text-amber-400'}`}>دفع جزئي</button>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[9px] font-black text-amber-700 uppercase">المبلغ الإجمالي</label>
                         <input type="number" className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm font-black text-amber-900 outline-none" value={financeFormData.amount} onChange={e => setFinanceFormData({...financeFormData, amount: e.target.value})} placeholder="0" />
                      </div>
                      
                      {financeFormData.payment_type === 'partial' && (
                        <>
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-emerald-700 uppercase">المبلغ المدفوع</label>
                              <input type="number" className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm font-black text-emerald-700 outline-none" value={financeFormData.amount_paid} onChange={e => setFinanceFormData({...financeFormData, amount_paid: e.target.value})} placeholder="0" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-amber-700 uppercase">عدد الدفعات</label>
                              <select className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm font-black text-amber-900 outline-none" value={financeFormData.installments_count} onChange={e => setFinanceFormData({...financeFormData, installments_count: e.target.value})}>
                                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} دفعات</option>)}
                              </select>
                           </div>
                           <div className="bg-white/40 p-3 rounded-xl border border-amber-200 flex flex-col justify-center">
                              <span className="text-[8px] font-black text-amber-600 uppercase block">القسط (آلي)</span>
                              <span className="text-sm font-black text-amber-900">{financeFormData.installment_amount} ج.م</span>
                           </div>
                        </>
                      )}
                   </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                   <h4 className="text-xs font-black text-slate-800 mb-4 flex items-center">
                      <DollarSign size={14} className="ml-1 text-rose-500" /> مستحقات المعلم (اختياري)
                   </h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase">إجمالي للمعلم</label>
                         <input type="number" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black outline-none" value={financeFormData.teacher_ratio} onChange={e => setFinanceFormData({...financeFormData, teacher_ratio: e.target.value})} placeholder="0" />
                      </div>
                      
                      {financeFormData.payment_type === 'partial' && (
                         <>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase">مدفوع للمعلم</label>
                              <input type="number" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black outline-none" value={financeFormData.teacher_amount_paid} onChange={e => setFinanceFormData({...financeFormData, teacher_amount_paid: e.target.value})} placeholder="0" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase">عدد دفعات المعلم</label>
                              <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black outline-none" value={financeFormData.teacher_installments_count} onChange={e => setFinanceFormData({...financeFormData, teacher_installments_count: e.target.value})}>
                                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} دفعات</option>)}
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase">قسط المعلم (يدوي)</label>
                              <input type="number" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black outline-none" value={financeFormData.teacher_installment_amount} onChange={e => setFinanceFormData({...financeFormData, teacher_installment_amount: e.target.value})} placeholder="القسط" />
                           </div>
                         </>
                      )}
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">ملاحظات مالية</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={financeFormData.notes} onChange={e => setFinanceFormData({...financeFormData, notes: e.target.value})} placeholder="أي ملاحظات إضافية..." />
                </div>

                <button 
                  type="submit" disabled={actionLoading}
                  className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black shadow-xl flex items-center justify-center hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="animate-spin ml-2" size={20} /> : <CheckCircle2 className="ml-2" size={20} />}
                  حفظ البيانات المالية
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IjazaStudents;
