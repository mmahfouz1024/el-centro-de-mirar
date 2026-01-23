
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  ShieldCheck, 
  GraduationCap, 
  Trash2, 
  Loader2, 
  Edit2, 
  Settings2, 
  UserCheck, 
  Users as UsersIcon, 
  DollarSign, 
  Crown, 
  Sparkles, 
  LayoutDashboard,
  Headphones,
  BookOpen,
  Search,
  Filter,
  BarChart3,
  ScrollText
} from 'lucide-react';
import { db } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

// إعدادات عرض الصلاحيات في البطاقة الخارجية (للعرض فقط)
const PERMISSION_DISPLAY_CONFIG: Record<string, { label: string; icon: any }> = {
  page_users: { label: 'إدارة النظام', icon: Settings2 },
  page_finance: { label: 'المالية', icon: DollarSign },
  page_students: { label: 'الطلاب', icon: UsersIcon },
  page_classes: { label: 'الحلقات', icon: BookOpen },
  page_reports: { label: 'التقارير', icon: BarChart3 },
  page_teachers: { label: 'المعلمون', icon: UserCheck },
  page_sales: { label: 'المبيعات', icon: Headphones },
};

interface UsersPageProps {
  user?: any;
}

const UsersPage: React.FC<UsersPageProps> = ({ user: currentUser }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); 

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await db.profiles.getAll();
      setUsers(data || []);
    } catch (error) {
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToAddUser = () => {
    navigate('/users/form');
  };

  const goToEditUser = (user: any) => {
    navigate('/users/form', { state: { data: user } });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      await db.profiles.delete(id);
      fetchUsers();
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager': return 'مدير عام';
      case 'supervisor': return 'مشرف';
      case 'teacher': return 'معلم';
      case 'sales': return 'موظف مبيعات';
      default: return 'عضو';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-slate-900 text-amber-400';
      case 'supervisor': return 'bg-blue-600 text-white';
      case 'teacher': return 'bg-emerald-600 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (u.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Settings2 className="ml-3 text-blue-700" size={32} />
            إدارة الصلاحيات والمستخدمين
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">التحكم في ظهور الصفحات والصلاحيات لكل مستخدم</p>
        </div>
        
        <button 
          onClick={goToAddUser}
          className="bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all active:scale-95"
        >
          <UserPlus size={18} className="ml-2" />
          إضافة عضو جديد
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="بحث بالاسم أو اسم المستخدم..." 
            className="w-full bg-slate-50 border-none rounded-xl pr-12 pl-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
           <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
              <Filter size={18} />
           </div>
           <select 
              className="bg-slate-50 border border-slate-100 text-slate-600 text-xs font-black outline-none cursor-pointer w-full md:w-48 py-3.5 px-4 rounded-2xl appearance-none"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
           >
              <option value="all">عرض الجميع</option>
              <option value="manager">المدراء</option>
              <option value="supervisor">المشرفين</option>
              <option value="teacher">المعلمين</option>
              <option value="sales">فريق المبيعات</option>
           </select>
        </div>
        
        <div className="px-6 py-3.5 bg-blue-50 text-blue-600 rounded-2xl text-xs font-black whitespace-nowrap min-w-[100px] text-center">
           {filteredUsers.length} مستخدم
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-black tracking-widest text-xs uppercase">جاري تحميل المستخدمين...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(userItem => {
            const perms = userItem.permissions || {};
            const canManage = true; 

            const activePermissions = Object.entries(perms)
                .filter(([key, val]) => val === true && PERMISSION_DISPLAY_CONFIG[key])
                .map(([key]) => key);

            return (
              <div key={userItem.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 rounded-2xl shadow-sm ${getRoleColor(userItem.role)}`}>
                    {userItem.role === 'manager' ? <Crown size={28} /> : 
                     userItem.role === 'supervisor' ? <ShieldCheck size={28} /> : 
                     userItem.role === 'sales' ? <Headphones size={28} /> :
                     <GraduationCap size={28} />}
                  </div>
                  
                  {canManage && (
                    <div className="flex space-x-1 space-x-reverse">
                      <button onClick={() => goToEditUser(userItem)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(userItem.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center">
                      {userItem.full_name}
                      {userItem.role === 'manager' && <Sparkles size={14} className="mr-2 text-amber-500" />}
                    </h3>
                    <div className="text-slate-400 font-bold text-xs">@{userItem.username}</div>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1 border-t border-slate-50 pt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pb-1">الصفحات المتاحة:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {activePermissions.length > 0 ? (
                        activePermissions.slice(0, 6).map(key => {
                            const conf = PERMISSION_DISPLAY_CONFIG[key];
                            return (
                                <div key={key} className="flex items-center space-x-2 space-x-reverse text-[9px] font-bold text-slate-800">
                                    <conf.icon size={12} className="text-blue-600" />
                                    <span className="truncate">{conf.label}</span>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-[9px] font-bold text-slate-300 col-span-2">صلاحيات محدودة</p>
                    )}
                    {activePermissions.length > 6 && (
                        <div className="text-[9px] font-bold text-slate-400">+ {activePermissions.length - 6} صفحات أخرى</div>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${
                    userItem.role === 'manager' ? 'bg-slate-900 text-amber-400' : 
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {getRoleLabel(userItem.role)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
