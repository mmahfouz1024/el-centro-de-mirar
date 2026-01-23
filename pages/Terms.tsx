
import React from 'react';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms: React.FC = () => {
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
          <h2 className="text-2xl font-black text-slate-800">الشروط والأحكام</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">ضوابط استخدام نظام منصة تبصرة التعليمي</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center space-x-3 space-x-reverse pb-6 border-b border-slate-50">
          <AlertCircle size={24} className="text-emerald-600" />
          <h3 className="text-lg font-black text-slate-800">اتفاقية الاستخدام للعام ٢٠٢٤</h3>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h4 className="font-black text-slate-800 flex items-center">
              <CheckCircle2 size={16} className="ml-2 text-emerald-500" />
              أولاً: الاستخدام المشروع
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              يلتزم المعلم باستخدام المنصة فقط للأغراض التعليمية والتربوية المخصصة لها، ويُمنع استخدامها في أي مراسلات خارج نطاق العمل أو لأغراض شخصية.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-black text-slate-800 flex items-center">
              <CheckCircle2 size={16} className="ml-2 text-emerald-500" />
              ثانياً: دقة البيانات ورصد الدرجات
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              تقع مسؤولية دقة رصد الحفظ والمراجعة والحضور على عاتق المعلم المشرف على الحلقة مباشرة، ويجب تحري الأمانة في الرصد لضمان تقارير صحيحة للإدارة وأولياء الأمور.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-black text-slate-800 flex items-center">
              <CheckCircle2 size={16} className="ml-2 text-emerald-500" />
              ثالثاً: ملكية المحتوى
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              تعتبر جميع المناهج والخطط الدراسية المولدة عبر النظام ملكية فكرية للمنصة، ولا يجوز نسخها أو إعادة توزيعها خارج نطاق منصة تبصرة دون إذن خطي.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-black text-slate-800 flex items-center">
              <CheckCircle2 size={16} className="ml-2 text-emerald-500" />
              رابعاً: التحديثات والصيانة
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              تحتفظ المنصة بحقها في إجراء تحديثات دورية على النظام، وقد يتوقف العمل جزئياً لفترات قصيرة لإجراء عمليات الصيانة اللازمة لضمان أفضل أداء.
            </p>
          </section>
        </div>

        <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
            باستخدامك لهذا النظام، فإنك تقر بموافقتك الكاملة على جميع البنود الواردة أعلاه. يتم تحديث هذه الشروط دورياً ويتم إخطار المستخدمين بأي تغييرات جوهرية.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
