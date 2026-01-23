
import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center space-x-4 space-x-reverse mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-emerald-600 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800">سياسة الخصوصية</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">كيف نحمي بيانات طلابنا ومعلمينا</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Lock size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-800">تشفير البيانات</h4>
                <p className="text-sm text-slate-500 font-medium mt-1">تستخدم منصة تبصرة بروتوكولات تشفير متقدمة لحماية كلمات المرور والبيانات الحساسة من الوصول غير المصرح به.</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <EyeOff size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-800">خصوصية الطالب</h4>
                <p className="text-sm text-slate-500 font-medium mt-1">بيانات الطالب الشخصية ومعدلات حفظه تظهر فقط لمعلمه المباشر ولإدارة المركز، ولا يتم مشاركتها مع أي طرف ثالث.</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Server size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-800">تخزين سحابي آمن</h4>
                <p className="text-sm text-slate-500 font-medium mt-1">نعتمد على تقنيات Supabase السحابية التي تضمن أعلى معايير الأمان العالمية مع نسخ احتياطي دوري للبيانات.</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-800">صلاحيات المستخدمين</h4>
                <p className="text-sm text-slate-500 font-medium mt-1">يعمل النظام بنظام صلاحيات صارم (RBAC) يضمن أن كل مستخدم يصل فقط للبيانات التي يحتاجها لأداء عمله.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-50">
          <h4 className="font-black text-slate-800 mb-4">ما هي البيانات التي نجمعها؟</h4>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-500 font-medium pr-4">
            <li>المعلومات التعريفية (الاسم، العمر، المستوى التعليمي).</li>
            <li>سجلات الحضور والغياب اليومية.</li>
            <li>بيانات التقدم في الحفظ والمراجعة والاختبارات.</li>
            <li>ملاحظات المعلمين التربوية حول أداء الطلاب.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
