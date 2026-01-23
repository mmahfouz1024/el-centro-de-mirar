
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Users, 
  BookOpen, 
  Award, 
  Crown, 
  Target, 
  Zap, 
  Loader2, 
  Building2, 
  ChevronLeft, 
  Activity, 
  Clock, 
  MessageSquare, 
  Eye, 
  FileText, 
  Layers, 
  Filter, 
  Sparkles,
  Search,
  Printer,
  X,
  ClipboardList
} from 'lucide-react';
import { db } from '../services/supabase';

const Achievements: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fix for line 32: Define timeRange state
  const [timeRange, setTimeRange] = useState('month');
  
  // Fix for line 33: Define customRange state
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, logsData, attendanceData] = await Promise.all([
        db.students.getAll(),
        db.logs.getAll(),
        db.attendance.getAll()
      ]);
      setStudents(studentsData || []);
      setLogs(logsData || []);
      setAttendance(attendanceData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fix for line 34: Define getTimeRangeLabel helper
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week': return 'خلال الأسبوع الحالي';
      case 'month': return 'خلال الشهر الحالي';
      case 'year': return 'خلال العام الحالي';
      default: return 'كافة الأوقات';
    }
  };

  // Fix for line 37: Define getStudentAttendanceStats helper
  const getStudentAttendanceStats = (studentId: string) => {
    const records = attendance.filter(a => a.student_id === studentId);
    const present = records.filter(a => a.status === 'present').length;
    const absent = records.filter(a => a.status === 'absent').length;
    return { present, absent, total: records.length };
  };

  // Fix for line 38: Define getExpectedAttendanceDays helper
  const getExpectedAttendanceDays = (student: any) => {
    // Defaulting to 12 if not specified, or using student property
    return student.required_sessions_count || 12;
  };

  const printReport = (student: any) => {
    // Fix: These variables are now correctly accessed from component state/helpers
    const formattedRange = timeRange === 'custom' 
        ? `من ${customRange.start} إلى ${customRange.end}`
        : getTimeRangeLabel();

    const studentLogs = logs.filter(l => l.student_id === student.id);
    const memorizedLogs = studentLogs.filter((l:any) => l.type === 'yesterday_hifz');
    const attStats = getStudentAttendanceStats(student.id);
    const expectedDays = getExpectedAttendanceDays(student);

    const content = `
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: 'Tajawal', sans-serif; padding: 20px; color: #000; background: #fff; line-height: 1.4; }
            .report-title { color: red; font-size: 24px; font-weight: 900; text-align: center; margin-bottom: 5px; }
            .period-title { color: red; font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 15px; }
            .section-header { font-weight: 900; font-size: 18px; margin: 20px 0 10px 0; text-align: center; background: #f0f0f0; padding: 5px; border: 1px solid black; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 20px; }
            th, td { border: 1px solid black; padding: 10px; text-align: center; vertical-align: middle; white-space: pre-wrap; }
            th { font-size: 14px; font-weight: 900; background: #f9fafb; }
            td { font-size: 12px; font-weight: 700; word-wrap: break-word; }
            .header-cell { width: 150px; font-weight: 900; background: #f3f4f6; }
          </style>
        </head>
        <body>
          <div class="report-title">تقرير إنجاز</div>
          <div class="period-title">الفترة الزمنية: ${formattedRange}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="font-size: 18px; font-weight: 900;">El Centro de Mirar</div>
            <div style="font-weight: 900; font-size: 18px;">الطالب: ${student.name}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th class="header-cell">المؤشر</th>
                <th>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="header-cell">إجمالي الحفظ (أجزاء)</td>
                <td>${student.total_memorized || 0} أجزاء</td>
              </tr>
              <tr>
                <td class="header-cell">النقاط التراكمية</td>
                <td>${student.points || 0} نقطة</td>
              </tr>
              <tr>
                <td class="header-cell">الحضور المحقق</td>
                <td>${attStats.present} أيام (من أصل ${expectedDays} متوقع)</td>
              </tr>
            </tbody>
          </table>
          <div class="section-header">سجل الحفظ الأخير</div>
          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المقرر</th>
                <th>التقدير</th>
                <th>النقاط</th>
              </tr>
            </thead>
            <tbody>
              ${memorizedLogs.slice(0, 10).map((l: any) => `
                <tr>
                  <td>${l.date_hijri}</td>
                  <td>سورة ${l.surah_name} (${l.ayah_from}-${l.ayah_to})</td>
                  <td>${l.status || '---'}</td>
                  <td>${l.points_awarded || 0}</td>
                </tr>
              `).join('')}
              ${memorizedLogs.length === 0 ? '<tr><td colspan="4">لا توجد سجلات حفظ متاحة</td></tr>' : ''}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(content);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
      }, 500);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest">جاري تحميل بيانات الإنجاز...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Trophy className="ml-3 text-amber-500" size={32} />
            لوحة الإنجازات والأوسمة
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">تتبع التميز وتحفيز الطلاب المتفوقين</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="بحث عن طالب متفوق..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <select 
              className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 text-xs font-black outline-none cursor-pointer appearance-none min-w-[150px]"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
           >
              <option value="week">الأسبوع الحالي</option>
              <option value="month">الشهر الحالي</option>
              <option value="all">كل الأوقات</option>
           </select>
        </div>
      </div>

      {/* Results Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-24 text-center">
          <Trophy size={64} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد إنجازات مسجلة</h3>
          <p className="text-slate-400 font-bold text-sm">لم يتم العثور على طلاب يطابقون بحثك.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center font-black text-xl text-amber-600 border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                    {student.name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base">{student.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center text-[10px] font-black text-amber-500">
                         <Zap size={10} className="ml-1" /> {student.points || 0} نقطة
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">| {student.total_memorized || 0} جزء</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => printReport(student)}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="طباعة تقرير الإنجاز"
                >
                  <Printer size={18} />
                </button>
              </div>

              <div className="space-y-4">
                 <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase mb-2">
                       <span>التقدم في الحفظ</span>
                       <span>{Math.round(((student.total_memorized || 0) / 30) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-slate-100">
                       <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${((student.total_memorized || 0) / 30) * 100}%` }}></div>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between pt-2">
                    <div className="flex -space-x-2 space-x-reverse">
                       {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm" title="وسام تميز">
                             <Award size={12} />
                          </div>
                       ))}
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">طالب متميز</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Achievements;
