
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Check, 
  X, 
  Clock, 
  ChevronLeft,
  CalendarDays,
  Search,
  Loader2,
  Trophy,
  BookOpen,
  ArrowRightLeft,
  CheckCircle2,
  Save,
  CheckSquare,
  GraduationCap,
  ListChecks,
  Activity,
  Wallet,
  User,
  Zap
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../services/supabase';

interface TeacherDashboardProps {
  user?: any;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const isManager = user?.role === 'manager';

  const shortcuts = [
    { label: 'مستحقاتي', icon: Wallet, path: '/my-earnings', color: 'emerald' },
    { label: 'سجل المحاضرات', icon: BookOpen, path: '/classes', color: 'blue' },
    { label: 'قائمة طلابي', icon: Users, path: '/students', color: 'purple' },
    { label: 'ملفي الشخصي', icon: User, path: '/profile', color: 'amber' },
  ];

  useEffect(() => {
    loadInitialData();
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
        loadClassData(selectedClass);
    }
  }, [selectedClass]);

  const loadInitialData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      
      let uniqueClasses: any[] = [];

      if (isManager) {
        uniqueClasses = await db.classes.getAll();
      } else {
        const profile = await db.profiles.getById(user.id);
        const assignedNames = profile?.assigned_halagas || [];
        
        const [byName, byList] = await Promise.all([
          db.classes.getByTeacher(user.full_name),
          assignedNames.length > 0 ? db.classes.getByNames(assignedNames) : Promise.resolve([])
        ]);

        const combined = [...byName, ...byList];
        const uniqueClassesMap = new Map();
        combined.forEach(c => uniqueClassesMap.set(c.id, c));
        uniqueClasses = Array.from(uniqueClassesMap.values());
      }
      
      setTeacherClasses(uniqueClasses);
      
      if (uniqueClasses.length > 0) {
        setSelectedClass(uniqueClasses[0].name);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setLoading(false);
    }
  };

  const loadClassData = async (className: string) => {
      try {
        setLoading(true);
        const [studentsData, todayAttendance] = await Promise.all([
          db.students.getByHalaqa(className),
          db.attendance.getTodayRecords(className)
        ]);
        
        setStudents(studentsData);
        setAttendance(todayAttendance || {});
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  const statsSummary = useMemo(() => {
    const present = Object.values(attendance).filter(v => v === 'present').length;
    const absent = Object.values(attendance).filter(v => v === 'absent').length;
    const completionRate = students.length > 0 ? Math.round((present / students.length) * 100) : 0;
    return { present, absent, completionRate };
  }, [students, attendance]);

  const handleAttendance = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: prev[studentId] === status ? '' : status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) return;
    if (Object.keys(attendance).length === 0) {
      alert('يرجى رصد حالة طالب واحد على الأقل قبل الحفظ');
      return;
    }

    setIsSaving(true);
    try {
      await db.attendance.saveRecords(selectedClass, attendance);
      alert('تم حفظ سجل حضور اليوم بنجاح');
    } catch (error) {
      alert('فشل في حفظ البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter(s => s.name.includes(searchTerm));

  const getStatusButtonClass = (status: string, current: string) => {
      const base = "flex-1 py-2 rounded-lg text-[10px] font-black transition-all border-2 ";
      if (status === current) {
          switch(status) {
              case 'present': return base + "bg-emerald-600 text-white border-emerald-600";
              case 'absent': return base + "bg-rose-600 text-white border-rose-600";
              case 'excused': return base + "bg-blue-600 text-white border-blue-600";
              case 'late': return base + "bg-amber-500 text-white border-amber-500";
          }
      }
      return base + "bg-white text-slate-400 border-slate-100 hover:border-slate-300";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      
      {/* Header & Class Selector */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-black mb-1">لوحة المحاضر</h2>
                    <p className="text-emerald-200 text-sm font-medium">مرحباً بك، {user?.full_name}</p>
                </div>
                <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/20">
                    <GraduationCap size={32} className="text-emerald-300" />
                </div>
            </div>

            {teacherClasses.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white/10 p-2 rounded-[2rem] border border-white/10 backdrop-blur-md">
                    <div className="relative w-full md:w-64">
                        <select 
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full bg-emerald-900/50 text-white border border-emerald-700/50 rounded-2xl px-5 py-3 text-sm font-bold outline-none cursor-pointer appearance-none"
                        >
                            {teacherClasses.map(c => <option key={c.id} value={c.name} className="text-slate-900">{c.name}</option>)}
                        </select>
                        <ArrowRightLeft size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                    
                    <div className="flex-1 w-full flex justify-between items-center px-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-200 uppercase">الطلاب</span>
                            <span className="text-xl font-black">{students.length}</span>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-200 uppercase">الحضور</span>
                            <span className="text-xl font-black">{statsSummary.present}</span>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-200 uppercase">النسبة</span>
                            <span className="text-xl font-black">{statsSummary.completionRate}%</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-emerald-200 font-bold">لا توجد محاضرات مسندة إليك حالياً</p>
                </div>
            )}
        </div>
      </div>

      {/* Quick Access Shortcuts */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 space-x-reverse px-2">
           <Zap size={16} className="text-amber-500" />
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">الوصول السريع</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shortcuts.map((s, i) => (
                <Link 
                    key={i} 
                    to={s.path}
                    className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-emerald-200 hover:-translate-y-1 transition-all"
                >
                    <div className={`p-3 rounded-2xl bg-${s.color}-50 text-${s.color}-600 mb-3 group-hover:scale-110 transition-transform`}>
                        <s.icon size={22} />
                    </div>
                    <span className="text-xs font-black text-slate-700">{s.label}</span>
                </Link>
            ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
           <Loader2 className="animate-spin mx-auto mb-2" size={40} />
           <p className="text-xs font-bold uppercase tracking-widest">جاري تحضير المحاضرة...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
           <Users size={48} className="mx-auto text-slate-300 mb-4" />
           <p className="text-slate-400 font-bold">هذه المحاضرة لا تحتوي على طلاب بعد</p>
        </div>
      ) : (
        <>
            {/* Quick Actions Search */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center relative">
                <Search className="absolute right-6 text-slate-300" size={20} />
                <input 
                    type="text" 
                    placeholder="بحث عن طالب في القائمة..." 
                    className="w-full bg-slate-50 border-none rounded-xl py-3 pr-12 pl-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStudents.map(student => (
                    <div 
                        key={student.id} 
                        onClick={() => navigate(`/student-tracking/${student.id}`)}
                        className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="flex items-center space-x-4 space-x-reverse mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border-2 border-white shadow-inner overflow-hidden">
                                {student.avatar ? <img src={student.avatar} alt="" className="w-full h-full object-cover"/> : <span className="text-xl font-black text-slate-300">{student.name[0]}</span>}
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 text-sm line-clamp-1">{student.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">{student.level}</span>
                                    <div className="flex items-center text-[9px] font-bold text-amber-500">
                                        <Trophy size={10} className="ml-1" /> {student.points || 0}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleAttendance(student.id, 'present')} className={getStatusButtonClass('present', attendance[student.id])}>حاضر</button>
                            <button onClick={() => handleAttendance(student.id, 'absent')} className={getStatusButtonClass('absent', attendance[student.id])}>غائب</button>
                            <button onClick={() => handleAttendance(student.id, 'late')} className={getStatusButtonClass('late', attendance[student.id])}>متأخر</button>
                        </div>

                        <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                            <span>اضغط لفتح السجل</span>
                            <ChevronLeft size={16} />
                        </div>
                    </div>
                ))}
            </div>
        </>
      )}

      {/* Floating Save Button */}
      {Object.keys(attendance).length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10">
              <button 
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="bg-slate-900 text-white px-10 py-4 rounded-full font-black text-sm shadow-2xl flex items-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                  {isSaving ? <Loader2 className="animate-spin ml-2" size={20} /> : <Save className="ml-2" size={20} />}
                  حفظ سجل الحضور ({statsSummary.present})
              </button>
          </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
