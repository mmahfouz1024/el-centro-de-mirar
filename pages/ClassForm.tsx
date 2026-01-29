
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  Clock,
  ArrowLeftRight,
  Timer,
  User
} from 'lucide-react';
import { db } from '../services/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

const DURATION_OPTIONS = ['30', '40', '50', '60', '70', '80', '90', '100', '110', '120'];
const LANGUAGE_OPTIONS = ['اسبانى', 'انجليزى', 'المانى', 'فرنساوى', 'ايطالى'];

const ClassForm: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingHalaqa = location.state?.data;
  const initialDate = location.state?.initialDate || new Date().toISOString().split('T')[0];

  const [teachers, setTeachers] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const isTeacher = user?.role === 'teacher';

  // Helper to get Arabic Day
  const getArabicDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { weekday: 'long' });
  };

  // دالة لحساب وقت الانتهاء تلقائياً
  const calculateEndTime = (startTime: string, duration: string) => {
    if (!startTime || !duration) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + parseInt(duration));
    return date.toTimeString().slice(0, 5);
  };

  const [formData, setFormData] = useState({
    teacher: user?.full_name || '',
    target_student: '',
    duration: '30',
    start_time: '',
    end_time: '',
    class_type: 'اسبانى',
    registration_day: getArabicDay(initialDate),
    registration_date: initialDate,
    branch: 'الرئيسي'
  });

  useEffect(() => {
    const fetchData = async () => {
      const [teachersData, studentsData] = await Promise.all([
        db.profiles.getTeachers(),
        db.students.getAll()
      ]);
      
      setTeachers(teachersData || []);

      let availableStudents = studentsData || [];
      // تم التعديل: المحاضر يرى طلابه المرتبطين به فقط في القائمة
      if (isTeacher && user?.full_name) {
        availableStudents = availableStudents.filter((s: any) => s.teacher_name === user.full_name);
      }
      setStudentsList(availableStudents);

      if (editingHalaqa) {
        setFormData({
          teacher: editingHalaqa.teacher,
          target_student: editingHalaqa.target_student || '',
          duration: editingHalaqa.duration || '30',
          start_time: editingHalaqa.start_time || '',
          end_time: editingHalaqa.end_time || '',
          class_type: editingHalaqa.class_type || 'اسبانى',
          registration_day: editingHalaqa.registration_day || getArabicDay(editingHalaqa.registration_date),
          registration_date: editingHalaqa.registration_date,
          branch: editingHalaqa.branch
        });
      } else {
        if (!isTeacher) {
           if(teachersData && teachersData.length > 0) {
               const defaultTeacher = teachersData[0];
               setFormData(prev => ({ 
                 ...prev, 
                 teacher: defaultTeacher.full_name,
                 class_type: defaultTeacher.specialization || 'اسبانى'
               }));
           }
        } else if (isTeacher) {
            const myProfile = teachersData?.find(t => t.full_name === user.full_name);
            if (myProfile?.specialization) {
              setFormData(prev => ({ ...prev, class_type: myProfile.specialization }));
            }
            // التأكد من تثبيت اسم المحاضر
            setFormData(prev => ({ ...prev, teacher: user.full_name }));
        }
      }
    };
    fetchData();
  }, [editingHalaqa, user, isTeacher]);

  // تحديث وقت الانتهاء تلقائياً عند تغيير وقت البدء أو المدة
  useEffect(() => {
    if (formData.start_time && formData.duration) {
      const newEndTime = calculateEndTime(formData.start_time, formData.duration);
      setFormData(prev => ({ ...prev, end_time: newEndTime }));
    }
  }, [formData.start_time, formData.duration]);

  useEffect(() => {
    if (formData.teacher && teachers.length > 0) {
        const selectedTeacherObj = teachers.find(t => t.full_name === formData.teacher);
        if (selectedTeacherObj?.specialization) {
            setFormData(prev => ({ ...prev, class_type: selectedTeacherObj.specialization }));
        }
    }
  }, [formData.teacher, teachers]);

  const handleFormDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setFormData({
        ...formData, 
        registration_date: newDate,
        registration_day: getArabicDay(newDate)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const generatedName = `محاضرة ${formData.class_type} - ${formData.target_student} (${formData.registration_date})`;

      const payload = {
        name: generatedName,
        teacher: formData.teacher,
        target_student: formData.target_student,
        duration: formData.duration,
        start_time: formData.start_time,
        end_time: formData.end_time,
        class_type: formData.class_type,
        registration_day: formData.registration_day,
        registration_date: formData.registration_date,
        branch: formData.branch,
        capacity: 1, 
        progress: 0,
        period: 'مسائي', 
        days: []
      };

      if (editingHalaqa) {
        await db.classes.update(editingHalaqa.id, payload);
      } else {
        await db.classes.create(payload);
      }
      
      navigate('/classes');
    } catch (error: any) {
      console.error('Save Error:', error);
      alert(`حدث خطأ أثناء الحفظ:\n${error.message || error.toString()}`);
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
          <h2 className="text-2xl font-black text-slate-800">{editingHalaqa ? 'تعديل بيانات المحاضرة' : 'تسجيل محاضرة جديدة'}</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">إدارة سجل المحاضرات اليومية</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 lg:p-12 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">يوم التسجيل</label>
               <input 
                 type="text" 
                 readOnly 
                 className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black outline-none cursor-not-allowed" 
                 value={formData.registration_day} 
               />
            </div>

            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">تاريخ التسجيل</label>
               <input 
                 type="date" 
                 required
                 className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer" 
                 value={formData.registration_date} 
                 onChange={handleFormDateChange}
               />
            </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الطالب</label>
             <select 
                required 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none cursor-pointer" 
                value={formData.target_student} 
                onChange={e => setFormData({...formData, target_student: e.target.value})}
             >
                <option value="">اختر الطالب...</option>
                {studentsList.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
             </select>
             {isTeacher && studentsList.length === 0 && (
                <p className="text-[10px] font-bold text-rose-500 mt-2 mr-2">لا يوجد طلاب مسجلين باسمك حالياً، يرجى مراجعة الإدارة.</p>
             )}
          </div>

          {/* مدة المحاضرة */}
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">مدة المحاضرة (دقيقة)</label>
             <div className="grid grid-cols-5 gap-2">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({...formData, duration: opt})}
                    className={`py-3 rounded-xl text-xs font-black transition-all border ${
                      formData.duration === opt 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' 
                      : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
             </div>
          </div>

          {/* وقت البدء والانتهاء */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                  <Clock size={12} className="ml-1 text-emerald-500" /> وقت البدء
               </label>
               <input 
                 type="time" 
                 required
                 className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer" 
                 value={formData.start_time} 
                 onChange={e => setFormData({...formData, start_time: e.target.value})}
               />
            </div>

            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                  <Timer size={12} className="ml-1 text-rose-500" /> وقت الانتهاء (آلي)
               </label>
               <input 
                 type="time" 
                 readOnly
                 className="w-full bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black outline-none cursor-not-allowed" 
                 value={formData.end_time} 
               />
            </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">لغة المحاضرة</label>
             <select 
                className="w-full bg-slate-100 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none cursor-not-allowed opacity-80" 
                value={formData.class_type} 
                disabled
             >
                {LANGUAGE_OPTIONS.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
             </select>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-50">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المحاضر المسؤول</label>
             <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select 
                    required 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed" 
                    value={formData.teacher} 
                    onChange={e => setFormData({...formData, teacher: e.target.value})}
                    disabled={isTeacher}
                >
                    <option value="">اختر محاضراً...</option>
                    {teachers.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
                </select>
             </div>
             {isTeacher && <p className="text-[9px] font-bold text-slate-400 mt-1 mr-1">يتم تسجيل المحاضرة باسمك تلقائياً كـ محاضر النظام الحالي.</p>}
          </div>

          <button type="submit" disabled={actionLoading} className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black shadow-xl flex items-center justify-center transition-all disabled:opacity-50 mt-4 active:scale-95 text-lg">
            {actionLoading ? <Loader2 className="animate-spin ml-2" size={24} /> : <CheckCircle2 className="ml-2" size={24} />}
            {editingHalaqa ? 'حفظ التعديلات' : 'تسجيل المحاضرة'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
