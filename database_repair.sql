
-- 1. إصلاح جدول المحاضرات (halagas) بإضافة الأعمدة الناقصة
ALTER TABLE public.halagas ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 1;
ALTER TABLE public.halagas ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE public.halagas ADD COLUMN IF NOT EXISTS period TEXT DEFAULT 'مسائي';
ALTER TABLE public.halagas ADD COLUMN IF NOT EXISTS days TEXT[] DEFAULT '{}';
ALTER TABLE public.halagas ADD COLUMN IF NOT EXISTS target_student TEXT;
ALTER TABLE public.halagas ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.halagas ADD COLUMN IF NOT EXISTS class_type TEXT;
ALTER TABLE public.halagas ADD COLUMN IF NOT EXISTS registration_day TEXT;
ALTER TABLE public.halagas ADD COLUMN IF NOT EXISTS registration_date DATE;

-- 2. التأكد من وجود عمود اللغة في جدول الطلاب
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrolled_language TEXT;

-- 3. تحديث صلاحيات الوصول لضمان قدرة التطبيق على الحفظ
GRANT ALL ON TABLE public.halagas TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.students TO anon, authenticated, service_role;

-- 4. إجبار Supabase على تحديث "Cache" المخطط البرمجي
NOTIFY pgrst, 'reload schema';
