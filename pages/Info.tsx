
import React from 'react';
import { Info, Award, Target, Heart, BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InfoPage: React.FC = () => {
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
          <h2 className="text-2xl font-black text-slate-800">معلومات عن منصة تبصرة</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">من نحن وما هي رسالتنا التعليمية</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-700 to-teal-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-3xl font-black mb-6 flex items-center">
            <Award className="ml-3 text-amber-400" size={32} />
            تأسيس جيل قرآني فريد
          </h3>
          <p className="text-lg text-emerald-50 leading-relaxed font-medium">
            منصة تبصرة ليست مجرد موقع رقمي، بل هي كيان تعليمي متكامل يجمع بين شرف تعليم كتاب الله عز وجل وبين أحدث الأساليب التربوية والتقنية الحديثة. نحن نؤمن بأن تعليم القرآن هو أعظم استثمار في الإنسان.
          </p>
        </div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center group hover:border-emerald-200 transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Target size={28} />
          </div>
          <h4 className="text-lg font-black text-slate-800 mb-3">رؤيتنا</h4>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">أن نكون النموذج الأول عالمياً في دمج التقنية الحديثة مع التعليم الشرعي الأصيل.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center group hover:border-emerald-200 transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <BookOpen size={28} />
          </div>
          <h4 className="text-lg font-black text-slate-800 mb-3">رسالتنا</h4>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">تيسير رحلة الحفظ والمراجعة من خلال أدوات ذكية تدعم المعلم وتحفز الطالب.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center group hover:border-emerald-200 transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Heart size={28} />
          </div>
          <h4 className="text-lg font-black text-slate-800 mb-3">قيمنا</h4>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">الإخلاص، الإتقان، الابتكار، والوسطية في المنهج التعليمي والتربوي.</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center">
          <Info size={24} className="ml-3 text-emerald-600" />
          تطور المنصة
        </h4>
        <div className="space-y-6">
          <div className="flex items-start space-x-4 space-x-reverse">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600 font-black shrink-0">١</div>
            <div>
              <h5 className="font-black text-slate-800">البداية المباركة</h5>
              <p className="text-sm text-slate-500 font-medium mt-1">انطلقنا كحلقة قرآنية في أحد مساجد الحي، ومع ازدياد الطلب بدأنا في رقمنة السجلات.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 space-x-reverse">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600 font-black shrink-0">٢</div>
            <div>
              <h5 className="font-black text-slate-800">إطلاق منصة تبصرة v2.5</h5>
              <p className="text-sm text-slate-500 font-medium mt-1">تم إطلاق هذا النظام لخدمة أكثر من ٥٠ مركزاً حول العالم، مدعوماً بالذكاء الاصطناعي لتطوير خطط الطلاب.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
