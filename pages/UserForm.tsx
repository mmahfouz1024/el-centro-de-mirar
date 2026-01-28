
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  LayoutDashboard, 
  Lock,
  Settings,
  Database,
  Calculator,
  Headphones,
  RefreshCw,
  Users,
  UserCheck,
  BookOpen,
  CalendarClock,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  BarChart3,
  Trophy,
  ScrollText,
  CheckSquare,
  Square,
  ChevronRight,
  User
} from 'lucide-react';
import { db } from '../services/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

const DEFAULT_PERMISSIONS = {
  page_users: false, page_settings: false, page_database: false,
  page_finance: false, page_students: false, page_teachers: false,
  page_classes: false, page_schedule: true, page_attendance: false,
  page_class_eval: false, page_eval_list: false, page_renewal: false,
  page_reports: false, page_achievements: false, page_sales: false,
};

const PERMISSION_GROUPS = [
  {
    title: 'الإدارة والضبط',
    color: 'text-slate-600',
    items: [
      { key: 'page_users', label: 'صلاحيات النظام', icon: Lock },
      { key: 'page_settings', label: 'إعدادات النظام', icon: Settings },
      { key: 'page_database', label: 'قاعدة البيانات', icon: Database },
    ]
  },
  {
    title: 'الشؤون المالية والمبيعات',
    color: 'text-emerald-600',
    items: [
      { key: 'page_finance', label: 'الحسابات والمالية', icon: Calculator },
      { key: 'page_sales', label: 'فريق المبيعات', icon: Headphones },
      { key: 'page_renewal', label: 'متابعة التجديدات', icon: RefreshCw },
    ]
  },
  {
    title: 'الشؤون الأكاديمية',
    color: 'text-blue-600',
    items: [
      { key: 'page_students', label: 'الطلاب', icon: Users },
      { key: 'page_teachers', label: 'المعلمون', icon: UserCheck },
      { key: 'page_classes', label: 'سجل الحلقات', icon: BookOpen },
      { key: 'page_schedule', label: 'جدول المواعيد', icon: CalendarClock },
    ]
  },
  {
    title: 'المتابعة والتقارير',
    color: 'text-purple-600',
    items: [
      { key: 'page_attendance', label: 'حضور المعلمين', icon: CalendarCheck },
      { key: 'page_class_eval', label: 'تقييم الحصة', icon: ClipboardCheck },
      { key: 'page_eval_list', label: 'سجل التقييمات', icon: ClipboardList },
      { key: 'page_reports', label: 'التقارير التحليلية', icon: BarChart3 },
      { key: 'page_achievements', label: 'لوحة الإنجازات', icon: Trophy },
    ]
  }
];

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingUser = location.state?.data;

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'teacher',
    permissions: { ...DEFAULT_PERMISSIONS },
  });

  useEffect(() => {
    if (editingUser) {
      const userPermissions = typeof editingUser.permissions === 'object' && editingUser.permissions !== null
      ? { ...DEFAULT_PERMISSIONS, ...editingUser.permissions }
      : { ...DEFAULT_PERMISSIONS };

      setFormData({
        username: editingUser.username || '',
        password: editingUser.password || '',
        full_name: editingUser.full_name || '',
        role: editingUser.role || 'teacher',
        permissions: userPermissions,
      });
    }
  }, [editingUser]);

  const handleRoleChange = (newRole: string) => {
    let newPermissions = { ...DEFAULT_PERMISSIONS };
    if (newRole === 'manager') {
      Object.keys(newPermissions).forEach(key => { (newPermissions as any)[key] = true; });
    } else if (newRole === 'supervisor') {
      newPermissions = { 
        ...DEFAULT_PERMISSIONS,
        page_students: true, page_teachers: true, page_classes: true, page_schedule: true,
        page_attendance: true, page_class_eval: true, page_eval_list: true, page_achievements: true
      };
    } else {
      newPermissions = { ...DEFAULT_PERMISSIONS, page_classes: true, page_schedule: true };
    }
    setFormData({ ...formData, role: newRole, permissions: newPermissions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg(null);

    try {
      if (!formData.username || !formData.password || !formData.full_name) {
        throw new Error("يرجى ملء جميع الحقول الأساسية");
      }

      const payload = { 
        username: formData.username.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        role: formData.role,
        permissions: formData.permissions,
        managed_supervisors: []
      };

      if (editingUser) {
        await db.profiles.update(editingUser.id, payload);
      } else {
        await db.profiles.create(payload);
      }
      navigate('/users');
    } catch (error: any) {
      console.error('Submit error:', error);
      setErrorMsg(error.message || 'فشل في حفظ البيانات.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex items-center space-x-4 space-x-reverse mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800">{editingUser ? 'تعديل بيانات المستخدم' : 'مستخدم جديد'}</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">إدارة الصلاحيات والبيانات الأساسية</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start text-rose-600 animate-pulse">
          <AlertTriangle size={18} className="ml-3 mt-0.5" />
          <p className="text-xs font-bold">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-4 space-y-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit">
          <div className="flex items-center space-x-2 space-x-reverse mb-4 border-b border-slate-50 pb-4">
             <User size={20} className="text-blue-600" />
             <h3 className="font-black text-slate-800">المعلومات الأساسية</h3>
          </div>
          
          <div className="space-y-1.5 text-right">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الاسم الكامل</label>
            <input 
              type="text" required
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم المستخدم</label>
            <input 
              type="text" required
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase()})}
            />
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الرتبة الوظيفية</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none cursor-pointer"
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="teacher">معلم</option>
              <option value="supervisor">مشرف</option>
              <option value="manager">مدير عام</option>
              <option value="sales">موظف مبيعات</option>
            </select>
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">كلمة المرور</label>
            <input 
              type="text" required
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-8 space-y-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
             <div className="flex items-center space-x-2 space-x-reverse">
                <LayoutDashboard size={20} className="text-amber-600" />
                <h3 className="font-black text-slate-800">صلاحيات الوصول</h3>
             </div>
             <p className="text-[10px] text-slate-400 font-bold">حدد الصفحات التي يمكن للعضو رؤيتها</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PERMISSION_GROUPS.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-3">
                <h5 className={`text-[10px] font-black uppercase tracking-wider border-b pb-2 ${group.color} border-slate-200 opacity-80`}>
                  {group.title}
                </h5>
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const isChecked = !!(formData.permissions as any)[item.key];
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setFormData({
                          ...formData, 
                          permissions: { ...formData.permissions, [item.key]: !isChecked }
                        })}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                          isChecked ? 'bg-slate-50 border-blue-200 shadow-sm' : 'bg-transparent border-slate-100 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon size={16} className={`ml-3 ${isChecked ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className={`block text-[10px] font-black ${isChecked ? 'text-slate-800' : 'text-slate-500'}`}>{item.label}</span>
                        </div>
                        {isChecked ? <CheckSquare className="text-blue-600" size={18} /> : <Square className="text-slate-300" size={18} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button 
              type="submit"
              disabled={actionLoading}
              className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
            >
              {actionLoading ? <Loader2 className="animate-spin ml-2" size={20} /> : <CheckCircle className="ml-2" size={18} />}
              {editingUser ? 'حفظ وتحديث الصلاحيات' : 'تأكيد وإضافة العضو'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
