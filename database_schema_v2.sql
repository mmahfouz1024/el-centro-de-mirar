
-- =========================================================
-- 1. جدول الحسابات والمستخدمين (profiles)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'teacher', -- manager, supervisor, teacher, sales
    permissions JSONB DEFAULT '{}'::jsonb,
    specialization TEXT, -- لغة التخصص
    hourly_rate NUMERIC DEFAULT 0,
    phone TEXT,
    vodafone_cash TEXT,
    instapay TEXT,
    age INTEGER,
    gender TEXT DEFAULT 'ذكر',
    branch TEXT DEFAULT 'الرئيسي',
    work_schedule JSONB DEFAULT '{}'::jsonb,
    avatar TEXT
);

-- =========================================================
-- 2. جدول الطلاب (students)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    student_number TEXT UNIQUE,
    age INTEGER,
    country TEXT,
    gender TEXT,
    address TEXT,
    edu_stage TEXT,
    edu_system TEXT,
    school_name TEXT,
    enrolled_language TEXT, -- اللغة المسجل بها
    student_phone TEXT,
    parent_phone TEXT,
    parent_country_code TEXT DEFAULT '+20',
    level TEXT DEFAULT 'مبتدئ',
    current_juz INTEGER DEFAULT 30,
    last_hifz_date DATE,
    total_memorized INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    branch TEXT DEFAULT 'الرئيسي',
    section TEXT DEFAULT 'بنين',
    teacher_name TEXT,
    supervisor_name TEXT,
    enrollment_programs TEXT[] DEFAULT '{}',
    enrollment_notes TEXT,
    renewal_status TEXT DEFAULT 'undecided', -- yes, no, undecided
    paid_amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'جنيه مصري',
    required_sessions_count INTEGER DEFAULT 1,
    preferred_schedule JSONB DEFAULT '{}'::jsonb,
    admission_result TEXT DEFAULT 'قبول',
    interview_notes TEXT,
    recitation_level TEXT,
    memorization_status TEXT
);

-- =========================================================
-- 3. جدول الحلقات / المحاضرات (halagas)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.halagas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT,
    teacher TEXT,
    target_student TEXT,
    duration TEXT,
    class_type TEXT,
    registration_day TEXT,
    registration_date DATE,
    branch TEXT DEFAULT 'الرئيسي',
    capacity INTEGER DEFAULT 1,
    progress INTEGER DEFAULT 0,
    period TEXT DEFAULT 'مسائي',
    days TEXT[] DEFAULT '{}'
);

-- =========================================================
-- 4. جدول سجلات الحضور للطلاب (attendance_records)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    student_id TEXT NOT NULL,
    class_name TEXT,
    record_date DATE NOT NULL,
    status TEXT NOT NULL -- present, absent, late, excused
);

-- إضافة فهرس فريد لمنع تكرار التحضير لنفس الطالب في نفس اليوم
CREATE UNIQUE INDEX IF NOT EXISTS unique_attendance_per_day ON public.attendance_records (student_id, record_date);

-- =========================================================
-- 5. جدول سجلات تتبع إنجاز الطلاب (student_tracking_logs)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.student_tracking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    student_id TEXT NOT NULL,
    date_hijri TEXT,
    date_gregorian DATE NOT NULL,
    type TEXT NOT NULL, -- hifz, revision, yesterday_hifz, fixing
    surah_name TEXT,
    ayah_from INTEGER,
    ayah_to INTEGER,
    evaluation TEXT,
    notes TEXT,
    status TEXT,
    points_awarded INTEGER DEFAULT 0,
    target_revision_date DATE
);

-- =========================================================
-- 6. جدول التحصيلات المالية من الطلاب (student_expenses)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.student_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    student_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT DEFAULT 'رسوم دراسية',
    notes TEXT,
    payment_method TEXT DEFAULT 'نقدي (كاش)',
    branch TEXT DEFAULT 'الرئيسي',
    date TIMESTAMPTZ DEFAULT NOW(),
    subscription_type TEXT,
    course_type TEXT,
    assigned_member TEXT,
    teacher_ratio NUMERIC DEFAULT 0,
    payment_type TEXT DEFAULT 'full',
    amount_paid NUMERIC DEFAULT 0,
    amount_remaining NUMERIC DEFAULT 0,
    installments_count INTEGER DEFAULT 1,
    installment_amount NUMERIC DEFAULT 0,
    teacher_amount_paid NUMERIC DEFAULT 0,
    teacher_amount_remaining NUMERIC DEFAULT 0,
    teacher_installments_count INTEGER DEFAULT 1,
    teacher_installment_amount NUMERIC DEFAULT 0
);

-- =========================================================
-- 7. جدول الرواتب والمصروفات (salaries & other_expenses)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    employee_name TEXT NOT NULL,
    role TEXT,
    base_salary NUMERIC DEFAULT 0,
    bonuses NUMERIC DEFAULT 0,
    deductions NUMERIC DEFAULT 0,
    final_amount NUMERIC NOT NULL,
    month INTEGER,
    year INTEGER,
    status TEXT DEFAULT 'معلق', -- تم الصرف, معلق
    branch TEXT DEFAULT 'الرئيسي',
    payment_date TIMESTAMPTZ,
    detailed_finance JSONB DEFAULT '{}'::jsonb,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.other_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT DEFAULT 'نثريات',
    branch TEXT DEFAULT 'الرئيسي',
    date TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 8. جداول إضافية (المبيعات، التقييم، المحتوى)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.sales_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    full_name TEXT NOT NULL,
    private_phone TEXT,
    academy_whatsapp TEXT,
    vodafone_cash TEXT,
    instapay TEXT,
    notes TEXT,
    base_salary NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.class_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    teacher_name TEXT,
    class_name TEXT,
    evaluator_name TEXT,
    internet_quality INTEGER,
    camera_usage INTEGER,
    focus_level INTEGER,
    management_skills INTEGER,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    poster TEXT
);

-- =========================================================
-- 9. تفعيل الحماية والوصول العام
-- =========================================================
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public Access %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Public Access %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
        EXECUTE format('GRANT ALL ON TABLE public.%I TO anon, authenticated, service_role', t);
    END LOOP;
END $$;
