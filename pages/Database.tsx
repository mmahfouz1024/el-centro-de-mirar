
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  Loader2, 
  FileJson, 
  HardDrive, 
  History, 
  AlertTriangle, 
  Trash2, 
  CloudUpload, 
  FileCode, 
  Terminal,
  Code,
  Copy
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { performAutoBackup } from '../services/backupService';

const TABLES_TO_BACKUP = [
  'profiles', 'students', 'halagas', 'centers', 'student_expenses',
  'salaries', 'other_expenses', 'book_inventory', 'testimonials',
  'experts', 'subscriptions', 'videos', 'attendance_records',
  'teacher_attendance', 'student_tracking_logs', 'external_revenues'
];

const RECREATE_STUDENTS_SQL = `-- كود إصلاح شامل لجدول الطلاب وإضافة الأعمدة الناقصة
-- انسخ هذا الكود بالكامل وشغله في Supabase SQL Editor

-- 1. التأكد من وجود الجدول والأعمدة الأساسية
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. إضافة الأعمدة التي قد تكون ناقصة (باستخدام IF NOT EXISTS لتجنب الأخطاء)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS student_number TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrolled_language TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS join_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrollment_notes TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrollment_programs TEXT[];
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS supervisor_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'جنيه مصري';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS renewal_status TEXT DEFAULT 'undecided';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS last_hifz_date TIMESTAMPTZ;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'الرئيسي';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS required_sessions_count INTEGER DEFAULT 1;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS preferred_schedule JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS admission_result TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS interview_notes TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS recitation_level TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS memorization_status TEXT;

-- 3. تفعيل الوصول العام (أو حسب رغبتك في الأمان)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON public.students;
CREATE POLICY "Public Access" ON public.students FOR ALL USING (true) WITH CHECK (true);

-- 4. منح الصلاحيات
GRANT ALL ON TABLE public.students TO anon, authenticated, service_role;
`;

const TEACHERS_UPDATE_SQL = `-- كود تحديث جدول المعلمين والحسابات (profiles)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vodafone_cash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instapay TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'الرئيسي';

GRANT ALL ON TABLE public.profiles TO authenticated, service_role;
`;

const DatabasePage: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isTeacherSqlModalOpen, setIsTeacherSqlModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user && user.role !== 'manager') navigate('/');
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    const counts: Record<string, number> = {};
    for (const table of TABLES_TO_BACKUP) {
      try {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        counts[table] = count || 0;
      } catch { counts[table] = 0; }
    }
    setStats(counts);
  };

  const handleCopySQL = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackupLocal = async () => {
    setLoading(true);
    try {
      const backupData: Record<string, any[]> = {};
      for (const table of TABLES_TO_BACKUP) {
        const { data } = await supabase.from(table).select('*');
        backupData[table] = data || [];
      }
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mirar_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      setActionStatus({ type: 'success', message: 'تم تحميل النسخة المحلية بنجاح' });
    } catch (error: any) {
      setActionStatus({ type: 'error', message: `خطأ: ${error.message}` });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Database className="ml-3 text-slate-900" size={32} />
            إدارة قاعدة البيانات
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">التحكم المركزي والسكربتات التصحيحية</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setIsTeacherSqlModalOpen(true)}
             className="flex items-center space-x-2 space-x-reverse bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
           >
             <Terminal className="ml-2" size={18} />
             <span className="text-[10px] font-black uppercase">كود تحديث المعلمين</span>
           </button>
           <button 
             onClick={() => setIsSqlModalOpen(true)}
             className="flex items-center space-x-2 space-x-reverse bg-slate-900 text-white px-4 py-2 rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
           >
             <Code className="ml-2" size={18} />
             <span className="text-[10px] font-black uppercase">كود إصلاح الطلاب</span>
           </button>
        </div>
      </div>

      {actionStatus.type && (
        <div className={`p-6 rounded-[1.5rem] border ${actionStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
          <div className="flex items-center justify-between">
            <span className="font-black text-sm">{actionStatus.message}</span>
            <button onClick={() => setActionStatus({ type: null, message: '' })}><X size={18}/></button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-blue-200 transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform"><Download size={32} /></div>
          <h3 className="text-lg font-black text-slate-800 mb-2">نسخة JSON محلية</h3>
          <p className="text-slate-400 font-bold text-[10px] leading-relaxed mb-6">تحميل نسخة احتياطية من كافة البيانات على جهازك الشخصي.</p>
          <button onClick={handleBackupLocal} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin ml-2" size={16} /> : <FileJson className="ml-2" size={16} />} تحميل الآن
          </button>
        </div>

        <div className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm">
           <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
             <History size={20} className="text-blue-600"/> حجم البيانات الحالي
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <span className="text-[10px] font-black text-slate-400 uppercase">الطلاب</span>
                 <p className="text-xl font-black text-slate-800">{stats['students']}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <span className="text-[10px] font-black text-slate-400 uppercase">الحلقات</span>
                 <p className="text-xl font-black text-slate-800">{stats['halagas']}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <span className="text-[10px] font-black text-slate-400 uppercase">المستخدمين</span>
                 <p className="text-xl font-black text-slate-800">{stats['profiles']}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <span className="text-[10px] font-black text-slate-400 uppercase">القيود المالية</span>
                 <p className="text-xl font-black text-slate-800">{stats['student_expenses']}</p>
              </div>
           </div>
        </div>
      </div>

      {/* SQL Script Modals */}
      {(isSqlModalOpen || isTeacherSqlModalOpen) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => {setIsSqlModalOpen(false); setIsTeacherSqlModalOpen(false);}}></div>
          <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl text-amber-400"><Terminal size={24} /></div>
                <div>
                  <h3 className="text-xl font-black">{isSqlModalOpen ? 'كود إصلاح جدول الطلاب' : 'كود تحديث جدول المعلمين'}</h3>
                  <p className="text-xs text-slate-400 mt-1">انسخ الكود وشغله في Supabase SQL Editor</p>
                </div>
              </div>
              <button onClick={() => {setIsSqlModalOpen(false); setIsTeacherSqlModalOpen(false);}} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24}/></button>
            </div>
            <div className="p-8">
              <div className="relative">
                <pre className="bg-slate-50 p-6 rounded-3xl text-left font-mono text-[11px] overflow-x-auto max-h-[400px] border border-slate-100 custom-scrollbar text-slate-600" dir="ltr">
                  {isSqlModalOpen ? RECREATE_STUDENTS_SQL : TEACHERS_UPDATE_SQL}
                </pre>
                <button 
                  onClick={() => handleCopySQL(isSqlModalOpen ? RECREATE_STUDENTS_SQL : TEACHERS_UPDATE_SQL)}
                  className={`absolute top-4 right-4 px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 shadow-lg border border-slate-100'
                  }`}
                >
                  {copied ? <CheckCircle2 size={14}/> : <Copy size={14}/>}
                  {copied ? 'تم النسخ!' : 'نسخ الكود'}
                </button>
              </div>
              <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                 <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                 <p className="text-xs font-bold text-amber-800 leading-relaxed">
                   ملاحظة: استخدام هذا الكود يضيف الأعمدة الناقصة فقط ولا يحذف أي بيانات موجودة مسبقاً. تأكد من عمل نسخة احتياطية قبل أي تغيير هيكلي.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabasePage;
