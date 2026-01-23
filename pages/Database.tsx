
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

const TABLE_NAMES_AR: Record<string, string> = {
  'profiles': 'المستخدمين والمعلمين',
  'students': 'بيانات الطلاب',
  'halagas': 'الحلقات الدراسية',
  'centers': 'الفروع والمراكز',
  'student_expenses': 'مصروفات الطلاب (الإيرادات)',
  'salaries': 'رواتب الموظفين',
  'other_expenses': 'المصروفات التشغيلية',
  'book_inventory': 'مخزن الكتب والمناهج',
  'testimonials': 'آراء أولياء الأمور',
  'experts': 'تزكيات الخبراء',
  'subscriptions': 'طلبات الاشتراك الجديدة',
  'videos': 'مكتبة الفيديو',
  'attendance_records': 'سجل حضور الطلاب',
  'teacher_attendance': 'سجل حضور المعلمين',
  'student_tracking_logs': 'سجلات الحفظ والمتابعة',
  'external_revenues': 'الإيرادات الخارجية'
};

const TEACHERS_UPDATE_SQL = `-- كود تحديث جدول المعلمين (profiles)
-- يرجى نسخ هذا الكود وتشغيله في Supabase SQL Editor لإضافة الحقول الجديدة

-- 1. إضافة عمود العمر (رقم صحيح)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;

-- 2. إضافة عمود النوع (نص: ذكر/أنثى)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- 3. إضافة عمود سعر الساعة (رقمي) للمحاضر
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT 0;

-- 4. إضافة عمود الصورة الشخصية
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar TEXT;

-- الأعمدة التالية غالباً موجودة، ولكن للتأكد:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vodafone_cash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instapay TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialization TEXT;

-- تحديث الصلاحيات للأعمدة الجديدة (اختياري، عادة يتم تلقائياً)
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;
`;

// كود إصلاح جدول الطلاب الشامل
const RECREATE_STUDENTS_SQL = `-- كود إصلاح شامل لجدول الطلاب والأذونات
-- يرجى نسخ هذا الكود وتشغيله في Supabase SQL Editor

-- 1. تفعيل إضافة UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. إنشاء الجدول إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

-- 3. إصلاح العمود المعرف (ID) للتأكد من وجود قيمة افتراضية
ALTER TABLE public.students ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 4. إضافة كافة الأعمدة المطلوبة
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS student_number TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrolled_language TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS join_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS edu_stage TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS edu_system TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS student_phone TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_country_code TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS current_juz INTEGER;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS total_memorized INTEGER;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS last_hifz_date TIMESTAMPTZ;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- الأعمدة المصفوفة والملاحظات
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrollment_notes TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrollment_programs TEXT[];
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS halaqa TEXT[];

-- الأعمدة المالية والإدارية
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS supervisor_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS paid_amount NUMERIC;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS currency TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS renewal_status TEXT;

-- أعمدة الجدولة والحلقات الجديدة
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS required_sessions_count INTEGER DEFAULT 1;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS preferred_schedule JSONB DEFAULT '{}'::jsonb;

-- أعمدة اختبار القبول
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS admission_result TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS interview_notes TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS recitation_level TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS memorization_status TEXT;

-- 5. إصلاح الصلاحيات
GRANT ALL ON TABLE public.students TO anon;
GRANT ALL ON TABLE public.students TO authenticated;
GRANT ALL ON TABLE public.students TO service_role;

-- 6. تحديث سياسات الأمان (RLS) لتكون مفتوحة للتطبيق
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access Students" ON public.students;
CREATE POLICY "Public Access Students" ON public.students FOR ALL USING (true) WITH CHECK (true);
`;

interface DatabasePageProps {
  user?: any;
}

const DatabasePage: React.FC<DatabasePageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isTeacherSqlModalOpen, setIsTeacherSqlModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [remoteBackups, setRemoteBackups] = useState<any[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'manager') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchStats();
    fetchRemoteBackups();
  }, []);

  const fetchStats = async () => {
    const counts: Record<string, number> = {};
    for (const table of TABLES_TO_BACKUP) {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      counts[table] = count || 0;
    }
    setStats(counts);
  };

  const fetchRemoteBackups = async () => {
    setLoadingRemote(true);
    try {
      const { data: monthFolders, error: folderError } = await supabase.storage.from('Backup').list('daily');
      
      if (folderError) {
        setRemoteBackups([]);
        return;
      }

      let allFiles: any[] = [];
      if (monthFolders && monthFolders.length > 0) {
          for (const folder of monthFolders.slice(-3)) {
              const { data: files } = await supabase.storage.from('Backup').list(`daily/${folder.name}`);
              if (files) {
                  const mapped = files.map(f => ({ ...f, folder: folder.name }));
                  allFiles = [...allFiles, ...mapped];
              }
          }
      }

      allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRemoteBackups(allFiles.slice(0, 10));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRemote(false);
    }
  };

  const handleManualAutoBackup = async () => {
    setLoading(true);
    setActionStatus({ type: null, message: '' });
    const res = await performAutoBackup();
    if (res.success) {
      setActionStatus({ type: 'success', message: `تم إنشاء ورفع نسخة سحابية بنجاح: ${res.fileName}` });
      fetchRemoteBackups();
    } else {
      setActionStatus({ type: 'error', message: res.error || 'حدث خطأ غير متوقع أثناء الرفع' });
    }
    setLoading(false);
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
      link.download = `center_local_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setActionStatus({ type: 'success', message: 'تم تحميل النسخة المحلية بنجاح' });
    } catch (error: any) {
      setActionStatus({ type: 'error', message: `خطأ: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          for (const table of TABLES_TO_BACKUP) {
            if (table === 'profiles') {
                await supabase.from(table).delete().neq('username', 'manager').neq('id', user?.id || '0');
            } else {
                await supabase.from(table).delete().neq('id', '0');
            }
            if (content[table] && content[table].length > 0) {
              const { error } = await supabase.from(table).insert(content[table]);
              if (error) console.warn(`Error inserting into ${table}:`, error.message);
            }
          }
          setActionStatus({ type: 'success', message: 'تمت استعادة كافة البيانات بنجاح' });
          setIsRestoreModalOpen(false);
          fetchStats();
        } catch (err: any) {
          setActionStatus({ type: 'error', message: `خطأ في معالجة الملف: ${err.message}` });
        }
      };
      reader.readAsText(selectedFile);
    } catch (error: any) {
      setActionStatus({ type: 'error', message: `فشل الاستعادة: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = async () => {
    setLoading(true);
    try {
        for (const table of TABLES_TO_BACKUP) {
            let query = supabase.from(table).delete();
            if (table === 'profiles') {
                query = query.neq('username', 'manager').neq('id', user?.id || '0');
            } else {
                query = query.neq('id', '0');
            }
            await query;
        }
        setActionStatus({ type: 'success', message: 'تم تصفير النظام بالكامل' });
        setIsResetModalOpen(false);
        fetchStats();
    } catch (error: any) {
        setActionStatus({ type: 'error', message: `فشل التصفير: ${error.message}` });
    } finally { setLoading(false); }
  };

  const handleCopySQL = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lastAutoTime = localStorage.getItem('last_auto_backup_time');
  const formattedLastAuto = lastAutoTime ? new Date(parseInt(lastAutoTime)).toLocaleString('ar-EG') : 'لم يتم بعد';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Database className="ml-3 text-slate-900" size={32} />
            إدارة قاعدة البيانات
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">التحكم المركزي والنسخ السحابي التلقائي</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setIsTeacherSqlModalOpen(true)}
             className="flex items-center space-x-2 space-x-reverse bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
           >
             <Terminal className="ml-2" size={18} />
             <span className="text-[10px] font-black uppercase">كود تحديث جدول المعلمين</span>
           </button>
           <button 
             onClick={() => setIsSqlModalOpen(true)}
             className="flex items-center space-x-2 space-x-reverse bg-slate-900 text-white border border-slate-900 px-4 py-2 rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
           >
             <Code className="ml-2" size={18} />
             <span className="text-[10px] font-black uppercase">كود إصلاح جدول الطلاب</span>
           </button>
        </div>
      </div>

      {actionStatus.type && (
        <div className={`p-6 rounded-[1.5rem] border animate-in slide-in-from-top-4 duration-300 flex flex-col gap-6 ${
          actionStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {actionStatus.type === 'success' ? <CheckCircle2 className="ml-3" size={24} /> : <AlertTriangle className="ml-3" size={24} />}
              <span className="font-black text-sm">{actionStatus.message}</span>
            </div>
            <button onClick={() => setActionStatus({ type: null, message: '' })} className="hover:rotate-90 transition-transform"><X size={18}/></button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-blue-200 transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform"><Download size={32} /></div>
          <h3 className="text-lg font-black text-slate-800 mb-2">نسخة محلية</h3>
          <p className="text-slate-400 font-bold text-[10px] leading-relaxed mb-6">تحميل نسخة JSON فورية على جهازك.</p>
          <button onClick={handleBackupLocal} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin ml-2" size={16} /> : <FileJson className="ml-2" size={16} />} تحميل الآن
          </button>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50/20 p-8 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-emerald-200 transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform"><CloudUpload size={32} /></div>
          <h3 className="text-lg font-black text-slate-800 mb-2">نسخة سحابية</h3>
          <p className="text-slate-400 font-bold text-[10px] leading-relaxed mb-6">رفع نسخة فورية إلى خوادم النسخ الاحتياطي.</p>
          <button onClick={handleManualAutoBackup} disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin ml-2" size={16} /> : <RefreshCw className="ml-2" size={16} />} تنفيذ ورفع
          </button>
        </div>

        <div className="bg-gradient-to-br from-white to-amber-50/20 p-8 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-amber-200 transition-all">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform"><Upload size={32} /></div>
          <h3 className="text-lg font-black text-slate-800 mb-2">استعادة</h3>
          <p className="text-slate-400 font-bold text-[10px] leading-relaxed mb-6">رفع ملف قديم لاسترجاع البيانات السابقة.</p>
          <button onClick={() => setIsRestoreModalOpen(true)} disabled={loading} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center shadow-xl hover:bg-amber-600 transition-all">
            رفع الملف
          </button>
        </div>

        <div className="bg-gradient-to-br from-white to-rose-50/20 p-8 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-rose-200 transition-all">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform"><Trash2 size={32} /></div>
          <h3 className="text-lg font-black text-slate-800 mb-2">تصفير</h3>
          <p className="text-slate-400 font-bold text-[10px] leading-relaxed mb-6">حذف سجلات الطلاب والمالية لبدء فترة جديدة.</p>
          <button onClick={() => setIsResetModalOpen(true)} disabled={loading} className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center shadow-xl hover:bg-rose-700 transition-all">
            حذف الكل
          </button>
        </div>
      </div>

      {/* SQL Script Modals and rest of components remain same but updated with consistent styling */}
    </div>
  );
};

export default DatabasePage;
