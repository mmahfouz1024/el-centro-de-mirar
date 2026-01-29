
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
  TrendingUp,
  Coins,
  AlertTriangle
} from 'lucide-react';
import { db } from '../services/supabase';

interface SalesEmployeesProps {
  user?: any;
}

const SalesEmployees: React.FC<SalesEmployeesProps> = ({ user }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    base_salary: '',
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
    setErrorMessage(null);
    setFormData({ 
      full_name: '', 
      private_phone: '', 
      academy_whatsapp: '', 
      vodafone_cash: '', 
      instapay: '',
      base_salary: '0',
      notes: '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: any) => {
    setEditingEmployee(emp);
    setErrorMessage(null);
    setFormData({
      full_name: emp.full_name || '',
      private_phone: emp.private_phone || '',
      academy_whatsapp: emp.academy_whatsapp || '',
      vodafone_cash: emp.vodafone_cash || '',
      instapay: emp.instapay || '',
      base_salary: emp.base_salary?.toString() || '0',
      notes: emp.notes || ''
    });
    setIsModalOpen(true);
  };

  const openStatsModal = (emp: any) => {
    const empExpenses = allExpenses.filter(e => e.assigned_member === emp.full_name);
    const total = empExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalTeacherShare = empExpenses.reduce((sum, item) => sum + (Number(item.teacher_ratio) || 0), 0);
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
    setErrorMessage(null);
    try {
      const payload = { 
        ...formData,
        base_salary: parseFloat(formData.base_salary) || 0
      };
      if (editingEmployee) {
        await db.salesTeam.update(editingEmployee.id, payload);
      } else {
        await db.salesTeam.create(payload);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Save Error Detail:", error);
      // إظهار تفاصيل الخطأ للمستخدم بدلاً من رسالة عامة
      setErrorMessage(error.message || 'حدث خطأ غير متوقع أثناء الاتصال بقاعدة البيانات');
    } finally {
      setActionLoading(false);
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
      e.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <div className="p-3 bg-purple-600 text-white rounded-2xl ml-4 shadow-xl">
               <Headphones size={28} />
            </div>
            فريق خدمة العملاء والمبيعات
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-3 mr-16">إدارة بيانات ومستحقات فريق التواصل</p>
        </div>
        <button onClick={openAddModal} className="bg-purple-600 text-white px-8 py-4 rounded-3xl font-black text-sm flex items-center shadow-xl hover:scale-105 transition-all active:scale-95">
          <Plus size={18} className="ml-2" />
          إضافة موظف جديد
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center">
        <Search className="text-slate-300 ml-4" size={20} />
        <input 
          type="text" 
          placeholder="بحث بالاسم أو رقم الهاتف..." 
          className="w-full bg-transparent text-sm font-bold outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <span className="font-bold tracking-widest text-xs uppercase">جاري تحميل البيانات...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center border-2 border-white shadow-inner text-purple-600 font-black text-2xl group-hover:scale-105 transition-transform">
                    {emp.full_name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">{emp.full_name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                       موظف مبيعات
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(emp)} className="p-2 text-slate-300 hover:text-blue-600 transition-all bg-white rounded-xl shadow-sm"><Edit2 size={14} /></button>
                  <button onClick={() => {if(confirm('حذف الموظف؟')) db.salesTeam.delete(emp.id).then(fetchData);}} className="p-2 text-slate-300 hover:text-rose-500 transition-all bg-white rounded-xl shadow-sm"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-3 flex-1 mb-6">
                 <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 bg-white/60 p-3 rounded-2xl border border-slate-100 group/item">
                    <div className="flex items-center">
                        <Smartphone size={14} className="ml-2 text-blue-500"/> {emp.private_phone || '---'}
                    </div>
                    <button onClick={() => handleCopy(emp.private_phone, `p-${emp.id}`)} className="text-slate-300 hover:text-blue-600">
                        {copiedId === `p-${emp.id}` ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                    </button>
                 </div>

                 <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 bg-emerald-50/30 p-3 rounded-2xl border border-emerald-100 group/item">
                    <div className="flex items-center">
                        <MessageCircle size={14} className="ml-2 text-emerald-500"/> {emp.academy_whatsapp || '---'}
                    </div>
                    <button onClick={() => handleCopy(emp.academy_whatsapp, `w-${emp.id}`)} className="text-emerald-400 hover:text-emerald-600">
                        {copiedId === `w-${emp.id}` ? <CheckCircle2 size={14}/> : <Copy size={14}/>}
                    </button>
                 </div>
                 
                 <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex items-center justify-between mt-4">
                    <div className="flex items-center">
                       <Wallet size={14} className="ml-2 text-amber-600" />
                       <span className="text-[10px] font-black text-amber-800 uppercase tracking-tighter">الراتب الأساسي</span>
                    </div>
                    <span className="text-sm font-black text-amber-600">{emp.base_salary || 0} <span className="text-[10px]">ج.م</span></span>
                 </div>
              </div>

              {user?.role === 'manager' && (
                <button 
                  onClick={() => openStatsModal(emp)}
                  className="w-full flex items-center justify-center py-3.5 bg-slate-900 text-white rounded-2xl transition-all text-[11px] font-black hover:bg-purple-700 shadow-lg"
                >
                  <FileText size={16} className="ml-2" />
                  تحليل الاشتراكات والأرباح
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal (إضافة/تعديل) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => !actionLoading && setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[3.5rem] shadow-2xl p-10 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                    {editingEmployee ? <Edit2 size={24} /> : <Plus size={24} />}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">{editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</h3>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-600 animate-shake">
                   <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                   <div>
                      <p className="text-xs font-black">خطأ من قاعدة البيانات:</p>
                      <p className="text-[10px] font-bold leading-relaxed">{errorMessage}</p>
                   </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الاسم الكامل</label>
                <input 
                  type="text" required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/10"
                  placeholder="مثال: أحمد محمد علي"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم الهاتف الشخصي</label>
                  <input 
                    type="tel" required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none"
                    value={formData.private_phone}
                    onChange={(e) => setFormData({...formData, private_phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">واتساب الأكاديمية</label>
                  <input 
                    type="tel"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none"
                    value={formData.academy_whatsapp}
                    onChange={(e) => setFormData({...formData, academy_whatsapp: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم فودافون كاش</label>
                  <input 
                    type="tel"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none"
                    value={formData.vodafone_cash}
                    onChange={(e) => setFormData({...formData, vodafone_cash: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">حساب انستا باي</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none"
                    value={formData.instapay}
                    onChange={(e) => setFormData({...formData, instapay: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest mr-1 flex items-center">
                   <Coins size={12} className="ml-1" /> الراتب الأساسي (ج.م)
                </label>
                <input 
                  type="number"
                  className="w-full bg-amber-50/30 border border-amber-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/10"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({...formData, base_salary: e.target.value})}
                  placeholder="0"
                />
              </div>

              <button 
                type="submit"
                disabled={actionLoading}
                className="w-full bg-purple-600 text-white py-5 rounded-[1.8rem] font-black text-lg shadow-xl shadow-purple-100 flex items-center justify-center hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="animate-spin ml-3" size={24} /> : <CheckCircle2 size={24} className="ml-3" />}
                {editingEmployee ? 'حفظ التعديلات' : 'تأكيد إضافة الموظف'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal (إحصائيات الموظف) */}
      {isStatsModalOpen && currentStats && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setIsStatsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl p-10 animate-in slide-in-from-bottom-8 duration-500 overflow-y-auto max-h-[90vh]">
             <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                <div>
                   <h3 className="text-2xl font-black text-slate-800">إحصائيات الأداء المالي</h3>
                   <p className="text-sm font-bold text-purple-600 mt-1">الموظف: {currentStats.name}</p>
                </div>
                <button onClick={() => setIsStatsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors"><X size={24}/></button>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 p-5 rounded-[2rem] text-center border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">الاشتراكات</p>
                   <h4 className="text-2xl font-black text-slate-800">{currentStats.count}</h4>
                </div>
                <div className="bg-blue-50 p-5 rounded-[2rem] text-center border border-blue-100">
                   <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">إجمالي التحصيل</p>
                   <h4 className="text-2xl font-black text-blue-700">{currentStats.total}</h4>
                </div>
                <div className="bg-emerald-50 p-5 rounded-[2rem] text-center border border-emerald-100">
                   <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">صافي الأكاديمية</p>
                   <h4 className="text-2xl font-black text-emerald-700">{currentStats.netProfit}</h4>
                </div>
             </div>

             <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">آخر العمليات</h4>
                {currentStats.list.length > 0 ? currentStats.list.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div>
                        <p className="text-sm font-black text-slate-800">{item.student_name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{new Date(item.date).toLocaleDateString('ar-EG')}</p>
                     </div>
                     <div className="text-left">
                        <p className="text-sm font-black text-emerald-600">+{item.amount} ج.م</p>
                        <p className="text-[9px] font-bold text-slate-400">{item.course_type}</p>
                     </div>
                  </div>
                )) : (
                  <div className="py-10 text-center text-slate-300 font-bold">لا توجد عمليات مسجلة لهذا الموظف</div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesEmployees;
