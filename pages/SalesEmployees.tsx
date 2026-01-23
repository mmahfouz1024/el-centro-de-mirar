
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Headphones, 
  Plus, 
  Search, 
  Loader2, 
  Trash2, 
  Edit2, 
  X, 
  CheckCircle2, 
  Smartphone, 
  MessageCircle, 
  CreditCard,
  Banknote,
  Users,
  Copy,
  Wallet,
  FileText,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { db } from '../services/supabase';

interface SalesEmployeesProps {
  user?: any;
}

const SalesEmployees: React.FC<SalesEmployeesProps> = ({ user }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [allExpenses, setAllExpenses] = useState<any[]>([]); // لتخزين جميع عمليات الدفع
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // حالة النافذة المنبثقة للتفاصيل المالية
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [currentStats, setCurrentStats] = useState<{
    name: string;
    total: number;
    netProfit: number;
    count: number;
    list: any[];
  } | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    private_phone: '',
    academy_whatsapp: '',
    vodafone_cash: '',
    instapay: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesData, expensesData] = await Promise.all([
        db.salesTeam.getAll(),
        db.finance.studentExpenses.getAll()
      ]);
      setEmployees(salesData || []);
      setAllExpenses(expensesData || []);
    } catch (error) {
      console.error('Error fetching sales employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({ 
      full_name: '', 
      private_phone: '', 
      academy_whatsapp: '', 
      vodafone_cash: '', 
      instapay: '',
      notes: '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: any) => {
    setEditingEmployee(emp);
    setFormData({
      full_name: emp.full_name || '',
      private_phone: emp.private_phone || '',
      academy_whatsapp: emp.academy_whatsapp || '',
      vodafone_cash: emp.vodafone_cash || '',
      instapay: emp.instapay || '',
      notes: emp.notes || ''
    });
    setIsModalOpen(true);
  };

  const openStatsModal = (emp: any) => {
    // تصفية الاشتراكات التي تم تحصيلها بواسطة هذا الموظف
    const empExpenses = allExpenses.filter(e => e.assigned_member === emp.full_name);
    
    // إجمالي المحصل
    const total = empExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    
    // إجمالي ما تم دفعه للمعلمين (حساب المعلم)
    const totalTeacherShare = empExpenses.reduce((sum, item) => sum + (Number(item.teacher_ratio) || 0), 0);
    
    // إجمالي المكسب (المحصل - حصة المعلم)
    const netProfit = total - totalTeacherShare;
    
    setCurrentStats({
      name: emp.full_name,
      count: empExpenses.length,
      total: total,
      netProfit: netProfit,
      list: empExpenses
    });
    setIsStatsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { ...formData };

      if (editingEmployee) {
        await db.salesTeam.update(editingEmployee.id, payload);
      } else {
        await db.salesTeam.create(payload);
      }
      
      await fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      alert('حدث خطأ أثناء حفظ البيانات: ' + (error.message || 'يرجى التأكد من تشغيل كود SQL'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await db.salesTeam.delete(id);
      fetchData();
    } catch (error) {
      alert('فشل الحذف');
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.private_phone && e.private_phone.includes(searchTerm)) ||
      (e.academy_whatsapp && e.academy_whatsapp.includes(searchTerm))
    );
  }, [employees, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Headphones className="ml-3 text-purple-600" size={32} />
            فريق خدمة العملاء
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">سجل بيانات التواصل المالي والإداري</p>
        </div>
        <button onClick={openAddModal} className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all">
          <Plus size={18} className="ml-2" />
          إضافة موظف جديد
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center">
        <Search className="text-slate-300 ml-4" size={20} />
        <input 
          type="text" 
          placeholder="بحث بالاسم أو رقم الهاتف..." 
          className="w-full bg-transparent text-sm font-bold outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="mr-4 px-4 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-black">
           العدد: {employees.length}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <span className="font-bold tracking-widest text-xs uppercase">جاري تحميل البيانات...</span>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-24 text-center">
          <Users size={64} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-800 mb-2">لا يوجد موظفين مسجلين</h3>
          <p className="text-slate-400 font-bold text-sm">ابدأ بإضافة أعضاء فريق خدمة العملاء</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col">
              
              {/* Card Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm text-purple-600 font-black text-xl">
                    {emp.full_name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base">{emp.full_name}</h3>
                    <div className="text-slate-400 text-[10px] font-bold mt-0.5">
                       {emp.notes ? emp.notes : 'خدمة عملاء'}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(emp)} className="p-2 text-slate-300 hover:text-blue-600 transition-all bg-slate-50 rounded-xl"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(emp.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all bg-slate-50 rounded-xl"><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2.5 flex-1">
                 {/* Private Phone */}
                 <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 group/item">
                    <div className="flex items-center">
                        <Smartphone size={14} className="ml-2 text-blue-500"/> 
                        <span className="text-[10px] text-slate-400 ml-2 w-20">رقم الهاتف:</span>
                        {emp.private_phone || '---'}
                    </div>
                    {emp.private_phone && (
                        <button onClick={() => handleCopy(emp.private_phone, `p-${emp.id}`)} className="text-slate-300 hover:text-blue-600">
                            {copiedId === `p-${emp.id}` ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                        </button>
                    )}
                 </div>

                 {/* Academy Whatsapp */}
                 <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 group/item">
                    <div className="flex items-center">
                        <MessageCircle size={14} className="ml-2 text-emerald-500"/> 
                        <span className="text-[10px] text-slate-400 ml-2 w-20">واتساب العمل:</span>
                        {emp.academy_whatsapp || '---'}
                    </div>
                    {emp.academy_whatsapp && (
                        <button onClick={() => handleCopy(emp.academy_whatsapp, `w-${emp.id}`)} className="text-emerald-300 hover:text-emerald-600">
                            {copiedId === `w-${emp.id}` ? <CheckCircle2 size={14}/> : <Copy size={14}/>}
                        </button>
                    )}
                 </div>

                 {/* Vodafone Cash */}
                 <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-rose-50/50 p-3 rounded-xl border border-rose-100 group/item">
                    <div className="flex items-center">
                        <Banknote size={14} className="ml-2 text-rose-500"/> 
                        <span className="text-[10px] text-slate-400 ml-2 w-20">فودافون كاش:</span>
                        {emp.vodafone_cash || '---'}
                    </div>
                    {emp.vodafone_cash && (
                        <button onClick={() => handleCopy(emp.vodafone_cash, `v-${emp.id}`)} className="text-rose-300 hover:text-rose-600">
                            {copiedId === `v-${emp.id}` ? <CheckCircle2 size={14}/> : <Copy size={14}/>}
                        </button>
                    )}
                 </div>

                 {/* Instapay */}
                 <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-purple-50/50 p-3 rounded-xl border border-purple-100 group/item">
                    <div className="flex items-center">
                        <Wallet size={14} className="ml-2 text-purple-500"/> 
                        <span className="text-[10px] text-slate-400 ml-2 w-20">انستا باى:</span>
                        {emp.instapay || '---'}
                    </div>
                    {emp.instapay && (
                        <button onClick={() => handleCopy(emp.instapay, `i-${emp.id}`)} className="text-purple-300 hover:text-purple-600">
                            {copiedId === `i-${emp.id}` ? <CheckCircle2 size={14}/> : <Copy size={14}/>}
                        </button>
                    )}
                 </div>
              </div>

              {/* Subscription Details Button - Manager Only */}
              {user?.role === 'manager' && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <button 
                    onClick={() => openStatsModal(emp)}
                    className="w-full flex items-center justify-center p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-all text-xs font-black"
                  >
                    <FileText size={16} className="ml-2" />
                    تفاصيل الاشتراكات
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !actionLoading && setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-8 animate-in zoom-in duration-300 text-right overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-800">{editingEmployee ? 'تعديل بيانات الموظف' : 'تسجيل موظف جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الاسم</label>
                <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/10" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mr-1 flex items-center">
                        <Smartphone size={12} className="ml-1"/> رقم الهاتف الخاص
                    </label>
                    <input type="tel" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" value={formData.private_phone} onChange={e => setFormData({...formData, private_phone: e.target.value})} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mr-1 flex items-center">
                        <MessageCircle size={12} className="ml-1"/> رقم واتساب الأكاديمية
                    </label>
                    <input type="tel" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10" value={formData.academy_whatsapp} onChange={e => setFormData({...formData, academy_whatsapp: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest mr-1 flex items-center">
                        <Banknote size={12} className="ml-1"/> رقم فودافون كاش
                    </label>
                    <input type="tel" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-rose-500/10" value={formData.vodafone_cash} onChange={e => setFormData({...formData, vodafone_cash: e.target.value})} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest mr-1 flex items-center">
                        <Wallet size={12} className="ml-1"/> رقم انستاباى
                    </label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/10" value={formData.instapay} onChange={e => setFormData({...formData, instapay: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">ملاحظات إضافية</label>
                <textarea className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/10 h-24 resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="أي ملاحظات عن الموظف..." />
              </div>

              <button 
                type="submit" 
                disabled={actionLoading} 
                className="w-full bg-purple-600 text-white py-5 rounded-[2.5rem] font-black shadow-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 mt-4"
              >
                {actionLoading ? <Loader2 className="animate-spin ml-2" size={24} /> : <CheckCircle2 className="ml-2" size={24} />}
                {editingEmployee ? 'حفظ التعديلات' : 'تسجيل الموظف'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Details Modal */}
      {isStatsModalOpen && currentStats && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsStatsModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl p-8 animate-in zoom-in duration-300 text-right overflow-y-auto max-h-[90vh]">
            
            <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center">
                  <DollarSign className="ml-2 text-emerald-600" />
                  تفاصيل الاشتراكات
                </h3>
                <p className="text-slate-400 text-xs font-bold mt-1">الموظف: {currentStats.name}</p>
              </div>
              <button onClick={() => setIsStatsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الطلاب</p>
                <h4 className="text-3xl font-black text-slate-600">{currentStats.count}</h4>
              </div>
              <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 text-center">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">إجمالي المبلغ المحصل</p>
                <h4 className="text-3xl font-black text-emerald-700">{currentStats.total.toLocaleString()} <span className="text-xs">ج.م</span></h4>
              </div>
              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 text-center relative overflow-hidden">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">إجمالي المكسب</p>
                <h4 className="text-3xl font-black text-blue-700">{currentStats.netProfit.toLocaleString()} <span className="text-xs">ج.م</span></h4>
                <div className="absolute top-0 right-0 w-full h-full bg-white opacity-10 blur-xl"></div>
                <TrendingUp className="absolute bottom-2 left-4 text-blue-300 opacity-30" size={60} />
              </div>
            </div>

            <div className="overflow-hidden border border-slate-100 rounded-[2rem]">
              <table className="w-full text-right">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase">اسم الطالب</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase">تاريخ الدفع</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">المبلغ</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">حساب المعلم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentStats.list.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-bold text-xs">لا توجد عمليات دفع مسجلة لهذا الموظف</td>
                    </tr>
                  ) : (
                    currentStats.list.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-4 text-xs font-black text-slate-700">{item.student_name}</td>
                        <td className="p-4 text-[10px] font-bold text-slate-500">{new Date(item.date).toLocaleDateString('ar-EG')}</td>
                        <td className="p-4 text-sm font-black text-emerald-600 text-center">{Number(item.amount).toLocaleString()} ج.م</td>
                        <td className="p-4 text-xs font-bold text-rose-500 text-center">{Number(item.teacher_ratio || 0).toLocaleString()} ج.م</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsStatsModalOpen(false)} 
                className="bg-slate-100 text-slate-500 px-8 py-3 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesEmployees;
