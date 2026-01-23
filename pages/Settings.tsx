
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  BookOpen, 
  Bell, 
  ShieldCheck, 
  Save, 
  Check, 
  Loader2, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  FileText, 
  Printer, 
  FileDown, 
  ShieldAlert, 
  Zap, 
  Star, 
  ToggleLeft, 
  ToggleRight, 
  Stamp, 
  BadgeCheck, 
  Award, 
  ChevronLeft, 
  Smartphone, 
  Cloud, 
  Headphones, 
  History, 
  Lock, 
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/supabase';

interface SettingsPageProps {
  user?: any;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'educational' | 'notifications' | 'security' | 'contract'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // إعدادات المركز العامة
  const [centerName, setCenterName] = useState(() => {
    return localStorage.getItem('dawood_center_name') || 'El Centro de Mirar';
  });

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('dawood_center_name', centerName);
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  // ... exportContractPDF updated with El Centro de Mirar ...
  const exportContractPDF = () => {
    setIsExporting(true);
    const logoUrl = "https://mnaljojymprixuayzvnv.supabase.co/storage/v1/object/public/images/348228248_959701268554741_8922565608732474792_n.jpg";
    const today = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
    const contractNo = `MIRAR-${Math.floor(Math.random() * 90000) + 10000}`;

    const content = `
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>معاينة عقد خدمة - ${centerName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            @page { size: A4; margin: 15mm; }
            body { 
              font-family: 'Tajawal', sans-serif; 
              padding: 20px; 
              color: #1e293b; 
              background: #f1f5f9; 
              line-height: 1.8;
              -webkit-print-color-adjust: exact;
              font-size: 14px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .no-print-zone {
                width: 100%;
                max-width: 800px;
                background: #1e40af;
                color: white;
                padding: 15px 25px;
                border-radius: 15px;
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            }
            .btn-print {
                background: white;
                color: #1e40af;
                border: none;
                padding: 10px 20px;
                border-radius: 10px;
                font-weight: 900;
                cursor: pointer;
                font-family: 'Tajawal';
            }
            .contract-border {
              background: white;
              width: 210mm;
              min-height: 297mm;
              border: 3px double #1e40af;
              padding: 40px;
              position: relative;
              box-sizing: border-box;
              box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
            }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-img { width: 80px; height: 80px; border-radius: 15px; }
            .title-box { text-align: center; flex: 1; }
            .title-box h1 { margin: 0; font-size: 24px; font-weight: 900; color: #1e40af; }
            
            .party-section { margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 12px; border-right: 5px solid #1e40af; }
            .party-title { font-weight: 900; color: #1e40af; margin-bottom: 5px; }
            
            .section-header { font-weight: 900; font-size: 16px; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            
            .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .feature-item { font-size: 12px; border-right: 3px solid #10b981; padding-right: 10px; background: #f0fdf4; padding: 8px; border-radius: 4px; font-weight: 700; }
            
            .signature-area { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-start; }
            .signature-box { text-align: center; width: 45%; }
            
            .stamp-wrapper {
                position: relative;
                width: 150px;
                height: 150px;
                margin: 0 auto;
                transform: rotate(-12deg);
            }
            .stamp-outer {
                width: 100%;
                height: 100%;
                border: 4px double #1e40af;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            .stamp-inner {
                width: 85%;
                height: 85%;
                border: 2px solid #1e40af;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .stamp-text-top { font-size: 9px; font-weight: 900; color: #1e40af; position: absolute; top: 12px; width: 100%; text-align: center; }
            .stamp-text-bottom { font-size: 9px; font-weight: 900; color: #1e40af; position: absolute; bottom: 12px; width: 100%; text-align: center; }
            .stamp-center { font-size: 13px; font-weight: 900; color: #1e40af; border-top: 1px solid #1e40af; border-bottom: 1px solid #1e40af; padding: 2px 5px; margin: 5px 0; }
            .certified-tag { font-size: 8px; font-weight: 900; color: #10b981; text-transform: uppercase; letter-spacing: 1px; }

            .footer-info { position: absolute; bottom: 20px; width: 100%; text-align: center; font-size: 10px; color: #94a3b8; font-weight: bold; right: 0;}
            
            @media print {
                .no-print-zone { display: none; }
                body { background: white; padding: 0; }
                .contract-border { box-shadow: none; border: 3px double #1e40af; width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="no-print-zone">
             <div style="font-weight:900">معاينة العقد الرسمي - يرجى المراجعة ثم الحفظ</div>
             <button class="btn-print" onclick="window.print()">طباعة أو حفظ كـ PDF</button>
          </div>

          <div class="contract-border">
            <div class="header">
              <img src="${logoUrl}" class="logo-img" />
              <div class="title-box">
                <h1>عقد توريد وتشغيل نظام إدارة El Centro de Mirar</h1>
                <p style="font-size:12px; margin-top:5px; color:#64748b;">رقم الاتفاقية: ${contractNo} | التاريخ: ${today}</p>
              </div>
              <div style="width: 80px; text-align: left; font-size: 10px; font-weight: 900; color: #1e40af;">Software Gates<br/>Official Doc</div>
            </div>

            <div class="party-section">
              <div class="party-title">الطرف الأول (المزود):</div>
              <div>شركة <b>سوفت وير جيتس (Software Gates)</b> للحلول البرمجية والتحول الرقمي.</div>
            </div>

            <div class="party-section">
              <div class="party-title">الطرف الثاني (العميل):</div>
              <div>مركز: <b>${centerName}</b> - فرع الإدارة العامة.</div>
            </div>

            <div class="section-header">أولاً: موضوع العقد</div>
            <p>يقر الطرف الأول بمنح الطرف الثاني رخصة تشغيل نظام "El Centro de Mirar" لإدارة المراكز التعليمية، وهو نظام سحابي متكامل يهدف لأتمتة العمليات التعليمية والمالية والإدارية.</p>

            <div class="section-header">ثانياً: الخصائص والمميزات المعتمدة</div>
            <div class="features-grid">
              <div class="feature-item">✓ نظام تتبع الحفظ والمراجعة (بالتاريخ الهجري والميلادي).</div>
              <div class="feature-item">✓ وحدة الذكاء الاصطناعي (Gemini AI) لتوليد الخطط الدراسية.</div>
              <div class="feature-item">✓ إدارة مصفوفة الصلاحيات المتقدمة للمستخدمين.</div>
              <div class="feature-item">✓ النظام المالي الشامل (خزينة، رواتب، اشتراكات، مصروفات).</div>
              <div class="feature-item">✓ لوحة إنجازات الطلاب والمعلمين (نظام النقاط والأوسمة).</div>
              <div class="feature-item">✓ تقارير أداء تحليلية ورسوم بيانية ذكية (BI).</div>
              <div class="feature-item">✓ مخزن المناهج والكتب وتتبع المبيعات.</div>
              <div class="feature-item">✓ إدارة المحتوى المرئي (Video Gallery Management).</div>
            </div>

            <div class="section-header">ثالثاً: الدعم الفني والضمان</div>
            <p>يلتزم الطرف الأول بتقديم دعم فني تقني شامل على مدار <b>24 ساعة يومياً</b> لمدة <b>12 شهراً</b> من تاريخ التفعيل، يشمل ذلك التحديثات الدورية للنظام وحل المشكلات التقنية وتدريب الكوادر.</p>

            <div class="signature-area">
              <div class="signature-box">
                <div style="font-weight: 900; margin-bottom: 10px;">توقيع الطرف الثاني (العميل)</div>
                <div style="height: 100px; border-bottom: 1px dashed #cbd5e1;"></div>
              </div>
              
              <div class="signature-box">
                <div style="font-weight: 900; margin-bottom: 10px;">توقيع وختم الطرف الأول (المزود)</div>
                <div class="stamp-wrapper">
                   <div class="stamp-outer">
                      <div class="stamp-text-top">SOFTWARE GATES • سوفت وير جيتس</div>
                      <div class="stamp-inner">
                         <div class="certified-tag">CERTIFIED</div>
                         <div class="stamp-center">مـعـتـمـد</div>
                         <div style="font-size: 7px; color: #1e40af; font-weight: 900;">OFFICIAL STAMP</div>
                      </div>
                      <div class="stamp-text-bottom">QUALITY ASSURED • ٢٠٢٤</div>
                   </div>
                </div>
                <div style="margin-top: 10px; font-weight: 900; color: #1e40af;">المدير التنفيذي لـ Software Gates</div>
              </div>
            </div>

            <div class="footer-info">
              تم إصدار هذا المستند آلياً من نظام إدارة El Centro de Mirar v2.5 © ٢٠٢٤ - مدعوم من شركة سوفت وير جيتس
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      setIsExporting(false);
    } else {
      alert('يرجى السماح بفتح النوافذ المنبثقة (Pop-ups) لمشاهدة العقد');
      setIsExporting(false);
    }
  };

  // ... rest of the file ...
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <SettingsIcon className="ml-3 text-slate-400" size={32} />
            إعدادات النظام والمركز
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">تخصيص هوية المنصة والقواعد التعليمية</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm flex items-center shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin ml-2" size={20} /> : <Save className="ml-2" size={20} />}
          {saveSuccess ? 'تم الحفظ بنجاح!' : 'حفظ كافة الإعدادات'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'general', label: 'الإعدادات العامة', icon: Building2 },
            { id: 'educational', label: 'القواعد التعليمية', icon: BookOpen },
            { id: 'contract', label: 'عقد الخدمة والضمان', icon: BadgeCheck },
            { id: 'notifications', label: 'نظام التنبيهات', icon: Bell },
            { id: 'security', label: 'الأمان والوصول', icon: ShieldCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 space-x-reverse p-4 rounded-2xl transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-700 text-white shadow-lg shadow-blue-100 scale-[1.02]' 
                : 'text-slate-500 hover:bg-white hover:text-blue-700'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-black text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[500px] animate-in fade-in slide-in-from-left-4 duration-500">
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div className="border-b border-slate-50 pb-6">
                  <h3 className="text-xl font-black text-slate-800">هوية المركز</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase">تعديل المسمى والشعار العام للمؤسسة</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم المركز الرسمي</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      value={centerName}
                      onChange={(e) => setCenterName(e.target.value)}
                    />
                  </div>
                  {/* ... rest of tab ... */}
                </div>
              </div>
            )}
            {/* ... other tabs ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
