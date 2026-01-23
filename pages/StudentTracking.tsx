
import React, { useState, useEffect, useMemo } from 'react';
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
  Save, 
  ArrowRightLeft, 
  History, 
  Clock, 
  ChevronDown, 
  Trash2, 
  Printer, 
  Search, 
  Filter,
  X,
  FileText,
  Star
} from 'lucide-react';
import { db } from '../services/supabase';

const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

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
  26: { name: "الجزء السادس والعشرون", surahs: [{ name: "الأحقاف", ayahs: 35 }, { name: "محمد", ayahs: 38 }, { name: "الفتح", ayahs: 29 }, { name: "الحجرات", ayahs: 18 }, { name: "ق", ayahs: 45 }, { name: "الذاريات (١-٣٠)", ayahs: 30 }] },
  27: { name: "الجزء السابع والعشرون", surahs: [{ name: "الذاريات (٣١-٦٠)", ayahs: 30 }, { name: "الطور", ayahs: 49 }, { name: "النجم", ayahs: 62 }, { name: "القمر", ayahs: 55 }, { name: "الرحمن", ayahs: 78 }, { name: "الواقعة", ayahs: 96 }, { name: "الحديد", ayahs: 29 }] },
  28: { name: "الجزء الثامن والعشرون", surahs: [{ name: "المجادلة", ayahs: 22 }, { name: "الحشر", ayahs: 24 }, { name: "الممتحنة", ayahs: 13 }, { name: "الصف", ayahs: 14 }, { name: "الجمعة", ayahs: 11 }, { name: "المنافقون", ayahs: 11 }, { name: "التغابن", ayahs: 18 }, { name: "الطلاق", ayahs: 12 }, { name: "التحريم", ayahs: 12 }] },
  29: { name: "الجزء التاسع والعشرون", surahs: [{ name: "الملك", ayahs: 30 }, { name: "القلم", ayahs: 52 }, { name: "الحاقة", ayahs: 52 }, { name: "المعارج", ayahs: 44 }, { name: "نوح", ayahs: 28 }, { name: "الجن", ayahs: 28 }, { name: "المزمل", ayahs: 20 }, { name: "المدثر", ayahs: 56 }, { name: "القيامة", ayahs: 40 }, { name: "الإنسان", ayahs: 31 }, { name: "المرسلات", ayahs: 50 }] },
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
        setHistoryLogs(logsData || []);
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
            .report-title { color: #1e40af; font-size: 26px; font-weight: 900; text-align: center; margin-bottom: 25px; }
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

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    try {
      await db.logs.delete(logId);
      setHistoryLogs(prev => prev.filter(l => l.id !== logId));
    } catch (error) {
      alert('فشل الحذف');
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black text-xs uppercase tracking-widest">جاري تحميل سجل الطالب...</p>
    </div>
  );

  if (!student) return <div className="text-center py-20">الطالب غير موجود</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm">
         <div className="flex items-center space-x-6 space-x-reverse">
            <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-blue-600 transition-colors">
               <ChevronRight size={24} />
            </button>
            
            <div className="flex items-center space-x-4 space-x-reverse">
               <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-200">
                  {student.name[0]}
               </div>
               <div>
                  <h2 className="text-2xl font-black text-slate-800">{student.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                     <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-xs font-black border border-amber-100 flex items-center">
                        <Zap size={12} className="ml-1" /> {student.points} نقطة
                     </span>
                     <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-black border border-emerald-100 flex items-center">
                        <Award size={12} className="ml-1" /> {student.total_memorized} أجزاء
                     </span>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-2 border border-slate-100">
               <Calendar size={16} className="text-slate-400 ml-2" />
               <span className="text-xs font-black text-slate-600">{hijriDate.day} {hijriDate.month} {hijriDate.year} هـ</span>
            </div>
            <button onClick={exportFilteredReportPDF} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center shadow-lg hover:bg-slate-800 transition-all">
               <Printer size={16} className="ml-2" />
               تقرير المتابعة
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Main Tracking Area */}
         <div className="xl:col-span-2 space-y-6">
            
            {/* Tabs */}
            <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
               {[
                 { id: 'revision', label: 'المراجعة البعيدة', icon: History },
                 { id: 'fixing', label: 'المراجعة القريبة', icon: Check },
                 { id: 'yesterday_hifz', label: 'واجب الأمس', icon: ArrowRightLeft },
                 { id: 'hifz', label: 'الحفظ الجديد', icon: BookOpen },
               ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setAyahRange({from: null, to: null}); setSelectedSurah(null); }}
                    className={`flex-1 flex items-center justify-center px-4 py-4 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap ${
                       activeTab === tab.id 
                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                       : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                     <tab.icon size={16} className="ml-2" />
                     {tab.label}
                  </button>
               ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-8">
               
               {/* Juz Selection */}
               <div className="mb-8">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">اختر الجزء</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                     {Array.from({length: 30}, (_, i) => i + 1).reverse().map(j => (
                        <button
                           key={j}
                           onClick={() => { setSelectedJuz(j); setSelectedSurah(null); }}
                           className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                              selectedJuz === j ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-blue-50'
                           }`}
                        >
                           {j}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Surah Selection */}
               {selectedJuz && (
                  <div className="mb-8 animate-in fade-in slide-in-from-right-4">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">سور الجزء {selectedJuz}</label>
                     <div className="flex flex-wrap gap-3">
                        {(QURAN_DATA[selectedJuz] || { surahs: [] }).surahs.map((surah: any) => (
                           <button
                              key={surah.name}
                              onClick={() => { setSelectedSurah(surah); setAyahRange({from: null, to: null}); }}
                              className={`px-5 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                                 selectedSurah?.name === surah.name 
                                 ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                 : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'
                              }`}
                           >
                              {surah.name}
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {/* Ayah Selection Grid */}
               {selectedSurah && (
                  <div className="mb-8 animate-in fade-in slide-in-from-bottom-4">
                     <div className="flex items-center justify-between mb-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">تحديد الآيات ({selectedSurah.ayahs} آية)</label>
                        {ayahRange.from && (
                           <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black">
                              من {ayahRange.from} إلى {ayahRange.to || ayahRange.from}
                           </span>
                        )}
                     </div>
                     <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-2 bg-slate-50 rounded-3xl border border-slate-100">
                        {Array.from({ length: selectedSurah.ayahs }, (_, i) => i + 1).map(num => {
                           const isSelected = ayahRange.from && ayahRange.to && num >= ayahRange.from && num <= ayahRange.to;
                           return (
                              <button
                                 key={num}
                                 onClick={() => handleAyahClick(num)}
                                 className={`aspect-square rounded-lg text-[10px] font-bold transition-all ${
                                    isSelected 
                                    ? 'bg-blue-600 text-white shadow-sm scale-105' 
                                    : 'bg-white text-slate-400 hover:bg-blue-100 hover:text-blue-600'
                                 }`}
                              >
                                 {num}
                              </button>
                           );
                        })}
                     </div>
                  </div>
               )}

               {/* Evaluation & Submit */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">التقييم</label>
                        <div className="flex flex-wrap gap-2">
                           {['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'ضعيف'].map(g => (
                              <button
                                 key={g}
                                 onClick={() => setEvalGrade(g)}
                                 className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${
                                    evalGrade === g 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                    : 'bg-white border-slate-100 text-slate-400'
                                 }`}
                              >
                                 {g}
                              </button>
                           ))}
                        </div>
                     </div>
                     
                     <div className="relative">
                        <FileText className="absolute right-3 top-3 text-slate-300" size={14} />
                        <textarea 
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-10 pl-4 py-3 text-xs font-bold outline-none resize-none h-20 focus:bg-white focus:border-blue-200 transition-all"
                           placeholder="ملاحظات المعلم..."
                           value={evalNotes}
                           onChange={e => setEvalNotes(e.target.value)}
                        />
                     </div>
                  </div>

                  <div className="flex flex-col justify-end">
                     <button 
                        onClick={handleRecordAction}
                        disabled={recording || !selectedSurah || !ayahRange.from}
                        className="w-full bg-slate-900 text-white py-4 rounded-[2rem] font-black text-sm shadow-xl flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {recording ? <Loader2 className="animate-spin ml-2" size={18} /> : <Check className="ml-2" size={18} />}
                        رصد واعتماد النتيجة
                     </button>
                  </div>
               </div>

            </div>
         </div>

         {/* Sidebar History */}
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center">
                  <Filter size={16} className="ml-2 text-blue-500" /> تصفية السجل
               </h3>
               <div className="space-y-3">
                  <input 
                     type="date" 
                     className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none"
                     value={historyFilterDate}
                     onChange={e => setHistoryFilterDate(e.target.value)}
                  />
                  <select 
                     className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none cursor-pointer"
                     value={historyFilterType}
                     onChange={e => setHistoryFilterType(e.target.value)}
                  >
                     <option value="all">كل العمليات</option>
                     <option value="hifz">حفظ جديد</option>
                     <option value="revision">مراجعة</option>
                     <option value="yesterday_hifz">تسميع أمس</option>
                  </select>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
               <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                  <h3 className="text-sm font-black text-slate-800 flex items-center">
                     <History size={16} className="ml-2 text-amber-500" />
                     سجل الإنجازات
                  </h3>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {filteredHistoryLogs.length === 0 ? (
                     <div className="text-center py-10 text-slate-300 text-xs font-bold">لا توجد سجلات مطابقة</div>
                  ) : (
                     filteredHistoryLogs.map(log => (
                        <div key={log.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group relative">
                           <div className="flex justify-between items-start mb-2">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                                 log.type === 'hifz' ? 'bg-emerald-100 text-emerald-700' : 
                                 log.type === 'revision' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                 {log.type === 'hifz' ? 'حفظ' : log.type === 'revision' ? 'مراجعة' : 'تسميع'}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400">{log.date_gregorian}</span>
                           </div>
                           
                           <h4 className="text-xs font-black text-slate-800 mb-1">
                              سورة {log.surah_name} <span className="text-slate-400 font-normal">({log.ayah_from} - {log.ayah_to})</span>
                           </h4>
                           
                           <div className="flex justify-between items-center mt-2">
                              <span className="text-[10px] font-bold text-slate-500 flex items-center">
                                 <Star size={10} className="ml-1 text-amber-400 fill-amber-400" />
                                 {log.evaluation || log.status}
                              </span>
                              <button onClick={() => handleDeleteLog(log.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Trash2 size={12} />
                              </button>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewHtml && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowPreviewModal(false)}></div>
            <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden h-[90vh] flex flex-col">
               <div className="p-4 bg-slate-100 border-b flex justify-between items-center">
                  <h3 className="font-black text-slate-800">معاينة التقرير</h3>
                  <button onClick={() => setShowPreviewModal(false)} className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-rose-500"><X size={20}/></button>
               </div>
               <iframe className="flex-1 w-full bg-white" srcDoc={previewHtml} title="Preview" />
            </div>
         </div>
      )}
    </div>
  );
};

export default StudentTracking;
