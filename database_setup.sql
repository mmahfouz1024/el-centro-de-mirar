
-- 1. إنشاء جدول الحلقات / المحاضرات (halagas)
-- هذا الجدول يخزن بيانات المواعيد، المدرسين، والطلاب المستهدفين
CREATE TABLE IF NOT EXISTS public.halagas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT, -- اسم المحاضرة (يتم توليده آلياً في التطبيق)
    teacher TEXT, -- اسم المحاضر
    target_student TEXT, -- اسم الطالب المستهدف
    duration TEXT, -- مدة المحاضرة بالدقائق
    class_type TEXT, -- لغة المحاضرة (اسباني، انجليزي، الخ)
    registration_day TEXT, -- يوم المحاضرة (السبت، الأحد، الخ)
    registration_date DATE, -- تاريخ اليوم المسجل
    branch TEXT DEFAULT 'الرئيسي',
    capacity INTEGER DEFAULT 1,
    progress INTEGER DEFAULT 0,
    period TEXT DEFAULT 'مسائي',
    days TEXT[] DEFAULT '{}' -- مصفوفة الأيام المحددة
);

-- 2. إنشاء جدول سجلات الحضور (attendance_records)
-- لتخزين حالة حضور الطلاب في كل محاضرة بشكل يومي
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    student_id TEXT, -- معرف الطالب
    class_name TEXT, -- اسم الحلقة
    record_date DATE, -- تاريخ السجل
    status TEXT -- الحالة: present (حاضر), absent (غائب), late (متأخر), excused (مستأذن)
);

-- 3. إنشاء جدول سجلات تتبع الإنجاز (student_tracking_logs)
-- لتخزين ما تم حفظه أو مراجعته في كل حصة
CREATE TABLE IF NOT EXISTS public.student_tracking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    student_id TEXT, -- معرف الطالب
    date_hijri TEXT, -- التاريخ الهجري
    date_gregorian DATE, -- التاريخ الميلادي
    type TEXT, -- النوع: hifz (حفظ), revision (مراجعة), yesterday_hifz (واجب الأمس)
    surah_name TEXT, -- اسم السورة أو المنهج
    ayah_from INTEGER, -- من آية / صفحة
    ayah_to INTEGER, -- إلى آية / صفحة
    evaluation TEXT, -- التقييم: ممتاز، جيد، الخ
    notes TEXT, -- ملاحظات المعلم
    points_awarded INTEGER DEFAULT 0, -- النقاط المكتسبة
    target_revision_date DATE -- موعد المراجعة القادم
);

-- 4. تفعيل نظام الحماية (Row Level Security) وتصاريح الوصول العام
-- ملاحظة: تم ضبطها للوصول العام لتتوافق مع بنية الكود الحالية في التطبيق

ALTER TABLE public.halagas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access halagas" ON public.halagas;
CREATE POLICY "Public Access halagas" ON public.halagas FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access attendance" ON public.attendance_records;
CREATE POLICY "Public Access attendance" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.student_tracking_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access logs" ON public.student_tracking_logs;
CREATE POLICY "Public Access logs" ON public.student_tracking_logs FOR ALL USING (true) WITH CHECK (true);

-- 5. منح الصلاحيات للأدوار المختلفة
GRANT ALL ON TABLE public.halagas TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.attendance_records TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.student_tracking_logs TO anon, authenticated, service_role;
