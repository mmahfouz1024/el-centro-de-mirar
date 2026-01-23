
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
} from 'lucide-react';
import { db } from '../services/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

const DURATION_OPTIONS = ['30', '35', '40', '45', '50', '60'];
const CLASS_TYPES = [
  'تحفيظ وتجويد',
  'متون',
  'تعليم اللغة العربية لغير الناطقين بها'
];

const ClassForm: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingHalaqa = location.state?.data;
  const initialDate = location.state?.initialDate || new Date().toISOString().split('T')[0];

  const [teachers, setTeachers] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Helper to get Arabic Day
  const getArabicDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { weekday: 'long' });
  };

  const [formData, setFormData] = useState({
    teacher: user?.full_name || '',
    target_student: '',
    duration: '30',
    class_type: 'تحفيظ وتجويد',
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
      if (user && user.role === 'teacher') {
        availableStudents = availableStudents.filter((s: any) => s.teacher_name === user.full_name);
      }
      setStudentsList(availableStudents);

      if (editingHalaqa) {
        setFormData({
          teacher: editingHalaqa.teacher,
          target_student: editingHalaqa.target_student || '',
          duration: editingHalaqa.duration || '30',
          class_type: editingHalaqa.class_type || 'تحفيظ وتجويد',
          registration_day: editingHalaqa.registration_day || getArabicDay(editingHalaqa.registration_date),
          registration_date: editingHalaqa.registration_date,
          branch: editingHalaqa.branch
        });
      } else {
        // Set default teacher if creating new and user is manager
        if (!user || user.role !== 'teacher') {
           if(teachersData && teachersData.length > 0) {
               setFormData(prev => ({ ...prev, teacher: teachersData[0].full_name }));
           }
        }
      }
    };
    fetchData();
  }, [editingHalaqa, user]);

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
      const generatedName = `${formData.class_type} - ${formData.target_student} (${formData.registration_date})`;

      const payload = {
        name: generatedName,
        teacher: formData.teacher,
        target_student: formData.target_student,
        duration: formData.duration,
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
          <h2 className="text-2xl font-black text-slate-800">{editingHalaqa ? 'تعديل بيانات الحلقة' : 'تسجيل حلقة جديدة'}</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">إدارة سجل الحصص اليومية</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 lg:p-12 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. يوم التسجيل (محسوب) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">يوم تسجيل الحلقة</label>
               <input 
                 type="text" 
                 readOnly 
                 className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black outline-none cursor-not-allowed" 
                 value={formData.registration_day} 
               />
            </div>

            {/* 2. تاريخ التسجيل (قابل للتعديل) */}
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

          {/* 3. الطالب */}
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
             {user?.role === 'teacher' && studentsList.length === 0 && (
                <p className="text-[10px] text-rose-500 font-bold mt-1">لا يوجد طلاب مسجلين باسمك حالياً.</p>
             )}
          </div>

          {/* 4. مدة الحلقة */}
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">مدة الحلقة (دقيقة)</label>
             <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({...formData, duration: opt})}
                    className={`py-3 rounded-xl text-xs font-black transition-all border ${
                      formData.duration === opt 
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md' 
                      : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
             </div>
          </div>

          {/* 5. نوع الحلقة */}
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">نوع الحلقة</label>
             <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none cursor-pointer" 
                value={formData.class_type} 
                onChange={e => setFormData({...formData, class_type: e.target.value})}
             >
                {CLASS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
             </select>
          </div>

          {/* حقل المعلم */}
          <div className="space-y-1.5 pt-2 border-t border-slate-50">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المعلم المسؤول</label>
             <select 
                required 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none disabled:opacity-60" 
                value={formData.teacher} 
                onChange={e => setFormData({...formData, teacher: e.target.value})}
                disabled={user?.role === 'teacher'}
             >
                <option value="">اختر معلماً...</option>
                {teachers.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
             </select>
          </div>

          <button type="submit" disabled={actionLoading} className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black shadow-xl flex items-center justify-center transition-all disabled:opacity-50 mt-4 active:scale-95">
            {actionLoading ? <Loader2 className="animate-spin ml-2" size={20} /> : <CheckCircle2 className="ml-2" size={20} />}
            {editingHalaqa ? 'حفظ التعديلات' : 'تسجيل الحلقة'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
