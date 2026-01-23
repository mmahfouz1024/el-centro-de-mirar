import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCheck, 
  Clock, 
  LogIn, 
  LogOut, 
  Calendar, 
  Search, 
  MapPin, 
  Loader2, 
  Save, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Timer,
  UserPlus,
  ArrowRightLeft,
  Filter,
  Users2,
  Trash2,
  MessageSquare,
  Building2,
  ThumbsUp,
  History,
  Activity,
  X,
  FileText,
  TrendingUp,
  ArrowLeftRight,
  CalendarCheck
} from 'lucide-react';
import { db } from '../services/supabase';
import { TeacherAttendanceRecord } from '../types';

const TeacherAttendance: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, TeacherAttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('الكل');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // حالات نافذة السجل
  const [historyTeacher, setHistoryTeacher] = useState<any>(null);
  const [teacherHistory, setTeacherHistory] = useState<TeacherAttendanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [referenceStartTime, setReferenceStartTime] = useState('16:00'); // وقت الحضور المعتمد

  useEffect(() => {
    fetchInitialData();
  }, [selectedDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [teachersData, centersData, attendanceData] = await Promise.all([
        db.profiles.getTeachers(),
        db.centers.getAll(),
        db.teacherAttendance.getByDate(selectedDate)
      ]);
      
      setTeachers(teachersData);
      setCenters(centersData.filter(c => c.isActive));
      
      const attMap: Record<string, TeacherAttendanceRecord> = {};
      attendanceData.forEach((rec: any) => {
        attMap[rec.teacher_id] = rec;
      });
      setAttendance(attMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (teacherId: string, status: string) => {
    const now = new Date().toLocaleTimeString('ar-EG', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setAttendance(prev => {
      // Added type casting to fix 'check_in' property errors on line 89
      const current = prev[teacherId] || { teacher_id: teacherId, record_date: selectedDate, status: '' as any } as TeacherAttendanceRecord;
      return {
        ...prev,
        [teacherId]: {
          ...current,
          status: status as any,
          check_in: (status === 'present' || status === 'late') && !current.check_in ? now : current.check_in
        }
      };
    });
  };

  const handleTimeChange = (teacherId: string, field: 'check_in' | 'check_out', value: string) => {
    setAttendance(prev => {
      const current = prev[teacherId] || { teacher_id: teacherId, record_date: selectedDate, status: '' as any } as TeacherAttendanceRecord;
      return {
        ...prev,
        [teacherId]: { ...current, [field]: value }
      };
    });
  };

  const handleNoteChange = (teacherId: string, value: string) => {
    setAttendance(prev => {
      const current = prev[teacherId] || { teacher_id: teacherId, record_date: selectedDate, status: '' as any } as TeacherAttendanceRecord;
      return {
        ...prev,
        [teacherId]: { ...current, notes: value }
      };
    });
  };

  const handleSave = async () => {
    // تنظيف البيانات لضمان عدم وجود معرفات ID قديمة أو فارغة تسبب فشل القيد الفريد
    const recordsToSave = (Object.values(attendance) as any[])
      .filter(r => r.status)
      .map(r => {
        const { id, created_at, ...cleanRecord } = r;
        return {
          ...cleanRecord,
          check_in: r.check_in && r.check_in.trim() !== "" ? r.check_in : null,
          check_out: r.check_out && r.check_out.trim() !== "" ? r.check_out : null,
          notes: r.notes && r.notes.trim() !== "" ? r.notes : null
        };
      });

    if (recordsToSave.length === 0) return alert('يرجى رصد حالة معلم واحد على الأقل');

    setIsSaving(true);
    try {
      await db.teacherAttendance.upsert(recordsToSave);
      alert('تم حفظ سجل حضور المعلمين بنجاح');
      fetchInitialData();
    } catch (error: any) {
      console.error('Save Error Details:', error.message);
      alert('فشل حفظ البيانات: يرجى التأكد من تنفيذ أمر SQL لإضافة القيد الفريد في لوحة تحكم Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  const openTeacherHistory = async (teacher: any) => {
    setHistoryTeacher(teacher);
    setLoadingHistory(true);
    try {
      const history = await db.teacherAttendance.getByTeacher(teacher.id);
      setTeacherHistory(history);
    } catch (err) {
      alert('فشل جلب السجل');
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchSearch = (t.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchBranch = filterBranch === 'الكل' || t.branch === filterBranch;
      return matchSearch && matchBranch;
    });
  }, [teachers, searchTerm, filterBranch]);

  const stats = useMemo(() => {
    const vals = Object.values(attendance) as TeacherAttendanceRecord[];
    return {
      present: vals.filter(v => v.status === 'present').length,
      absent: vals.filter(v => v.status === 'absent').length,
      late: vals.filter(v => v.status === 'late').length,
      permission: vals.filter(v => v.status === 'permission').length,
    };
  }, [attendance]);

  // حساب إحصائيات السجل التاريخي للمعلم (معدل)
  const historyStats = useMemo(() => {
    if (!teacherHistory.length) return { lateHours: 0, lateMins: 0, absentDays: 0, permissionDays: 0, lateDays: 0, presentDays: 0 };
    
    let totalLateMins = 0;
    let absent = 0;
    let permission = 0;
    let lateDays = 0;
    let presentDays = 0;

    teacherHistory.forEach(rec => {
      if (rec.status === 'present') presentDays++;
      if (rec.status === 'absent') absent++;
      if (rec.status === 'permission') permission++;
      if (rec.status === 'late') {
        lateDays++;
        presentDays++; // التأخير يعتبر يوم حضور
        if (rec.check_in) {
          const [startH, startM] = referenceStartTime.split(':').map(Number);
          const [checkH, checkM] = rec.check_in.split(':').map(Number);
          const diff = (checkH * 60 + checkM) - (startH * 60 + startM);
          if (diff > 0) totalLateMins += diff;
        }
      }
    });

    return {
      lateHours: Math.floor(totalLateMins / 60),
      lateMins: totalLateMins % 60,
      absentDays: absent,
      permissionDays: permission,
      lateDays: lateDays,
      presentDays: presentDays
    };
  }, [teacherHistory, referenceStartTime]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-100';
      case 'absent': return 'bg-rose-600 border-rose-600 text-white shadow-rose-100';
      case 'late': return 'bg-amber-500 border-amber-500 text-white shadow-amber-100';
      case 'permission': return 'bg-blue-600 border-blue-600 text-white shadow-blue-100';
      default: return 'bg-slate-50 border-slate-200 text-slate-400';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      {/* Header Area */}
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-3">
              <Calendar size={14} className="ml-2 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">رصد الحضور اليومي للمعلمين</span>
            </div>
            <h2 className="text-3xl font-black mb-1">سجل الحضور والانصراف</h2>
            <p className="text-slate-400 text-xs font-bold">إدارة انضباط الطاقم التعليمي لمركز داود</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
             <div className="bg-white/10 p-2 rounded-2xl border border-white/10 flex items-center">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-white font-black text-sm outline-none cursor-pointer"
                />
             </div>
             <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
             >
               {isSaving ? <Loader2 className="animate-spin ml-2" size={18} /> : <Save className="ml-2" size={18} />}
               اعتماد السجل اليومي
             </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'حاضر', value: stats.present, color: 'emerald', icon: UserCheck },
          { label: 'تأخير', value: stats.late, color: 'amber', icon: Timer },
          { label: 'إذن/استئذان', value: stats.permission, color: 'blue', icon: History },
          { label: 'غياب', value: stats.absent, color: 'rose', icon: XCircle },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-4 space-x-reverse">
             <div className={`p-3 rounded-xl bg-${s.color}-50 text-${s.color}-600`}>
                <s.icon size={20} />
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h4 className="text-xl font-black text-slate-800">{s.value}</h4>
             </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="بحث باسم المعلم..." 
            className="w-full bg-slate-50 border border-slate-50 rounded-2xl pr-12 pl-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
           <button 
            onClick={() => setFilterBranch('الكل')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all border ${filterBranch === 'الكل' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
           >الكل</button>
           {centers.map(c => (
             <button 
              key={c.id} 
              onClick={() => setFilterBranch(c.name)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all border ${filterBranch === c.name ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
             >{c.name}</button>
           ))}
        </div>
      </div>

      {/* Teachers List */}
      {loading ? (
        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTeachers.map(teacher => {
            // Added type casting to fix property errors on lines 355, 366, 378
            const record = (attendance[teacher.id] || { status: '' }) as TeacherAttendanceRecord;
            return (
              <div key={teacher.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center gap-8 group hover:border-blue-200 transition-all">
                <div className="flex items-center space-x-4 space-x-reverse w-full lg:w-1/4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden border-2 border-white shadow-inner shrink-0">
                    <img src={teacher.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-800 text-sm">{teacher.full_name}</h4>
                    <div className="flex items-center space-x-2 space-x-reverse mt-1">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">{teacher.branch}</span>
                        <button 
                            onClick={() => openTeacherHistory(teacher)}
                            className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center hover:bg-amber-100 transition-colors"
                        >
                            <History size={10} className="ml-1" /> سجل المعلم
                        </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-1/3">
                  {[
                    { id: 'present', label: 'حاضر' },
                    { id: 'absent', label: 'غياب' },
                    { id: 'late', label: 'تأخير' },
                    { id: 'permission', label: 'إذن' }
                  ].map(stat => (
                    <button
                      key={stat.id}
                      onClick={() => handleStatusChange(teacher.id, stat.id)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black border-2 transition-all active:scale-95 ${record.status === stat.id ? getStatusColor(stat.id) : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                    >
                      {stat.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 w-full lg:w-1/4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center">
                      <LogIn size={10} className="ml-1 text-emerald-500" /> دخول
                    </label>
                    <input 
                      type="time" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                      value={record.check_in || ''}
                      onChange={(e) => handleTimeChange(teacher.id, 'check_in', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center">
                      <LogOut size={10} className="ml-1 text-rose-500" /> انصراف
                    </label>
                    <input 
                      type="time" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                      value={record.check_out || ''}
                      onChange={(e) => handleTimeChange(teacher.id, 'check_out', e.target.value)}
                    />
                  </div>
                </div>

                <div className="w-full lg:flex-1 relative">
                  <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input 
                    type="text" 
                    placeholder="ملاحظات..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-10 pl-4 py-2.5 text-xs font-medium outline-none focus:bg-white"
                    value={record.notes || ''}
                    onChange={(e) => handleNoteChange(teacher.id, e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* مودال سجل المعلم المتقدم */}
      {historyTeacher && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setHistoryTeacher(null)}></div>
          <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                  <img src={historyTeacher.avatar} alt="" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">إحصائيات حضور: {historyTeacher.full_name}</h3>
                  <div className="flex items-center space-x-3 space-x-reverse mt-1">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{historyTeacher.branch}</span>
                    <span className="text-[10px] font-black text-slate-400">@{historyTeacher.username}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setHistoryTeacher(null)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {loadingHistory ? (
                <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={48} /></div>
              ) : (
                <div className="space-y-8">
                  {/* شريط التحكم في وقت الحضور المعتمد */}
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="flex items-center">
                        <div className="p-3 bg-white rounded-xl text-blue-600 ml-3 shadow-sm"><Clock size={20}/></div>
                        <div>
                            <h4 className="text-sm font-black text-slate-800">ضبط وقت الحضور الرسمي</h4>
                            <p className="text-[10px] font-bold text-slate-400">يستخدم لحساب إجمالي ساعات التأخير</p>
                        </div>
                     </div>
                     <input 
                        type="time" 
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-black text-blue-700 outline-none shadow-inner"
                        value={referenceStartTime}
                        onChange={(e) => setReferenceStartTime(e.target.value)}
                     />
                  </div>

                  {/* كروت الإحصائيات الشاملة */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 text-center relative overflow-hidden group">
                        <CalendarCheck className="absolute -left-4 -bottom-4 text-emerald-200 opacity-20" size={80} />
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">أيام الحضور</p>
                        <h4 className="text-3xl font-black text-emerald-900">{historyStats.presentDays} <span className="text-sm">أيام</span></h4>
                     </div>
                     <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 text-center relative overflow-hidden group">
                        <Timer className="absolute -left-4 -bottom-4 text-amber-200 opacity-20" size={80} />
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">إجمالي التأخير</p>
                        <h4 className="text-2xl font-black text-amber-900">{historyStats.lateHours}<span className="text-sm">س</span> {historyStats.lateMins}<span className="text-sm">د</span></h4>
                        <p className="text-[10px] font-bold text-amber-500 mt-2">من خلال {historyStats.lateDays} أيام تأخير</p>
                     </div>
                     <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100 text-center relative overflow-hidden group">
                        <XCircle className="absolute -left-4 -bottom-4 text-rose-200 opacity-20" size={80} />
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">غياب بدون إذن</p>
                        <h4 className="text-3xl font-black text-rose-900">{historyStats.absentDays} <span className="text-sm">أيام</span></h4>
                     </div>
                     <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 text-center relative overflow-hidden group">
                        <ThumbsUp className="absolute -left-4 -bottom-4 text-blue-200 opacity-20" size={80} />
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">غياب بإذن</p>
                        <h4 className="text-3xl font-black text-blue-900">{historyStats.permissionDays} <span className="text-sm">أيام</span></h4>
                     </div>
                  </div>

                  {/* سجل الحركات التفصيلي */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-800 flex items-center px-2">
                        <History size={18} className="ml-2 text-slate-400" />
                        سجل الحركات التاريخي
                    </h4>
                    <div className="overflow-hidden border border-slate-100 rounded-[2rem]">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">التاريخ</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">الحالة</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">دخول / خروج</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {teacherHistory.map((rec, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-black text-slate-700">{rec.record_date}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                                rec.status === 'present' ? 'bg-emerald-50 text-emerald-600' :
                                                rec.status === 'late' ? 'bg-amber-50 text-amber-600' :
                                                rec.status === 'absent' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {rec.status === 'present' ? 'حاضر' :
                                                 rec.status === 'late' ? 'متأخر' :
                                                 rec.status === 'absent' ? 'غائب' : 'إذن'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-500">
                                            {rec.check_in || '--:--'} <ArrowLeftRight size={10} className="inline mx-1 opacity-20" /> {rec.check_out || '--:--'}
                                        </td>
                                        <td className="px-6 py-4 text-[10px] text-slate-400 italic">{rec.notes || '-'}</td>
                                    </tr>
                                ))}
                                {!teacherHistory.length && (
                                    <tr><td colSpan={4} className="py-12 text-center text-slate-300 font-bold">لا توجد سجلات حضور سابقة مسجلة</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setHistoryTeacher(null)}
                  className="bg-slate-900 text-white px-12 py-3 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all"
                >
                  إغلاق السجل
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Action */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-700">
         <div className="bg-slate-900/90 backdrop-blur-xl px-10 py-5 rounded-full shadow-2xl border border-white/10 flex items-center space-x-8 space-x-reverse">
            <div className="flex items-center space-x-4 space-x-reverse text-white">
               <div className="text-center">
                  <span className="text-[8px] font-black text-slate-400 block uppercase">حاضر</span>
                  <span className="text-lg font-black text-emerald-400">{stats.present}</span>
               </div>
               <div className="w-px h-8 bg-white/10"></div>
               <div className="text-center">
                  <span className="text-[8px] font-black text-slate-400 block uppercase">متأخر</span>
                  <span className="text-lg font-black text-amber-400">{stats.late}</span>
               </div>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-white text-slate-900 px-8 py-3 rounded-full font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center"
            >
              {isSaving ? <Loader2 className="animate-spin ml-2" size={18} /> : <CheckCircle2 className="ml-2 text-blue-600" size={18} />}
              حفظ واعتماد السجل
            </button>
         </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;