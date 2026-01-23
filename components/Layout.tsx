
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  UserCheck, 
  Settings, 
  UserCog, 
  TrendingUp, 
  Calculator, 
  Database, 
  Trophy, 
  CalendarCheck, 
  LogOut, 
  Search, 
  Bell, 
  Menu,
  ClipboardCheck,
  ClipboardList,
  RefreshCw,
  Headphones,
  Wallet,
  CalendarClock,
  HandCoins,
  Sparkles,
  Command
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

interface MenuItem {
  icon: any;
  label: string;
  path?: string;
}

const SidebarItem: React.FC<{ item: MenuItem, active: boolean, role: string, onClick?: () => void }> = ({ item, active, role, onClick }) => {
  const Icon = item.icon;
  
  // تصميم ديناميكي مستوحى من اللوجو (ألوان ذهبية وفيروزية)
  let activeStyle = "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30";
  if (role === 'manager') activeStyle = "bg-gradient-to-r from-slate-900 to-slate-800 text-amber-400 shadow-lg shadow-slate-900/30";
  if (role === 'supervisor') activeStyle = "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30";

  return (
    <Link 
      to={item.path || '#'}
      onClick={onClick}
      className={`relative flex items-center space-x-3 space-x-reverse p-3.5 rounded-2xl transition-all duration-300 group overflow-hidden ${
        active 
          ? `${activeStyle} font-black translate-x-[-5px]` 
          : `text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-900`
      }`}
    >
      {/* أيقونة متحركة */}
      <div className={`transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-125 group-hover:rotate-6'}`}>
         <Icon size={20} className={active ? "animate-pulse" : ""} />
      </div>
      <span className="text-[13px] relative z-10">{item.label}</span>
      
      {active && (
        <div className="mr-auto opacity-80">
          <Sparkles size={14} className="animate-spin-slow text-white/50" />
        </div>
      )}
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode, user?: any, onLogout?: () => void }> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const role = user?.role || 'teacher';
  const perms = user?.permissions || {};

  const menuItems: MenuItem[] = (() => {
    const items: MenuItem[] = [];
    if (role === 'teacher') items.push({ icon: LayoutDashboard, label: 'لوحة المحاضر', path: '/teacher-dashboard' });
    else if (role === 'manager') items.push({ icon: LayoutDashboard, label: 'الرؤية العامة', path: '/manager-dashboard' });
    else items.push({ icon: LayoutDashboard, label: 'لوحة الإشراف', path: '/' });

    if (role === 'teacher') items.push({ icon: Wallet, label: 'مستحقاتي', path: '/my-earnings' });
    if (role === 'manager') items.push({ icon: HandCoins, label: 'مستحقات المحاضرين', path: '/staff-earnings' });
    
    if (perms.page_schedule !== false) items.push({ icon: CalendarClock, label: 'جدول المواعيد', path: '/schedule' });
    if (perms.page_students) items.push({ icon: Users, label: 'الطلاب', path: '/students' });
    if (perms.page_finance) items.push({ icon: Calculator, label: 'الحسابات والمالية', path: '/accounts' });
    if (perms.page_renewal) items.push({ icon: RefreshCw, label: 'متابعة التجديدات', path: '/renewal-followup' });
    if (perms.page_attendance) items.push({ icon: CalendarCheck, label: 'حضور المحاضرين', path: '/teacher-attendance' });
    if (perms.page_class_eval) items.push({ icon: ClipboardCheck, label: 'تقييم الحصة', path: '/class-evaluation' });
    if (perms.page_eval_list) items.push({ icon: ClipboardList, label: 'سجل التقييمات', path: '/evaluations-list' });
    if (perms.page_achievements) items.push({ icon: Trophy, label: 'لوحة الإنجازات', path: '/achievements' });
    if (perms.page_teachers) items.push({ icon: UserCheck, label: 'المحاضرون', path: '/teachers' });
    if (perms.page_sales) items.push({ icon: Headphones, label: 'فريق المبيعات', path: '/sales-employees' });
    if (perms.page_classes) items.push({ icon: BookOpen, label: 'إدارة الحلقات', path: '/classes' });
    if (perms.page_reports) items.push({ icon: TrendingUp, label: 'التقارير التحليلية', path: '/reports' });
    if (perms.page_database) items.push({ icon: Database, label: 'قاعدة البيانات', path: '/database' });
    if (perms.page_users || role === 'manager') items.push({ icon: UserCog, label: 'صلاحيات النظام', path: '/users' });
    if (perms.page_settings) items.push({ icon: Settings, label: 'إعدادات النظام', path: '/settings' });

    items.push({ icon: Settings, label: 'الملف الشخصي', path: '/profile' });
    return items;
  })();

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex font-['Tajawal']" dir="rtl">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar الفاخرة */}
      <aside className={`fixed inset-y-0 right-0 z-[70] w-72 bg-white/80 backdrop-blur-xl transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static shadow-[5px_0_30px_rgba(0,0,0,0.03)] border-l border-white/50 flex flex-col`}>
        <div className="h-32 flex items-center justify-center relative overflow-hidden">
           <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute bottom-[-50%] right-[-50%] w-full h-full bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
           
           <div className="relative z-10 flex flex-col items-center">
              <div className="p-1.5 bg-gradient-to-tr from-emerald-500 to-amber-500 rounded-full shadow-lg hover:rotate-[360deg] transition-transform duration-[2s]">
                <div className="bg-white rounded-full p-1">
                   <Logo size={60} />
                </div>
              </div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight mt-2 text-gradient-gold">El Centro de Mirar</h1>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar space-y-8">
          <div>
            <div className="flex items-center space-x-2 space-x-reverse px-4 mb-4">
               <Command size={14} className="text-slate-400" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">قائمة التحكم</p>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <SidebarItem key={item.label} item={item} active={item.path === location.pathname} role={role} onClick={() => setIsSidebarOpen(false)} />
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-t from-slate-50 to-transparent">
           <div className="glass-card p-4 rounded-3xl shadow-sm flex items-center gap-3 group hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-800 font-black text-lg border border-white shadow-sm group-hover:scale-110 transition-transform">
                 {user?.full_name?.[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-black text-slate-800 truncate">{user?.full_name}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{role}</p>
              </div>
              <button onClick={onLogout} className="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all hover:rotate-90">
                 <LogOut size={18} />
              </button>
           </div>
        </div>
      </aside>

      {/* محتوى الصفحة الرئيسي */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <header className="h-24 px-8 flex items-center justify-between sticky top-0 z-40 bg-[#f0f4f8]/80 backdrop-blur-xl">
           <div className="flex items-center gap-4">
              <button className="lg:hidden p-3 bg-white text-slate-600 shadow-sm rounded-2xl border border-slate-100" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <div className="hidden sm:block animate-in fade-in slide-in-from-right-4 duration-700">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">مرحباً بك في بوابة الإدارة</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    نظام متصل
                 </p>
              </div>
           </div>

           <div className="flex items-center space-x-4 space-x-reverse">
              <div className="hidden md:flex items-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-white/60 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500/40 transition-all w-80 group hover:shadow-md">
                 <Search size={18} className="text-slate-400 ml-3 group-focus-within:text-emerald-500 transition-colors group-hover:scale-110" />
                 <input type="text" placeholder="بحث ذكي في النظام..." className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full placeholder:text-slate-300" />
              </div>
              
              <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-500 hover:text-emerald-600 border border-white/60 shadow-sm transition-all relative group hover:-translate-y-1">
                 <Bell size={22} className="group-hover:rotate-12 transition-transform" />
                 <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-ping"></span>
                 <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="p-1 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-2xl shadow-lg shadow-emerald-500/20 animate-float">
                 <div className="bg-white rounded-xl p-1 px-3 flex items-center gap-2">
                    <Sparkles className="text-amber-500 animate-spin-slow" size={16} />
                    <span className="text-[10px] font-black text-slate-700 uppercase">AI Active</span>
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
           <div className="max-w-7xl mx-auto pb-12">
              {children}
           </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
