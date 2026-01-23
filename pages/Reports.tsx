
import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Filter, 
  Loader2, 
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Search,
  Zap,
  Target,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart as RePieChart,
  Pie,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Area,
  Legend
} from 'recharts';

// محاكاة بيانات أداء المركز الشاملة
const PERFORMANCE_RADAR_DATA = [
  { subject: 'الحفظ', A: 120, B: 110, fullMark: 150 },
  { subject: 'المراجعة', A: 98, B: 130, fullMark: 150 },
  { subject: 'الحضور', A: 145, B: 130, fullMark: 150 },
  { subject: 'السمت', A: 140, B: 140, fullMark: 150 },
  { subject: 'المشاركة', A: 110, B: 90, fullMark: 150 },
];

const WEEKLY_COMPOSED_DATA = [
  { name: 'الأسبوع 1', hifz: 400, revision: 2400, amt: 2400 },
  { name: 'الأسبوع 2', hifz: 300, revision: 1398, amt: 2210 },
  { name: 'الأسبوع 3', hifz: 200, revision: 9800, amt: 2290 },
  { name: 'الأسبوع 4', hifz: 278, revision: 3908, amt: 2000 },
];

const ATTENDANCE_COMPARISON = [
  { name: 'السبت', current: 40, previous: 24 },
  { name: 'الأحد', current: 30, previous: 13 },
  { name: 'الاثنين', current: 20, previous: 98 },
  { name: 'الثلاثاء', current: 27, previous: 39 },
  { name: 'الأربعاء', current: 18, previous: 48 },
  { name: 'الخميس', current: 23, previous: 38 },
];

const LEVEL_DISTRIBUTION = [
  { name: 'مبتدئ', value: 120, color: '#3b82f6' },
  { name: 'متوسط', value: 240, color: '#f59e0b' },
  { name: 'متقدم', value: 85, color: '#10b981' },
  { name: 'خاتم', value: 37, color: '#8b5cf6' },
];

const Reports: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportType, setReportType] = useState('performance');
  const [dateRange, setDateRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('all');

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
    }, 1200);
  };

  const tableData = useMemo(() => [
    { name: 'حلقة الإمام الشافعي', teacher: 'أحمد المحمد', hifz: '1.2 صفحة/يوم', revision: 'ممتاز', status: 'نشط جداً', growth: '+12%' },
    { name: 'حلقة التميز', teacher: 'ياسر علي', hifz: '1.5 صفحة/يوم', revision: 'جيد جداً', status: 'نشط', growth: '+8%' },
    { name: 'حلقة النور', teacher: 'خالد العتيبي', hifz: '0.8 صفحة/يوم', revision: 'ممتاز', status: 'مستقر', growth: '+2%' },
    { name: 'حلقة الفلاح', teacher: 'سعد الحربي', hifz: '1.1 صفحة/يوم', revision: 'جيد', status: 'يحتاج متابعة', growth: '-3%' },
  ].filter(row => 
    row.name.includes(searchTerm) || row.teacher.includes(searchTerm)
  ), [searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="animate-in fade-in slide-in-from-right duration-500">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            التقارير التحليلية
            <div className="mr-3 px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] rounded-full uppercase tracking-tighter animate-pulse">
              Live
            </div>
          </h2>
          <p className="text-slate-400 text-xs font-bold mt-1">ذكاء الأعمال لدعم اتخاذ القرار في مركز القرآن</p>
        </div>
        
        <div className="flex space-x-2 space-x-reverse">
          <button className="bg-white text-slate-600 p-3 rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
            <Calendar size={20} />
          </button>
          <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all">
            <Download size={18} className="ml-2" />
            تصدير البيانات
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Side Card */}
        <div className="lg:col-span-1 space-y-4 sticky top-24">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-3xl -translate-y-12 translate-x-12 opacity-50"></div>
            
            <h3 className="text-xs font-black text-slate-400 mb-6 flex items-center uppercase tracking-widest relative z-10">
              <Filter size={16} className="ml-2 text-emerald-600" />
              تصفية النتائج
            </h3>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">نوع التقرير</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'progress', label: 'تقدم الحفظ', icon: TrendingUp },
                    { id: 'attendance', label: 'تحليل الحضور', icon: Clock },
                    { id: 'performance', label: 'الأداء الشامل', icon: BarChart3 },
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setReportType(type.id)}
                      className={`w-full flex items-center p-3.5 rounded-2xl text-xs font-bold transition-all border ${
                        reportType === type.id 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                        : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <type.icon size={16} className="ml-2" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المعلم المسؤول</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-50 rounded-2xl px-4 py-4 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                >
                  <option value="all">جميع المعلمين</option>
                  <option value="ahmed">أحمد المحمد</option>
                  <option value="yasser">ياسر علي</option>
                  <option value="khaled">خالد العتيبي</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الفترة الزمنية</label>
                <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-50">
                  {['week', 'month', 'year'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${
                        dateRange === range ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      {range === 'week' ? 'أسبوع' : range === 'month' ? 'شهر' : 'عام'}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center shadow-2xl shadow-slate-200 hover:bg-slate-900 active:scale-95 transition-all mt-4"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="ml-2 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Zap size={18} className="ml-2 text-amber-400" />
                    تحديث التقرير
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from)_0%,_transparent_70%)] from-emerald-500/20"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <div className="p-2 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20">
                  <Sparkles size={16} />
                </div>
                <h4 className="font-black text-xs tracking-wider uppercase">رؤية المساعد</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium mb-4">يعتمد التقرير على تقنيات تحليل البيانات المتقدمة لتحديد الفجوات التعليمية وتوجيه الموارد.</p>
              <div className="flex -space-x-2 space-x-reverse">
                 {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-bold">M{i}</div>)}
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          {!reportGenerated ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] h-full min-h-[600px] flex flex-col items-center justify-center p-12 text-center animate-pulse">
              <div className="bg-slate-50 p-10 rounded-full mb-8">
                <BarChart3 size={64} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-400 mb-4 uppercase tracking-widest">بانتظار البيانات</h3>
              <p className="text-slate-400 text-sm max-w-sm font-medium leading-relaxed">قم بضبط الفلاتر وتوليد التقرير لمشاهدة التحليلات البيانية والمؤشرات التفاعلية.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Report Dashboard Style Container */}
              <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                {/* AI Summary Header */}
                <div className="bg-emerald-50/40 backdrop-blur-sm border border-emerald-100/50 p-6 rounded-[2.5rem] mb-10 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 md:space-x-reverse relative group">
                  <div className="absolute top-4 left-4 opacity-10 group-hover:rotate-12 transition-transform">
                    <Sparkles size={40} className="text-emerald-600" />
                  </div>
                  <div className="p-4 bg-white rounded-2xl shadow-sm text-emerald-600 shrink-0">
                    <Target size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded-md ml-2">Smart Insight</span>
                      <h4 className="text-sm font-black text-emerald-900">ملخص الأداء الذكي لهذا الشهر</h4>
                    </div>
                    <p className="text-xs text-emerald-800/70 font-bold leading-relaxed">
                      سجل المركز قفزة نوعية في "جودة المراجعة" بنسبة 22% بفضل تفعيل نظام التسميع المتبادل. حلقة "الإمام الشافعي" تتصدر مؤشرات الانضباط، بينما نوصي بالتركيز على "حلقة الفلاح" لرفع معدلات الحفظ اليومية.
                    </p>
                  </div>
                </div>

                {/* Key Performance Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {[
                    { label: 'الطلاب النشطون', value: '412', trend: '+12', icon: Users, color: 'emerald' },
                    { label: 'ساعات التسميع', value: '840', trend: '+15%', icon: Activity, color: 'blue' },
                    { label: 'الأجزاء المكتملة', value: '38', trend: '+4', icon: Target, color: 'amber' },
                    { label: 'معدل الرضا', value: '98%', trend: '+0.5%', icon: CheckCircle2, color: 'purple' },
                  ].map((stat, i) => (
                    <div key={i} className="group hover:bg-slate-50 p-6 rounded-[2rem] border border-slate-50 transition-all text-center relative overflow-hidden">
                       <div className={`absolute top-0 right-0 w-1 bg-${stat.color}-500 h-0 group-hover:h-full transition-all duration-300`}></div>
                       <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${stat.color}-50 text-${stat.color}-600`}>
                        <stat.icon size={24} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <h4 className="text-2xl font-black text-slate-800">{stat.value}</h4>
                      <div className="flex items-center justify-center mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit mx-auto px-2 py-0.5 rounded-full">
                        <ArrowUpRight size={10} className="ml-1" />
                        {stat.trend}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Advanced Visuals Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
                  {/* Radar Chart: Holistic Center Health */}
                  <div className="bg-slate-50/30 p-8 rounded-[2.5rem] border border-slate-50 min-w-0">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-sm font-black text-slate-800 flex items-center">
                        <Activity size={18} className="ml-2 text-emerald-500" />
                        بصمة جودة المركز (HQR)
                      </h4>
                      <div className="flex space-x-4 space-x-reverse">
                        <div className="flex items-center text-[10px] font-bold text-slate-400">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 ml-1.5"></div>
                          الحالي
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-slate-400">
                          <div className="w-2 h-2 rounded-full bg-slate-300 ml-1.5"></div>
                          المستهدف
                        </div>
                      </div>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={PERFORMANCE_RADAR_DATA}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                          <Radar name="المركز" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                          <Radar name="المستهدف" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} strokeDasharray="5 5" />
                          <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Composed Chart: Hifz vs Revision Progress */}
                  <div className="bg-slate-50/30 p-8 rounded-[2.5rem] border border-slate-50 min-w-0">
                    <h4 className="text-sm font-black text-slate-800 mb-8 flex items-center">
                      <TrendingUp size={18} className="ml-2 text-blue-500" />
                      تكامل الحفظ والمراجعة (Weekly)
                    </h4>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={WEEKLY_COMPOSED_DATA}>
                          <CartesianGrid stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                          <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', paddingBottom: '20px'}} />
                          <Area type="monotone" dataKey="amt" fill="#eff6ff" stroke="#3b82f6" strokeWidth={0} />
                          <Bar dataKey="hifz" barSize={20} fill="#10b981" radius={[4, 4, 0, 0]} name="كمية الحفظ" />
                          <Line type="monotone" dataKey="revision" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, fill: '#f59e0b'}} name="أداء المراجعة" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis with Search */}
                <div className="mt-12 pt-12 border-t border-slate-50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h4 className="text-lg font-black text-slate-800">تفاصيل أداء المجموعات</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">بيانات تحليلية لكل حلقة بشكل مستقل</p>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="text" 
                        placeholder="ابحث عن حلقة أو معلم..." 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-3 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="overflow-hidden border border-slate-100 rounded-[2rem]">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الحلقة</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المعلم</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">معدل الحفظ</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">النمو</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                          <th className="py-5 px-6"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {tableData.length > 0 ? tableData.map((row, i) => (
                          <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-5 px-6">
                              <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-[10px]">
                                  {row.name[0]}
                                </div>
                                <span className="text-xs font-black text-slate-800">{row.name}</span>
                              </div>
                            </td>
                            <td className="py-5 px-6 text-[11px] font-bold text-slate-500 text-center">{row.teacher}</td>
                            <td className="py-5 px-6 text-[11px] font-black text-emerald-600 text-center">{row.hifz}</td>
                            <td className="py-5 px-6 text-center">
                              <span className={`text-[10px] font-black ${row.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {row.growth}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-center">
                              <span className={`px-3 py-1.5 rounded-full text-[9px] font-black ${
                                row.status === 'نشط جداً' ? 'bg-emerald-50 text-emerald-600' :
                                row.status === 'يحتاج متابعة' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-left">
                              <button className="p-2 text-slate-300 hover:text-emerald-600 transition-colors">
                                <ChevronLeft size={16} />
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-bold">لا توجد نتائج تطابق بحثك</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Insight */}
                <div className="mt-10 p-6 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Zap size={24} className="text-amber-400" />
                    </div>
                    <div>
                      <h5 className="font-black text-sm">تم التحديث منذ لحظات</h5>
                      <p className="text-[10px] text-slate-400 font-medium">البيانات متزامنة تماماً مع سجلات المعلمين اليومية</p>
                    </div>
                  </div>
                  <button className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20">
                    طباعة التقرير الشامل
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
