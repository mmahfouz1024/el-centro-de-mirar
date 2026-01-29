
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
  
  // تصميم ديناميكي يعتمد على ألوان البراند
  let activeStyle = "bg-gradient-to-r from-amber-600 to-amber-400 text-white shadow-lg shadow-amber-900/40";
  if (role === 'manager') activeStyle = "bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-lg shadow-blue-900/40";

  return (
    <Link 
      to={item.path || '#'}
      onClick={onClick}
      className={`relative flex items-center space-x-3 space-x-reverse p-4 rounded-2xl transition-all duration-500 group overflow-hidden ${
        active 
          ? `${activeStyle} font-black scale-[1.02] translate-x-[-8px]` 
          : `text-slate-400 font-bold hover:bg-white/5 hover:text-white`
      }`}
    >
      <div className={`transition-all duration-500 ${active ? 'scale-110 rotate-0' : 'group-hover:scale-125 group-hover:rotate-12'}`}>
         <Icon size={20} />
      </div>
      <span className="text-[13px] relative z-10">{item.label}</span>
      
      {active && (
        <div className="mr-auto">
          <Sparkles size={14} className="animate-pulse text-white/50" />
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
    
    // تم التعديل هنا: السماح للمحاضر برؤية طلابه بتسمية مخصصة
    if (perms.page_students || role === 'manager' || role === 'teacher') {
      items.push({ 
        icon: Users, 
        label: role === 'teacher' ? 'طلابي' : 'الطلاب', 
        path: '/students' 
      });
    }
    
    if (perms.page_finance || role === 'manager') items.push({ icon: Calculator, label: 'الحسابات والمالية', path: '/accounts' });
    
    if (perms.page_renewal || role === 'manager') items.push({ icon: RefreshCw, label: 'متابعة التجديدات', path: '/renewal-followup' });
    
    if (perms.page_attendance) items.push({ icon: CalendarCheck, label: 'حضور المحاضرين', path: '/teacher-attendance' });
    if (perms.page_class_eval) items.push({ icon: ClipboardCheck, label: 'تقييم الحصة', path: '/class-evaluation' });
    if (perms.page_eval_list) items.push({ icon: ClipboardList, label: 'سجل التقييمات', path: '/evaluations-list' });
    if (perms.page_achievements) items.push({ icon: Trophy, label: 'لوحة الإنجازات', path: '/achievements' });

    if (perms.page_teachers || role === 'manager') items.push({ icon: UserCheck, label: 'المحاضرون', path: '/teachers' });
    if (perms.page_sales || role === 'manager') items.push({ icon: Headphones, label: 'فريق المبيعات', path: '/sales-employees' });
    if (perms.page_classes || role === 'manager') items.push({ icon: BookOpen, label: 'إدارة المحاضرات', path: '/classes' });
    if (perms.page_reports || role === 'manager') items.push({ icon: TrendingUp, label: 'التقارير التحليلية', path: '/reports' });
    if (perms.page_database || role === 'manager') items.push({ icon: Database, label: 'قاعدة البيانات', path: '/database' });
    if (perms.page_users || role === 'manager') items.push({ icon: UserCog, label: 'صلاحيات النظام', path: '/users' });
    if (perms.page_settings || role === 'manager') items.push({ icon: Settings, label: 'إعدادات النظام', path: '/settings' });

    items.push({ icon: Settings, label: 'الملف الشخصي', path: '/profile' });
    return items;
  })();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-['Tajawal']" dir="rtl">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar الفاخرة المحدثة */}
      <aside className={`fixed inset-y-0 right-0 z-[70] w-72 bg-premium-dark transition-all duration-700 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static shadow-[10px_0_60px_rgba(0,0,0,0.1)] flex flex-col`}>
        <div className="h-36 flex flex-col items-center justify-center relative overflow-hidden border-b border-white/5">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px]"></div>
           <div className="relative z-10 flex flex-col items-center">
              <div className="p-1 bg-gradient-to-tr from-amber-500 to-yellow-200 rounded-full shadow-2xl animate-float">
                <div className="bg-slate-900 rounded-full p-1">
                   <Logo size={70} />
                </div>
              </div>
              <h1 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mt-3 drop-shadow-lg">MIRAR CENTER</h1>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar space-y-2">
            <div className="flex items-center space-x-2 space-x-reverse px-4 mb-6 opacity-30">
               <Command size={14} className="text-white" />
               <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">التحكم المركزي</p>
            </div>
            <nav className="space-y-1.5">
              {menuItems.map((item) => (
                <SidebarItem key={item.label} item={item} active={item.path === location.pathname} role={role} onClick={() => setIsSidebarOpen(false)} />
              ))}
            </nav>
        </div>

        <div className="p-6">
           <div className="bg-white/5 p-4 rounded-[2rem] border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform">
                 {user?.full_name?.[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-black text-white truncate">{user?.full_name}</p>
                 <p className="text-[9px] font-bold text-amber-500/70 uppercase tracking-widest">{role}</p>
              </div>
              <button onClick={onLogout} className="p-2.5 text-slate-500 hover:text-rose-500 rounded-xl transition-all hover:bg-rose-500/10">
                 <LogOut size={20} />
              </button>
           </div>
        </div>
      </aside>

      {/* محتوى الصفحة الرئيسي بتصميم عصري */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#f1f5f9]">
        <header className="h-24 px-10 flex items-center justify-between sticky top-0 z-40 bg-[#f1f5f9]/80 backdrop-blur-xl border-b border-slate-200/50">
           <div className="flex items-center gap-6">
              <button className="lg:hidden p-3 bg-white text-slate-600 shadow-md rounded-2xl border border-slate-100" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <div className="animate-in fade-in slide-in-from-right duration-1000">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
                   <div className="w-2 h-8 bg-amber-500 rounded-full ml-3 hidden md:block"></div>
                   لوحة الإدارة الذكية
                 </h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">EL CENTRO DE MIRAR • ENTERPRISE v2.5</p>
              </div>
           </div>

           <div className="flex items-center space-x-5 space-x-reverse">
              <div className="hidden xl:flex items-center bg-white px-6 py-3.5 rounded-[1.5rem] shadow-sm border border-slate-200 focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-500/40 transition-all w-96 group">
                 <Search size={18} className="text-slate-400 ml-3 group-focus-within:text-amber-500 transition-colors" />
                 <input type="text" placeholder="بحث ذكي في السجلات..." className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full placeholder:text-slate-300" />
              </div>
              
              <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-500 hover:text-amber-600 border border-slate-200 shadow-sm transition-all relative hover:scale-110 active:scale-95">
                 <Bell size={24} />
                 <span className="absolute top-4 right-4 w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
              </button>
              
              <div className="p-1 bg-gradient-to-tr from-amber-600 to-yellow-400 rounded-2xl shadow-xl shadow-amber-500/20">
                 <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-3">
                    <Sparkles className="text-amber-500 animate-pulse" size={18} />
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">Premium Access</span>
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
           {/* زخرفة خلفية خفيفة */}
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           
           <div className="max-w-[1600px] mx-auto pb-20 relative z-10">
              {children}
           </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
