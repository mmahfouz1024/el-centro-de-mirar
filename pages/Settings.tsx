
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  BookOpen, 
  Bell, 
  ShieldCheck, 
  Save, 
  Loader2, 
  BadgeCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
            body { font-family: 'Tajawal', sans-serif; padding: 20px; color: #1e293b; background: #fff; line-height: 1.8; font-size: 14px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 20px; }
            h1 { color: #1e40af; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; color: #1e40af; font-size: 16px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoUrl}" width="80" />
            <h1>عقد توريد وتشغيل نظام ${centerName}</h1>
            <p>رقم العقد: ${contractNo} | التاريخ: ${today}</p>
          </div>
          <div class="section">
            <div class="section-title">مقدمة</div>
            <p>تم الاتفاق بين الطرف الأول (Software Gates) والطرف الثاني (${centerName}) على تشغيل نظام إدارة المركز.</p>
          </div>
          <div class="section">
             <p>نقر نحن، إدارة ${centerName}، بصحة البيانات المدخلة ومسؤوليتنا الكاملة عنها.</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      setTimeout(() => {
          printWindow.print();
          setIsExporting(false);
      }, 500);
    } else {
      alert('يرجى السماح بفتح النوافذ المنبثقة');
      setIsExporting(false);
    }
  };

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
                </div>
              </div>
            )}
            
            {activeTab === 'contract' && (
                <div className="space-y-8">
                    <div className="border-b border-slate-50 pb-6">
                        <h3 className="text-xl font-black text-slate-800">عقد الخدمة والترخيص</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase">مراجعة وطباعة عقد التشغيل</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-10 space-y-6">
                        <BadgeCheck size={64} className="text-emerald-500" />
                        <p className="text-center text-slate-500 font-bold max-w-md">يمكنك طباعة أو حفظ نسخة من عقد الترخيص الخاص بمركز {centerName} للأغراض الرسمية.</p>
                        <button 
                            onClick={exportContractPDF}
                            disabled={isExporting}
                            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all flex items-center"
                        >
                            {isExporting ? <Loader2 className="animate-spin ml-2" /> : <Save className="ml-2" />}
                            تحميل نسخة العقد PDF
                        </button>
                    </div>
                </div>
            )}

            {/* Placeholder for other tabs */}
            {['educational', 'notifications', 'security'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 py-20">
                    <SettingsIcon size={48} className="mb-4 opacity-20" />
                    <p className="font-bold">إعدادات {activeTab} قيد التطوير</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
