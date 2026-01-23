
import { supabase } from './supabase';

const TABLES_TO_BACKUP = [
  'profiles', 'students', 'halagas', 'centers', 'student_expenses',
  'salaries', 'other_expenses', 'book_inventory', 'testimonials',
  'experts', 'subscriptions', 'videos', 'attendance_records',
  'teacher_attendance', 'student_tracking_logs', 'external_revenues'
];

export const performAutoBackup = async () => {
  try {
    console.log('⏳ جاري بدء عملية النسخ الاحتياطي اليدوي إلى السحابة...');
    const backupData: Record<string, any[]> = {};
    const timestamp = new Date().toISOString();
    
    // 1. جلب البيانات
    for (const table of TABLES_TO_BACKUP) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          console.warn(`⚠️ تعذر جلب بيانات الجدول ${table}:`, error.message);
          backupData[table] = [];
        } else {
          backupData[table] = data || [];
        }
      } catch (err) {
        console.error(`❌ خطأ في الجدول ${table}:`, err);
        backupData[table] = [];
      }
    }

    // إضافة معلومات تقنية
    (backupData as any)['_metadata'] = {
      system_version: '2.5',
      backup_timestamp: timestamp,
      tables_count: TABLES_TO_BACKUP.length,
      status: 'stable'
    };

    const datePart = timestamp.split('T')[0];
    const timePart = timestamp.split('T')[1].split('.')[0].replace(/:/g, '-');
    const fileName = `manual_backup_${datePart}_${timePart}.json`;
    
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });

    const monthFolder = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
    const uploadPath = `daily/${monthFolder}/${fileName}`;

    // 2. الرفع إلى Storage مع معالجة RLS
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Backup')
      .upload(uploadPath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
       console.error('❌ Storage Error:', uploadError);
       let errorMsg = uploadError.message;
       
       if (errorMsg.includes('row-level security') || uploadError.name === 'StorageApiError') {
         errorMsg = "صلاحيات الرفع مرفوضة (RLS). تأكد من تفعيل سياسات الوصول لـ Storage في Supabase.";
       } else if (errorMsg.includes('Bucket not found')) {
         errorMsg = "مجلد النسخ (Backup Bucket) غير موجود. يرجى إنشاؤه في Supabase Storage.";
       }
       
       throw new Error(errorMsg);
    }

    // 3. تحديث الطابع الزمني للنسخ اليدوي
    localStorage.setItem('last_manual_backup_time', Date.now().toString());
    console.log('✅ اكتمل النسخ الاحتياطي بنجاح:', uploadData.path);
    
    return { success: true, path: uploadData.path, fileName };
  } catch (error: any) {
    console.error('❌ فشل النسخ الاحتياطي:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * تم تعطيل وظيفة النسخ الاحتياطي التلقائي بناءً على طلب المستخدم.
 * ستبقى الوظيفة فارغة لمنع التنفيذ الدوري.
 */
export const checkAndRunAutoBackup = async (userRole: string) => {
  // تم إيقاف النسخ التلقائي
  return;
};
