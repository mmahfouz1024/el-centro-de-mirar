
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
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      alert('حدث خطأ');
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
            فريق خدمة العملاء
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-3 mr-16">سجل بيانات التواصل المالي والإداري</p>
        </div>
        <button onClick={openAddModal} className="bg-purple-600 text-white px-8 py-4 rounded-3xl font-black text-sm flex items-center shadow-xl hover:scale-105 transition-all">
          <Plus size={18} className="ml-2" />
          إضافة موظف
        </button>
      </div>

      {/* Search - updated rounded-3xl */}
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

      {/* Grid - updated to rounded-3xl and subtle gradient */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <span className="font-bold tracking-widest text-xs uppercase">جاري التحميل...</span>
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
                       خدمة عملاء
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(emp)} className="p-2 text-slate-300 hover:text-blue-600 transition-all bg-white rounded-xl shadow-sm"><Edit2 size={14} /></button>
                  <button onClick={() => {if(confirm('حذف؟')) db.salesTeam.delete(emp.id).then(fetchData);}} className="p-2 text-slate-300 hover:text-rose-500 transition-all bg-white rounded-xl shadow-sm"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-3 flex-1 mb-8">
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
              </div>

              {user?.role === 'manager' && (
                <button 
                  onClick={() => openStatsModal(emp)}
                  className="w-full flex items-center justify-center py-3.5 bg-slate-900 text-white rounded-2xl transition-all text-[11px] font-black hover:bg-purple-700 shadow-lg"
                >
                  <FileText size={16} className="ml-2" />
                  تحليل الاشتراكات
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesEmployees;
