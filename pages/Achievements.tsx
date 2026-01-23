
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
  const [timeRange, setTimeRange] = useState('month');
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

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week': return 'خلال الأسبوع الحالي';
      case 'month': return 'خلال الشهر الحالي';
      case 'year': return 'خلال العام الحالي';
      default: return 'كافة الأوقات';
    }
  };

  const getStudentAttendanceStats = (studentId: string) => {
    const records = attendance.filter(a => a.student_id === studentId);
    const present = records.filter(a => a.status === 'present').length;
    return { present, total: records.length };
  };

  const printReport = (student: any) => {
    const formattedRange = getTimeRangeLabel();
    const studentLogs = logs.filter(l => l.student_id === student.id);
    const memorizedLogs = studentLogs.filter((l:any) => l.type === 'yesterday_hifz');
    const attStats = getStudentAttendanceStats(student.id);

    const content = `
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: sans-serif; padding: 40px; }
            h1 { color: #d97706; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: right; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>شهادة إنجاز - ${student.name}</h1>
          <p>الفترة: ${formattedRange}</p>
          <table>
            <tr><th>المؤشر</th><th>القيمة</th></tr>
            <tr><td>إجمالي الأجزاء</td><td>${student.total_memorized || 0}</td></tr>
            <tr><td>النقاط</td><td>${student.points || 0}</td></tr>
            <tr><td>أيام الحضور</td><td>${attStats.present}</td></tr>
          </table>
        </body>
      </html>
    `;
    const printWin = window.open('', '_blank');
    printWin?.document.write(content);
    printWin?.document.close();
    printWin?.print();
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest">جاري تحميل البيانات...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <div className="p-3 bg-amber-500 text-white rounded-2xl ml-4 shadow-xl">
               <Trophy size={28} />
            </div>
            لوحة الإنجازات والأوسمة
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-3 mr-16">تتبع التميز وتحفيز الطلاب المتفوقين</p>
        </div>
      </div>

      {/* Filters Bar - updated to rounded-3xl and subtle gradient */}
      <div className="bg-gradient-to-br from-white via-white to-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="بحث عن طالب متفوق..." 
            className="w-full bg-white/50 border border-slate-100 rounded-2xl pr-12 pl-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-amber-500/5 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <select 
              className="bg-white border border-slate-100 rounded-2xl px-6 py-3 text-[11px] font-black outline-none cursor-pointer appearance-none min-w-[150px] shadow-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
           >
              <option value="week">الأسبوع الحالي</option>
              <option value="month">الشهر الحالي</option>
              <option value="all">كل الأوقات</option>
           </select>
        </div>
      </div>

      {/* Results Grid - updated to rounded-3xl and subtle gradient */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white border-4 border-dashed border-slate-100 rounded-3xl py-24 text-center">
          <Trophy size={64} className="mx-auto text-slate-100 mb-6" />
          <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد إنجازات</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-gradient-to-br from-white to-amber-50/20 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center font-black text-2xl text-amber-600 border-2 border-white shadow-inner group-hover:scale-105 transition-transform">
                    {student.name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">{student.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center text-[10px] font-black text-amber-500">
                         <Zap size={12} className="ml-1.5" /> {student.points || 0} نقطة
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">| {student.total_memorized || 0} جزء</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => printReport(student)}
                  className="p-2.5 bg-white text-slate-300 hover:text-blue-600 rounded-xl shadow-sm border border-slate-100 transition-all"
                >
                  <Printer size={18} />
                </button>
              </div>

              <div className="space-y-6 mt-auto">
                 <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-slate-100/50 shadow-inner">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase mb-3">
                       <span>مستوى التقدم</span>
                       <span className="text-amber-600">{Math.round(((student.total_memorized || 0) / 30) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                       <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000" style={{ width: `${((student.total_memorized || 0) / 30) * 100}%` }}></div>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between pt-2">
                    <div className="flex -space-x-2 space-x-reverse">
                       {[1, 2].map(i => (
                          <div key={i} className="w-9 h-9 rounded-full border-4 border-white bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                             <Award size={16} />
                          </div>
                       ))}
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                       إنجاز مميز
                    </div>
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
