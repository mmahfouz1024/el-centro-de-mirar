
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

-- 3. إضافة عمود الفئة المستهدفة (مصفوفة نصوص) لتعدد الاختيار
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_audience TEXT[];

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

-- 4. إضافة كافة الأعمدة المطلوبة (لن يؤثر على البيانات الموجودة)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS student_number TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS country TEXT;
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

-- الأعمدة المصفوفة
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='halaqa') THEN
        ALTER TABLE public.students ADD COLUMN halaqa TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='enrollment_programs') THEN
        ALTER TABLE public.students ADD COLUMN enrollment_programs TEXT[];
    END IF;
END $$;

-- الأعمدة المالية والإدارية
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrollment_notes TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS supervisor_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS paid_amount NUMERIC;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS currency TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS renewal_status TEXT;

-- أعمدة الجدولة والحلقات الجديدة
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS required_sessions_count INTEGER DEFAULT 1;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS preferred_schedule JSONB DEFAULT '{}'::jsonb;

-- أعمدة اختبار القبول
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS writing_eval TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS writing_note TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS writing_image TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS recitation_eval TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS recitation_note TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS hifz_eval TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS hifz_from TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS hifz_to TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS tester_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS tester_guidance TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS admission_result TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS interview_notes TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS recitation_level TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS memorization_status TEXT;

-- 5. إصلاح الصلاحيات (Permissions Grant)
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
      setActionStatus({ type: 'error', message: `فشل التحميل: ${error.message}` });
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
        setActionStatus({ type: 'success', message: 'تم تصفير النظام بالكامل (البيانات فقط)' });
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
           <div className="flex items-center space-x-2 space-x-reverse bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl">
              <CloudUpload className="text-emerald-600" size={18} />
              <span className="text-[10px] font-black text-emerald-700 uppercase">آخر نسخ سحابي: {formattedLastAuto}</span>
           </div>
        </div>
      </div>

      {actionStatus.type && (
        <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top-4 duration-300 flex flex-col gap-6 ${
          actionStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {actionStatus.type === 'success' ? <CheckCircle2 className="ml-3" size={24} /> : <AlertTriangle className="ml-3" size={24} />}
              <span className="font-black text-sm">{actionStatus.message}</span>
            </div>
            <button onClick={() => setActionStatus({ type: null, message: '' })} className="hover:rotate-90 transition-transform"><X size={18}/></button>
          </div>
          
          {actionStatus.type === 'error' && (actionStatus.message.includes('RLS') || actionStatus.message.includes('Bucket')) && (
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-rose-200 shadow-xl space-y-4">
               <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black text-rose-900 flex items-center">
                    <Terminal size={16} className="ml-2" /> تنبيه: تأكد من إعدادات التخزين (Storage Bucket) وسياسات الأمان في Supabase.
                  </p>
               </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-blue-200 transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform"><Download size={32} /></div>
          <h3 className="text-lg font-black text-slate-800 mb-2">نسخة محلية</h3>
          <p className="text-slate-400 font-bold text-[10px] leading-relaxed mb-6">تحميل نسخة JSON فورية على جهازك.</p>
          <button onClick={handleBackupLocal} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin ml-2" size={16} /> : <FileJson className="ml-2" size={16} />} تحميل الآن
          </button>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-emerald-200 transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform"><CloudUpload size={32} /></div>
          <h3 className="text-lg font-black text-slate-800 mb-2">نسخة سحابية</h3>
          <p className="text-slate-400 font-bold text-[10px] leading-relaxed mb-6">رفع نسخة فورية إلى خوادم Backup الآمنة.</p>
          <button onClick={handleManualAutoBackup} disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin ml-2" size={16} /> : <RefreshCw className="ml-2" size={16} />} تنفيذ ورفع
          </button>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-amber-200 transition-all">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform"><Upload size={32} /></div>
          <h3 className="text-lg font-black text-slate-800 mb-2">استعادة</h3>
          <p className="text-slate-400 font-bold text-[10px] leading-relaxed mb-6">رفع ملف قديم لاسترجاع البيانات السابقة.</p>
          <button onClick={() => setIsRestoreModalOpen(true)} disabled={loading} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center shadow-xl hover:bg-amber-600 transition-all">
            رفع الملف
          </button>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-rose-200 transition-all">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform"><Trash2 size={32} /></div>
          <h3 className="text-lg font-black text-slate-800 mb-2">تصفير</h3>
          <p className="text-slate-400 font-bold text-[10px] leading-relaxed mb-6">حذف سجلات الطلاب والمالية لبدء سنة جديدة.</p>
          <button onClick={() => setIsResetModalOpen(true)} disabled={loading} className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center shadow-xl hover:bg-rose-700 transition-all">
            حذف الكل
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden h-fit">
           <div className="relative z-10 flex items-center justify-between mb-6">
              <h3 className="text-lg font-black flex items-center"><HardDrive className="ml-2" size={20}/> إحصائيات السجلات</h3>
              <button onClick={fetchStats} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><RefreshCw size={14}/></button>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
               {Object.entries(stats).map(([name, count]) => (
                  <div key={name} className="bg-white/5 border border-white/5 p-3 rounded-2xl text-center">
                     <span className="text-xl font-black text-emerald-400 block">{count}</span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block truncate">{TABLE_NAMES_AR[name] || name}</span>
                  </div>
               ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center"><History className="ml-2 text-blue-600" size={20}/> سجل النسخ السحابية (Daily)</h3>
              <button onClick={fetchRemoteBackups} className="text-blue-600"><RefreshCw size={16} className={loadingRemote ? 'animate-spin' : ''}/></button>
           </div>
           <div className="space-y-3">
              {loadingRemote ? <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" /></div> :
               remoteBackups.length === 0 ? <p className="text-center py-10 text-slate-300 font-bold">لا توجد نسخ سحابية متاحة</p> :
               remoteBackups.map((file, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center">
                       <FileCode size={16} className="ml-3 text-slate-400" />
                       <div>
                          <p className="text-[10px] font-black text-slate-700">{file.name}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(file.created_at).toLocaleString('ar-EG')}</p>
                       </div>
                    </div>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{file.metadata ? (file.metadata.size / 1024).toFixed(1) : '0'} KB</span>
                 </div>
               ))}
           </div>
        </div>
      </div>

      {/* SQL Script Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setIsSqlModalOpen(false)}></div>
           <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[85vh]">
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between shadow-lg z-10">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl text-emerald-400 shadow-lg">
                      <Terminal size={24} />
                    </div>
                    <div>
                       <h3 className="text-lg font-black">كود إنشاء جدول الطلاب</h3>
                       <p className="text-[10px] font-bold text-slate-400">انسخ هذا الكود وشغله في محرر SQL في Supabase لإصلاح الجدول</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopySQL(RECREATE_STUDENTS_SQL)}
                      className={`flex items-center px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg ${
                        copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {copied ? <CheckCircle2 size={16} className="ml-2" /> : <Copy size={16} className="ml-2" />}
                      {copied ? 'تم النسخ!' : 'نسخ الكود'}
                    </button>
                    <button onClick={() => setIsSqlModalOpen(false)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><X size={20}/></button>
                 </div>
              </div>
              
              <div className="flex-1 bg-slate-50 p-6 overflow-hidden">
                 <div className="w-full h-full bg-slate-900 rounded-[1.5rem] border border-slate-800 shadow-inner overflow-auto custom-scrollbar p-6 relative group">
                    <code className="text-[11px] font-mono whitespace-pre leading-relaxed block text-emerald-400">
                      {RECREATE_STUDENTS_SQL}
                    </code>
                 </div>
              </div>

              <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
                 <span>يرجى الحذر عند تنفيذ أوامر الحذف (DROP)</span>
                 <span>v2.5 System</span>
              </div>
           </div>
        </div>
      )}

      {/* Teacher Update SQL Modal */}
      {isTeacherSqlModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setIsTeacherSqlModalOpen(false)}></div>
           <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[85vh]">
              <div className="p-6 bg-blue-900 text-white flex items-center justify-between shadow-lg z-10">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl text-blue-400 shadow-lg">
                      <Database size={24} />
                    </div>
                    <div>
                       <h3 className="text-lg font-black">تحديث جدول المعلمين</h3>
                       <p className="text-[10px] font-bold text-blue-200">إضافة الأعمدة الجديدة (العمر، النوع، الفئة المستهدفة)</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopySQL(TEACHERS_UPDATE_SQL)}
                      className={`flex items-center px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg ${
                        copied ? 'bg-blue-500 text-white' : 'bg-white text-blue-900 hover:bg-blue-50'
                      }`}
                    >
                      {copied ? <CheckCircle2 size={16} className="ml-2" /> : <Copy size={16} className="ml-2" />}
                      {copied ? 'تم النسخ!' : 'نسخ الكود'}
                    </button>
                    <button onClick={() => setIsTeacherSqlModalOpen(false)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><X size={20}/></button>
                 </div>
              </div>
              
              <div className="flex-1 bg-slate-50 p-6 overflow-hidden">
                 <div className="w-full h-full bg-slate-900 rounded-[1.5rem] border border-slate-800 shadow-inner overflow-auto custom-scrollbar p-6 relative group">
                    <code className="text-[11px] font-mono whitespace-pre leading-relaxed block text-blue-400">
                      {TEACHERS_UPDATE_SQL}
                    </code>
                 </div>
              </div>
           </div>
        </div>
      )}

      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => !loading && setIsRestoreModalOpen(false)}></div>
           <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10 animate-in zoom-in duration-300 text-right">
              <div className="flex items-center justify-between mb-8">
                 <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><History size={28} /></div>
                 <button onClick={() => setIsRestoreModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500"><X size={24}/></button>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">استعادة نسخة سابقة</h3>
              <div className="space-y-6">
                <input type="file" accept=".json" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-sm font-bold" />
                <button onClick={handleRestore} disabled={loading || !selectedFile} className="w-full bg-amber-500 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center transition-all hover:bg-amber-600 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin ml-2" size={24} /> : <RefreshCw className="ml-2" size={24} />} بدء الاستعادة
                </button>
              </div>
           </div>
        </div>
      )}

      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => !loading && setIsResetModalOpen(false)}></div>
           <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10 animate-in zoom-in duration-300 text-right border-4 border-rose-100">
              <h3 className="text-3xl font-black text-rose-600 mb-4 tracking-tight">تحذير: تصفير شامل!</h3>
              <p className="text-rose-800 font-bold text-sm leading-relaxed mb-8">سيتم حذف كافة سجلات الطلاب والمالية والحلقات نهائياً (الحسابات ستبقى). لا يمكن التراجع عن هذا الإجراء.</p>
              <button onClick={handleResetAll} disabled={loading} className="w-full bg-rose-600 text-white py-6 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center hover:bg-rose-700 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin ml-2" size={24} /> : <Trash2 className="ml-2" size={24} />} نعم، احذف كل شيء
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default DatabasePage;
