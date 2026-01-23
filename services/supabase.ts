
import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    return process.env[key];
  }
  return '';
};

// تم تحديث البيانات لتصبح الداتابيز الجديدة هي الأساسية
const supabaseUrl = getEnv('REACT_APP_SUPABASE_URL') || 'https://mnaljojymprixuayzvnv.supabase.co';
const supabaseKey = getEnv('REACT_APP_SUPABASE_ANON_KEY') || 'sb_publishable_GNjWLQdBwCikBy6gNNYuLw_EZolC8zR';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const formatAppDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('ar-EG');
};

const generateId = () => crypto.randomUUID();

export const db = {
  auth: {
    // تم التحديث: البحث بالمستخدم وكلمة المرور فقط، والدور يأتي من قاعدة البيانات
    async signIn(username: string, password: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();
      
      if (error || !data) return null;
      return data;
    }
  },
  ijazaStudents: {
    async getAll() {
      const { data } = await supabase.from('ijaza_students').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    async create(student: any) {
      const { data, error } = await supabase.from('ijaza_students').insert(student).select();
      if (error) throw error;
      return data?.[0];
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase.from('ijaza_students').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('ijaza_students').delete().eq('id', id);
      if (error) throw error;
    }
  },
  sales: {
    async getAll() {
      const { data } = await supabase.from('sales_records').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    async create(record: any) {
      const { data, error } = await supabase.from('sales_records').insert(record).select();
      if (error) throw error;
      return data?.[0];
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase.from('sales_records').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('sales_records').delete().eq('id', id);
      if (error) throw error;
    }
  },
  salesTeam: {
    async getAll() {
      const { data } = await supabase.from('sales_employees').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    async create(employee: any) {
      const { data, error } = await supabase.from('sales_employees').insert(employee).select();
      if (error) throw error;
      return data?.[0];
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase.from('sales_employees').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('sales_employees').delete().eq('id', id);
      if (error) throw error;
    }
  },
  students: {
    async getAll() {
      const { data } = await supabase.from('students').select('*');
      return data || [];
    },
    async getByHalaqa(halaqaName: string) {
      const { data } = await supabase.from('students').select('*').contains('halaqa', [halaqaName]);
      return data || [];
    },
    async create(student: any) {
      const { data, error } = await supabase.from('students').insert(student).select();
      if (error) throw error;
      return data?.[0];
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase.from('students').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
    }
  },
  classEvaluations: {
    async create(evaluation: any) {
      const { data, error } = await supabase.from('class_evaluations').insert(evaluation).select();
      if (error) throw error;
      return data?.[0];
    },
    async getAll() {
      const { data } = await supabase.from('class_evaluations').select('*').order('created_at', { ascending: false });
      return data || [];
    }
  },
  teachers: {
    async getAll() {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'teacher');
      return data || [];
    },
    async create(teacher: any) {
      const { data, error } = await supabase.from('profiles').insert({ ...teacher, role: 'teacher' }).select();
      if (error) throw error;
      return data?.[0];
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    }
  },
  profiles: {
    async getAll() {
      const { data } = await supabase.from('profiles').select('*');
      return data || [];
    },
    async getTeachers() {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'teacher');
      return data || [];
    },
    async getById(id: string) {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      return data;
    },
    async create(profile: any) {
      const { data, error } = await supabase.from('profiles').insert(profile).select();
      if (error) throw error;
      return data?.[0];
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    }
  },
  classes: {
    async getAll() {
      const { data } = await supabase.from('halagas').select('*');
      return data || [];
    },
    async getByTeacher(teacherName: string) {
      const { data } = await supabase.from('halagas').select('*').eq('teacher', teacherName);
      return data || [];
    },
    async getByNames(names: string[]) {
      const { data } = await supabase.from('halagas').select('*').in('name', names);
      return data || [];
    },
    async create(halaqa: any) {
      const { data, error } = await supabase.from('halagas').insert(halaqa).select();
      if (error) throw error;
      return data?.[0];
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase.from('halagas').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('halagas').delete().eq('id', id);
      if (error) throw error;
    }
  },
  centers: {
    async getAll() {
      const { data } = await supabase.from('centers').select('*');
      return data || [];
    }
  },
  attendance: {
    async getAll() {
      const { data } = await supabase.from('attendance_records').select('*');
      return data || [];
    },
    async getTodayRecords(className: string) {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('attendance_records')
        .select('student_id, status')
        .eq('class_name', className)
        .eq('record_date', today);
      
      const records: Record<string, string> = {};
      data?.forEach((r: any) => {
        records[r.student_id] = r.status;
      });
      return records;
    },
    async saveRecords(className: string, records: Record<string, string>) {
      const today = new Date().toISOString().split('T')[0];
      const updates = Object.entries(records).map(([studentId, status]) => ({
        student_id: studentId,
        class_name: className,
        status,
        record_date: today
      }));

      const { error } = await supabase.from('attendance_records').upsert(updates, { onConflict: 'student_id,record_date' });
      if (error) throw error;
    }
  },
  teacherAttendance: {
    async getByDate(date: string) {
      const { data } = await supabase.from('teacher_attendance').select('*').eq('record_date', date);
      return data || [];
    },
    async getByTeacher(teacherId: string) {
      const { data } = await supabase.from('teacher_attendance').select('*').eq('teacher_id', teacherId);
      return data || [];
    },
    async upsert(records: any[]) {
      const { error } = await supabase.from('teacher_attendance').upsert(records, { onConflict: 'teacher_id,record_date' });
      if (error) throw error;
    }
  },
  logs: {
    async getAll() {
      const { data } = await supabase.from('student_tracking_logs').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    async getByStudent(studentId: string) {
      const { data } = await supabase
        .from('student_tracking_logs')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    async create(log: any) {
      const { data, error } = await supabase.from('student_tracking_logs').insert(log).select();
      if (error) throw error;
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('student_tracking_logs').delete().eq('id', id);
      if (error) throw error;
    }
  },
  finance: {
    studentExpenses: {
      async getAll() {
        const { data } = await supabase.from('student_expenses').select('*').order('date', { ascending: false });
        return data || [];
      },
      async create(record: any) {
        const { data, error } = await supabase.from('student_expenses').insert(record).select();
        if (error) throw error;
        return data?.[0];
      },
      async delete(id: string) {
        const { error } = await supabase.from('student_expenses').delete().eq('id', id);
        if (error) throw error;
      }
    },
    salaries: {
      async getAll() {
        const { data } = await supabase.from('salaries').select('*').order('created_at', { ascending: false });
        return data || [];
      },
      async create(record: any) {
        const { data, error } = await supabase.from('salaries').insert(record).select();
        if (error) throw error;
        return data?.[0];
      },
      async delete(id: string) {
        const { error } = await supabase.from('salaries').delete().eq('id', id);
        if (error) throw error;
      }
    },
    externalRevenues: {
      async getAll() {
        const { data } = await supabase.from('external_revenues').select('*').order('date', { ascending: false });
        return data || [];
      },
      async create(record: any) {
        const { data, error } = await supabase.from('external_revenues').insert(record).select();
        if (error) throw error;
        return data?.[0];
      },
      async delete(id: string) {
        const { error } = await supabase.from('external_revenues').delete().eq('id', id);
        if (error) throw error;
      }
    },
    otherExpenses: {
      async getAll() {
        const { data } = await supabase.from('other_expenses').select('*').order('date', { ascending: false });
        return data || [];
      },
      async create(record: any) {
        const { data, error } = await supabase.from('other_expenses').insert(record).select();
        if (error) throw error;
        return data?.[0];
      },
      async delete(id: string) {
        const { error } = await supabase.from('other_expenses').delete().eq('id', id);
        if (error) throw error;
      }
    },
    books: {
      async getAll() {
        const { data } = await supabase.from('book_inventory').select('*');
        return data || [];
      },
      async create(book: any) {
        const { data, error } = await supabase.from('book_inventory').insert(book).select();
        if (error) throw error;
        return data?.[0];
      },
      async update(id: string, updates: any) {
        const { data, error } = await supabase.from('book_inventory').update(updates).eq('id', id).select();
        if (error) throw error;
        return data?.[0];
      },
      async delete(id: string) {
        const { error } = await supabase.from('book_inventory').delete().eq('id', id);
        if (error) throw error;
      }
    }
  },
  team: {
    async getAll() {
      const { data } = await supabase.from('team_members').select('*');
      return data || [];
    },
    async create(member: any) {
      const { data, error } = await supabase.from('team_members').insert(member).select();
      if (error) throw error;
      return data?.[0];
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase.from('team_members').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    }
  },
  subscriptions: {
    async getAll() {
      const { data } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    async create(sub: any) {
      const { data, error } = await supabase.from('subscriptions').insert(sub).select();
      if (error) throw error;
      return data?.[0];
    },
    async updateStatus(id: string, status: string) {
      const { error } = await supabase.from('subscriptions').update({ status }).eq('id', id);
      if (error) throw error;
    }
  },
  testimonials: {
    async getAll() {
      const { data } = await supabase.from('testimonials').select('*');
      return data || [];
    },
    async create(item: any) {
      const { data, error } = await supabase.from('testimonials').insert(item).select();
      if (error) throw error;
      return data?.[0];
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase.from('testimonials').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
    }
  },
  experts: {
    async getAll() {
      const { data } = await supabase.from('experts').select('*');
      return data || [];
    },
    async create(item: any) {
      const { data, error } = await supabase.from('experts').insert(item).select();
      if (error) throw error;
      return data?.[0];
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase.from('experts').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('experts').delete().eq('id', id);
      if (error) throw error;
    }
  },
  videos: {
    async getAll() {
      const { data } = await supabase.from('videos').select('*');
      return data || [];
    },
    async create(video: any) {
      const { data, error } = await supabase.from('videos').insert(video).select();
      if (error) throw error;
      return data?.[0];
    },
    async update(id: string, updates: any) {
      const { data, error } = await supabase.from('videos').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
    }
  }
};
