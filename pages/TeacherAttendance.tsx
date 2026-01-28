
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
  const [attendance, setAttendance] = useState<Record<string, TeacherAttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('الكل');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchInitialData();
  }, [selectedDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [teachersData, attendanceData] = await Promise.all([
        db.profiles.getTeachers(),
        db.teacherAttendance.getByDate(selectedDate)
      ]);
      setTeachers(teachersData || []);
      
      const attMap: Record<string, TeacherAttendanceRecord> = {};
      attendanceData?.forEach((record: TeacherAttendanceRecord) => {
        attMap[record.teacher_id] = record;
      });
      setAttendance(attMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (teacherId: string, status: 'present' | 'absent' | 'late' | 'permission') => {
    const now = new Date().toLocaleTimeString('ar-EG', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setAttendance(prev => ({
      ...prev,
      [teacherId]: {
        teacher_id: teacherId,
        record_date: selectedDate,
        status,
        check_in: status === 'present' || status === 'late' ? (prev[teacherId]?.check_in || now) : '',
        check_out: prev[teacherId]?.check_out || '',
        notes: prev[teacherId]?.notes || ''
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const records = Object.values(attendance);
      if (records.length === 0) {
        alert('لا توجد سجلات لحفظها');
        return;
      }
      await db.teacherAttendance.upsert(records);
      alert('تم حفظ سجلات الحضور بنجاح');
    } catch (err) {
      alert('فشل في حفظ السجلات');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => 
      (t.full_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterBranch === 'الكل' || t.branch === filterBranch)
    );
  }, [teachers, searchTerm, filterBranch]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest text-slate-800">جاري مزامنة سجلات الحضور...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      {/* Header Area */}
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-3">
              <Calendar size={14} className="ml-2 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">رصد الحضور اليومي للمحاضرين</span>
            </div>
            <h2 className="text-3xl font-black mb-1">سجل الحضور والانصراف</h2>
            <p className="text-slate-400 text-xs font-bold">إدارة انضباط الطاقم التعليمي لمركز EL CENTRO DE MIRAR</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
             <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10 flex items-center gap-3">
                <CalendarCheck size={18} className="text-blue-400" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none outline-none font-black text-sm text-white cursor-pointer"
                />
             </div>
             <button 
               onClick={handleSave}
               disabled={isSaving}
               className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-500 transition-all flex items-center"
             >
               {isSaving ? <Loader2 className="animate-spin ml-2" size={18} /> : <Save className="ml-2" size={18} />}
               حفظ السجل
             </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-6">
         <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="بحث باسم المحاضر..." 
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl pr-12 pl-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map(teacher => {
          const record = attendance[teacher.id] || { status: '' };
          return (
            <div key={teacher.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
               <div className="flex items-center space-x-4 space-x-reverse mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-white shadow-inner flex items-center justify-center font-black text-xl text-blue-700 overflow-hidden">
                     {teacher.avatar ? <img src={teacher.avatar} className="w-full h-full object-cover" /> : teacher.full_name[0]}
                  </div>
                  <div>
                     <h3 className="font-black text-slate-800 text-sm">{teacher.full_name}</h3>
                     <p className="text-[10px] font-bold text-slate-400 mt-0.5">{teacher.specialization} • {teacher.branch}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2 mb-4">
                  <button onClick={() => handleStatusChange(teacher.id, 'present')} className={`py-2 rounded-xl text-[10px] font-black border-2 transition-all ${record.status === 'present' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-50 text-slate-400 hover:border-emerald-100'}`}>حاضر</button>
                  <button onClick={() => handleStatusChange(teacher.id, 'absent')} className={`py-2 rounded-xl text-[10px] font-black border-2 transition-all ${record.status === 'absent' ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-white border-slate-50 text-slate-400 hover:border-rose-100'}`}>غائب</button>
                  <button onClick={() => handleStatusChange(teacher.id, 'late')} className={`py-2 rounded-xl text-[10px] font-black border-2 transition-all ${record.status === 'late' ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-white border-slate-50 text-slate-400 hover:border-amber-100'}`}>متأخر</button>
                  <button onClick={() => handleStatusChange(teacher.id, 'permission')} className={`py-2 rounded-xl text-[10px] font-black border-2 transition-all ${record.status === 'permission' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-50 text-slate-400 hover:border-blue-100'}`}>إجازة</button>
               </div>

               {(record.status === 'present' || record.status === 'late') && (
                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                       <Clock size={12} className="text-blue-500" />
                       <span className="text-[10px] font-black text-slate-600">وقت الحضور</span>
                    </div>
                    <span className="text-xs font-black text-blue-700">{record.check_in}</span>
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherAttendance;
