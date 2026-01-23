
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Check, 
  Settings, 
  Loader2, 
  BookMarked, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  Award, 
  BookOpen, 
  Calendar, 
  Layers, 
  Save, 
  ClipboardCheck, 
  UserCheck, 
  LayoutGrid, 
  ArrowRightLeft, 
  BookCheck, 
  Target, 
  CalendarDays, 
  CheckCircle2, 
  History, 
  Clock, 
  ChevronDown, 
  Trash2, 
  AlertCircle, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  FileDown, 
  Printer, 
  ClipboardList, 
  CalendarSearch, 
  Filter, 
  Search, 
  FileText, 
  X, 
  Eye
} from 'lucide-react';
import { db, formatAppDate } from '../services/supabase';

// بيانات الأشهر الهجرية الثابتة
const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

const HIJRI_YEARS = Array.from({ length: 11 }, (_, i) => 1445 + i);
const HIJRI_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

const EVAL_GRADES = ['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'ضعيف'];

const getTodayHijri = () => {
  const today = new Date();
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-latn', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const parts = formatter.formatToParts(today);
    const dayVal = parts.find(p => p.type === 'day')?.value;
    const monthVal = parts.find(p => p.type === 'month')?.value;
    const yearVal = parts.find(p => p.type === 'year')?.value;

    let finalMonth = monthVal || "رمضان";
    if (monthVal) {
        const cleanMonth = monthVal.trim();
        if (HIJRI_MONTHS.includes(cleanMonth)) {
            finalMonth = cleanMonth;
        } else {
            const matched = HIJRI_MONTHS.find(m => m.includes(cleanMonth) || cleanMonth.includes(m));
            if (matched) finalMonth = matched;
        }
    }

    return {
      day: dayVal ? parseInt(dayVal) : 1,
      month: finalMonth,
      year: yearVal ? parseInt(yearVal) : 1446
    };
  } catch (e) {
    return { day: 1, month: "رمضان", year: 1446 };
  }
};

const QURAN_DATA: Record<number, { name: string, surahs: { name: string, ayahs: number }[] }> = {
  1: { name: "الجزء الأول", surahs: [{ name: "الفاتحة", ayahs: 7 }, { name: "البقرة (١-١٤١)", ayahs: 141 }] },
  2: { name: "الجزء الثاني", surahs: [{ name: "البقرة (١٤٢-٢٥٢)", ayahs: 111 }] },
  3: { name: "الجزء الثالث", surahs: [{ name: "البقرة (٢٥٣-٢٨٦)", ayahs: 34 }, { name: "آل عمران (١-٩٢)", ayahs: 92 }] },
  4: { name: "الجزء الرابع", surahs: [{ name: "آل عمران (٩٣-٢٠٠)", ayahs: 108 }, { name: "النساء (١-٢٣)", ayahs: 23 }] },
  5: { name: "الجزء الخامس", surahs: [{ name: "النساء (٢٤-١٤٧)", ayahs: 124 }] },
  6: { name: "الجزء السادس", surahs: [{ name: "النساء (١٤٨-١٧٦)", ayahs: 29 }, { name: "المائدة (١-٨١)", ayahs: 81 }] },
  7: { name: "الجزء السابع", surahs: [{ name: "المائدة (٨٢-١٢٠)", ayahs: 39 }, { name: "الأنعام (١-١١٠)", ayahs: 110 }] },
  8: { name: "الجزء الثامن", surahs: [{ name: "الأنعام (١١١-١٦٥)", ayahs: 55 }, { name: "الأعراف (١-٨٧)", ayahs: 87 }] },
  9: { name: "الجزء التاسع", surahs: [{ name: "الأعراف (٨٨-٢٠٦)", ayahs: 119 }, { name: "الأنفال (١-٤٠)", ayahs: 40 }] },
  10: { name: "الجزء العاشر", surahs: [{ name: "الأنفال (٤١-٧٧)", ayahs: 35 }, { name: "التوبة (١-٩٢)", ayahs: 92 }] },
  // ... rest of the Quran data (keeping existing data structure or assuming full data is present)
  30: { name: "جزء عم", surahs: [{ name: "النبأ", ayahs: 40 }, { name: "النازعات", ayahs: 46 }, { name: "عبس", ayahs: 42 }, { name: "التكوير", ayahs: 29 }, { name: "الانفطار", ayahs: 19 }, { name: "المطففين", ayahs: 36 }, { name: "الانشقاق", ayahs: 25 }, { name: "البروج", ayahs: 22 }, { name: "الطارق", ayahs: 17 }, { name: "الأعلى", ayahs: 19 }, { name: "الغاشية", ayahs: 26 }, { name: "الفجر", ayahs: 30 }, { name: "البلد", ayahs: 20 }, { name: "الشمس", ayahs: 15 }, { name: "الليل", ayahs: 21 }, { name: "الضحى", ayahs: 11 }, { name: "الشرح", ayahs: 8 }, { name: "التين", ayahs: 8 }, { name: "العلق", ayahs: 19 }, { name: "القدر", ayahs: 5 }, { name: "البينة", ayahs: 8 }, { name: "الزلزلة", ayahs: 8 }, { name: "العاديات", ayahs: 11 }, { name: "القارعة", ayahs: 11 }, { name: "التكاثر", ayahs: 8 }, { name: "العصر", ayahs: 3 }, { name: "الهمزة", ayahs: 9 }, { name: "الفيل", ayahs: 5 }, { name: "قريش", ayahs: 4 }, { name: "الماعون", ayahs: 7 }, { name: "الكوثر", ayahs: 3 }, { name: "الكافرون", ayahs: 6 }, { name: "النصر", ayahs: 3 }, { name: "المسد", ayahs: 5 }, { name: "الإخلاص", ayahs: 4 }, { name: "الفلق", ayahs: 5 }, { name: "الناس", ayahs: 6 }] }
};

const StudentTracking: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('revision'); 
  const [selectedJuz, setSelectedJuz] = useState<number>(30);
  
  const [selectedSurah, setSelectedSurah] = useState<{name: string, ayahs: number} | null>(null);
  const [ayahRange, setAyahRange] = useState<{from: number | null, to: number | null}>({ from: null, to: null });

  // حقول الرصد
  const [evalGrade, setEvalGrade] = useState('ممتاز');
  const [evalStatus, setEvalStatus] = useState('مقبول'); 
  const [evalNotes, setEvalNotes] = useState('');
  const [targetRevisionDate, setTargetRevisionDate] = useState('');

  // حقول الفلترة في السجل الجانبي
  const [historyFilterDate, setHistoryFilterDate] = useState('');
  const [historyFilterType, setHistoryFilterType] = useState('all');

  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);

  // حالات المعاينة والطباعة
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [hijriDate, setHijriDate] = useState(getTodayHijri());
  const [gregorianDate, setGregorianDate] = useState(new Date().toISOString().split('T')[0]);

  const loadInitialData = async () => {
    if (studentId) {
      try {
        const [studentsData, logsData] = await Promise.all([
          db.students.getAll(),
          db.logs.getByStudent(studentId)
        ]);
        const found = studentsData.find(s => s.id === studentId);
        if (found) setStudent(found);
        setHistoryLogs(logsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [studentId]);

  // منطق الفلترة للسجل
  const filteredHistoryLogs = useMemo(() => {
    return historyLogs.filter(log => {
      const matchType = historyFilterType === 'all' || log.type === historyFilterType;
      const matchDate = !historyFilterDate || log.date_gregorian === historyFilterDate;
      return matchType && matchDate;
    });
  }, [historyLogs, historyFilterDate, historyFilterType]);

  const handleAyahClick = (num: number) => {
    if (ayahRange.from === null || (ayahRange.from !== null && ayahRange.to !== ayahRange.from)) {
      setAyahRange({ from: num, to: num });
    } else {
      const start = Math.min(ayahRange.from, num);
      const end = Math.max(ayahRange.from, num);
      setAyahRange({ from: start, to: end });
    }
  };

  const handleRecordAction = async () => {
    if (!selectedSurah || !ayahRange.from || !studentId) return;
    setRecording(true);
    const formattedHijri = `${hijriDate.day} ${hijriDate.month} ${hijriDate.year} هـ`;
    
    let typeRaw = '';
    let pointsToAward = 10;

    switch(activeTab) {
        case 'hifz': typeRaw = 'hifz'; pointsToAward = 20; break;
        case 'fixing': typeRaw = 'fixing'; pointsToAward = 15; break;
        case 'yesterday_hifz': typeRaw = 'yesterday_hifz'; pointsToAward = 10; break;
        default: typeRaw = 'revision'; pointsToAward = 12;
    }

    if (evalGrade === 'ممتاز') pointsToAward += 5;
    if (evalGrade === 'ضعيف') pointsToAward = 2;
    
    try {
        const newLog: any = {
            student_id: studentId,
            date_hijri: formattedHijri,
            date_gregorian: gregorianDate,
            type: typeRaw,
            surah_name: selectedSurah.name,
            ayah_from: ayahRange.from,
            ayah_to: ayahRange.to || ayahRange.from,
            notes: evalNotes,
            points_awarded: pointsToAward,
            target_revision_date: activeTab === 'revision' ? targetRevisionDate : null
        };

        if (['fixing', 'revision'].includes(activeTab)) {
            newLog.evaluation = evalGrade;
        }
        
        if (activeTab === 'yesterday_hifz') {
            newLog.status = evalStatus;
        }

        const savedLog = await db.logs.create(newLog);
        
        if (student) {
            await db.students.update(studentId, { points: (student.points || 0) + pointsToAward });
        }

        setHistoryLogs([savedLog, ...historyLogs]);
        alert('تم رصد الإنجاز بنجاح');
        
        setAyahRange({ from: null, to: null });
        setEvalNotes('');
        setTargetRevisionDate('');
        loadInitialData();
    } catch (err) {
        alert('فشل في رصد الإنجاز');
    } finally {
        setRecording(false);
    }
  };

  const exportFilteredReportPDF = () => {
    if (!student || filteredHistoryLogs.length === 0) {
      alert('لا توجد سجلات مطابقة للفلتر لتصديرها.');
      return;
    }

    const filterDateObj = historyFilterDate ? new Date(historyFilterDate) : new Date();
    const dayName = filterDateObj.toLocaleDateString('ar-EG', { weekday: 'long' });
    
    let displayDate = "";
    if (historyFilterDate) {
        const match = filteredHistoryLogs.find(l => l.date_gregorian === historyFilterDate);
        displayDate = match ? match.date_hijri.replace(' هـ', '') : historyFilterDate;
    } else {
        displayDate = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    const logsByDate = filteredHistoryLogs.reduce((acc: any, log) => {
        const date = log.date_hijri;
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {});

    const formatCurriculum = (log: any) => log ? `سورة ${log.surah_name} من ${log.ayah_from} إلى ${log.ayah_to}` : '---';
    const formatEval = (log: any) => log ? (log.evaluation || log.status || 'ممتاز') : '---';
    const formatNotes = (log: any) => log ? (log.notes || '---') : '---';

    const logoUrl = "https://mnaljojymprixuayzvnv.supabase.co/storage/v1/object/public/images/348228248_959701268554741_8922565608732474792_n.jpg";

    const content = `
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>${student.name} - تقرير متابعة</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: 'Tajawal', sans-serif; padding: 20px; color: #000; background: #fff; line-height: 1.4; }
            .report-title { color: red; font-size: 26px; font-weight: 900; text-align: center; margin-bottom: 25px; }
            .meta-info { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px; }
            .student-card { text-align: right; }
            .student-name { font-size: 22px; font-weight: 900; color: #000; margin-bottom: 5px; }
            .session-block { margin-bottom: 50px; page-break-inside: avoid; }
            .date-badge { display: inline-block; background: #000; color: #fff; padding: 5px 20px; border-radius: 5px; font-weight: 900; margin-bottom: 10px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 10px; }
            th, td { border: 1px solid black; padding: 10px; text-align: center; vertical-align: middle; }
            th { font-size: 13px; font-weight: 900; background: #f0f0f0; }
            td { font-size: 12px; font-weight: 700; word-wrap: break-word; }
            .header-cell { background: #f9fafb; font-weight: 900; width: 120px; }
            .footer { position: fixed; bottom: 10mm; left: 10mm; right: 10mm; font-size: 10px; color: #666; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="report-title">تقرير المتابعة اليومية عن يوم: ${dayName} (${displayDate})</div>
          
          <div class="meta-info">
             <div class="student-card">
                <div class="student-name">الطالب: ${student.name}</div>
                <div style="font-weight:700;">كود: ${student.student_number} | الفرع: ${student.branch}</div>
             </div>
             <div style="text-align:left;">
                <img src="${logoUrl}" style="width:70px; height:70px; border-radius:10px;" />
                <div style="font-size:12px; font-weight:900; margin-top:5px;">منصة تبصرة التعليمية</div>
             </div>
          </div>

          ${Object.keys(logsByDate).map(date => {
            const logs = logsByDate[date];
            const yesterdayHifz = logs.find((l:any) => l.type === 'yesterday_hifz');
            const newHifz = logs.find((l:any) => l.type === 'hifz');
            const fixing = logs.find((l:any) => l.type === 'fixing');
            const revision = logs.find((l:any) => l.type === 'revision');

            const dateDisplay = date.replace(' هـ', '');

            return `
              <div class="session-block">
                <div class="date-badge">تاريخ الحلقة: ${dateDisplay}</div>
                <table>
                  <thead>
                    <tr>
                      <th class="header-cell">المهمة</th>
                      <th>تسميع الواجب السابق</th>
                      <th>الواجب الجديد</th>
                      <th>المراجعة القريبة</th>
                      <th>المراجعة البعيدة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="header-cell">المقرر</td>
                      <td>${formatCurriculum(yesterdayHifz)}</td>
                      <td>${formatCurriculum(newHifz)}</td>
                      <td>${formatCurriculum(fixing)}</td>
                      <td>${formatCurriculum(revision)}</td>
                    </tr>
                    <tr>
                      <td class="header-cell">التقدير</td>
                      <td>${formatEval(yesterdayHifz)}</td>
                      <td>${formatEval(newHifz)}</td>
                      <td>${formatEval(fixing)}</td>
                      <td>${formatEval(revision)}</td>
                    </tr>
                    <tr>
                      <td class="header-cell">الملاحظات</td>
                      <td>${formatNotes(yesterdayHifz)}</td>
                      <td>${formatNotes(newHifz)}</td>
                      <td>${formatNotes(fixing)}</td>
                      <td>${formatNotes(revision)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}

          <div class="footer">
             <div>تم الاستخراج من نظام إدارة منصة تبصرة v2.5</div>
             <div>توقيع المشرف التعليمي: ...........................</div>
          </div>
        </body>
      </html>
    `;

    setPreviewHtml(content);
    setShowPreviewModal(true);
  };
  // ... rest of the file remains same
