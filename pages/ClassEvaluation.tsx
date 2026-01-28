
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck, 
  User, 
  Wifi, 
  Camera, 
  BrainCircuit, 
  Users, 
  Loader2,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  MessageSquare,
  Star,
  ChevronLeft,
  X
} from 'lucide-react';
import { db } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const ClassEvaluation: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [teachers, setTeachers] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    teacher_name: '',
    student_name: '',
    evaluator_name: user?.full_name || '',
    internet_quality: 10,
    camera_usage: 10,
    focus_level: 10,
    management_skills: 10,
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [teachersData, studentsData] = await Promise.all([
        db.profiles.getTeachers(),
        db.students.getAll()
      ]);
      setTeachers(teachersData || []);
      setAllStudents(studentsData || []);
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
    } finally {
      setLoading(false);
    }
  };

  // فلترة الطلاب بناءً على المحاضر المختار
  const filteredStudents = useMemo(() => {
    if (!formData.teacher_name) return [];
    return allStudents.filter(s => s.teacher_name === formData.teacher_name);
  }, [formData.teacher_name, allStudents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacher_name || !formData.student_name) {
      alert('يرجى اختيار المحاضر والطالب أولاً');
      return;
    }
    
    setActionLoading(true);
    try {
      // نستخدم اسم الطالب كاسم للحصة في التقييم
      await db.classEvaluations.create({
        ...formData,
        class_name: `تقييم حصة: ${formData.student_name}`
      });
      alert('تم اعتماد تقرير الجودة بنجاح');
      navigate('/evaluations-list');
    } catch (error) {
      alert('حدث خطأ أثناء حفظ التقييم');
    } finally {
      setActionLoading(false);
    }
  };

  const RatingSlider = ({ label, icon: Icon, value, field, color }: any) => (
    <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4 hover:border-blue-200 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl bg-white shadow-sm ${color}`}>
            <Icon size={20} />
          </div>
          <span className="text-sm font-black text-slate-700">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
           <span className={`text-xl font-black ${color}`}>{value}</span>
           <span className="text-[10px] font-bold text-slate-400 uppercase">/ 10</span>
        </div>
      </div>
      <input 
        type="range" min="1" max="10" 
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        value={value}
        onChange={(e) => setFormData({...formData, [field]: parseInt(e.target.value)})}
      />
      <div className="flex justify-between px-1">
        <span className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">ضعيف جداً</span>
        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">ممتاز ومثالي</span>
      </div>
    </div>
  );

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest text-slate-800">جاري فتح نموذج الجودة...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      {/* Header Card */}
      <div className="bg-premium-dark p-10 rounded-huge text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center px-4 py-1.5 bg-white/10 rounded-full border border-white/20 mb-4 backdrop-blur-md">
              <ShieldCheck size={16} className="ml-2 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">قسم الرقابة وضبط الجودة</span>
            </div>
            <h2 className="text-4xl font-black mb-2">تقييم الأداء الميداني</h2>
            <p className="text-slate-400 font-medium text-sm">مراجعة المعايير التقنية والتعليمية خلال البث المباشر للمحاضرة</p>
          </div>
          <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 shadow-inner">
            <ClipboardCheck size={48} className="text-blue-400" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 lg:p-14 rounded-huge border border-slate-100 shadow-sm space-y-12">
        
        {/* Step 1: Selection */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-lg">1</div>
             <h3 className="text-lg font-black text-slate-800">تحديد أطراف المحاضرة</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2">المحاضر المُراد تقييمه</label>
              <div className="relative">
                <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] pr-14 pl-5 py-5 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/5 appearance-none cursor-pointer transition-all"
                  value={formData.teacher_name}
                  onChange={(e) => setFormData({...formData, teacher_name: e.target.value, student_name: ''})}
                >
                  <option value="">-- اختر المحاضر --</option>
                  {teachers.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2">الطالب المستهدف</label>
              <div className="relative">
                <GraduationCap className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <select 
                  required
                  disabled={!formData.teacher_name}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] pr-14 pl-5 py-5 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/5 appearance-none cursor-pointer transition-all disabled:opacity-50"
                  value={formData.student_name}
                  onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                >
                  <option value="">{formData.teacher_name ? '-- اختر الطالب --' : 'يرجى اختيار المحاضر أولاً'}</option>
                  {filteredStudents.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              {formData.teacher_name && filteredStudents.length === 0 && (
                <p className="text-[10px] font-bold text-rose-500 mt-2 mr-2">لا يوجد طلاب مسجلين لهذا المحاضر حالياً.</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Quality Metrics */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-lg">2</div>
             <h3 className="text-lg font-black text-slate-800">مؤشرات جودة الأداء</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RatingSlider 
              label="جودة الاتصال والإنترنت" 
              icon={Wifi} 
              value={formData.internet_quality} 
              field="internet_quality"
              color="text-blue-600"
            />
            <RatingSlider 
              label="الالتزام بفتح الكاميرا" 
              icon={Camera} 
              value={formData.camera_usage} 
              field="camera_usage"
              color="text-purple-600"
            />
            <RatingSlider 
              label="مستوى تركيز المحاضر" 
              icon={BrainCircuit} 
              value={formData.focus_level} 
              field="focus_level"
              color="text-amber-600"
            />
            <RatingSlider 
              label="مهارات إدارة الوقت والحصة" 
              icon={Users} 
              value={formData.management_skills} 
              field="management_skills"
              color="text-emerald-600"
            />
          </div>
        </div>

        {/* Step 3: Notes */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-lg">3</div>
             <h3 className="text-lg font-black text-slate-800">التعليقات الختامية</h3>
          </div>
          <div className="relative">
            <MessageSquare className="absolute right-5 top-5 text-slate-300" size={20} />
            <textarea 
              className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] pr-14 pl-6 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/5 h-40 resize-none transition-all"
              placeholder="اكتب أي ملاحظات فنية أو تربوية إضافية للمحاضر..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center gap-4">
            <button 
                type="submit"
                disabled={actionLoading}
                className="flex-1 w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center transition-all hover:bg-black active:scale-95 disabled:opacity-50"
            >
                {actionLoading ? <Loader2 className="animate-spin ml-3" size={24} /> : <CheckCircle2 className="ml-3 text-blue-400" size={24} />}
                اعتماد وإرسال تقرير الجودة
            </button>
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-10 py-6 bg-slate-50 text-slate-400 rounded-[2rem] font-black text-sm hover:bg-slate-100 transition-all"
            >
                إلغاء التقييم
            </button>
        </div>
      </form>
      
      <div className="text-center">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Quality Assurance Framework • El Centro de Mirar v2.5</p>
      </div>
    </div>
  );
};

export default ClassEvaluation;
