
export enum StudentLevel {
  BEGINNER = 'مبتدئ',
  INTERMEDIATE = 'متوسط',
  ADVANCED = 'متقدم'
}

export enum Gender {
  MALE = 'ذكر',
  FEMALE = 'أنثى'
}

export enum EduSystem {
  GENERAL = 'عام',
  AZHAR = 'أزهري'
}

export interface Student {
  id: string;
  name: string;
  student_number: string;
  join_date: string;
  age: number; 
  country: string; 
  gender: Gender;
  address: string;
  edu_stage: string;
  edu_system: EduSystem;
  school_name: string;
  
  // New field for language center
  enrolled_language?: string;

  // Contact
  student_phone?: string;
  parent_phone: string;
  parent_country_code: string;
  
  // Academic
  level: StudentLevel;
  current_juz: number;
  last_hifz_date: string;
  total_memorized: number;
  points: number;
  branch: string;
  section: 'بنين' | 'بنات';
  halaqa: string[]; 
  
  // Staff Links
  teacher_name?: string;
  supervisor_name?: string; 
  
  // Enrollment
  enrollment_programs: string[];
  enrollment_notes?: string;
  renewal_status?: 'yes' | 'no' | 'undecided' | 'new'; 
  
  // Finance
  paid_amount?: number;
  currency?: string;
  
  // Admission Test Fields
  recitation_level?: string;
  memorization_status?: string;
  interview_notes?: string;
  admission_result?: string;
  
  writing_eval?: string;
  writing_note?: string;
  writing_image?: string;
  recitation_eval?: string;
  recitation_note?: string;
  hifz_eval?: string;
  hifz_from?: string;
  hifz_to?: string;
  tester_name?: string;
  tester_guidance?: string;
  
  // Scheduling
  required_sessions_count?: number;
  session_duration?: number;
  preferred_schedule?: any;
}

export interface TeacherAttendanceRecord {
  id?: string;
  teacher_id: string;
  record_date: string;
  status: 'present' | 'absent' | 'late' | 'permission' | '';
  check_in?: string;
  check_out?: string;
  notes?: string;
}

export interface SubscriptionRequest {
  id: string;
  schoolName: string;
  username: string;
  supervisorName: string;
  phone: string;
  email: string;
  studentsCount: number;
  location: string;
  referralSource: string;
  notes?: string;
  status: 'new' | 'contacted' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  full_name?: string;
  username?: string;
  password?: string;
  specialization: string;
  phone?: string;
  email?: string;
  birth_date?: string;
  age?: number;
  address: string;
  groupsCount: number;
  rating?: number;
  avatar?: string;
  permissions?: any;
}
