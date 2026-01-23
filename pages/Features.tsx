
import React from 'react';
import { 
  Zap, 
  BrainCircuit, 
  BarChart3, 
  BookOpen, 
  Smartphone, 
  Cloud, 
  ArrowRight,
  CheckCircle2,
  Trophy,
  LayoutDashboard,
  ShieldCheck,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const FeatureCard = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => (
  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${color}`}>
      <Icon size={32} />
    </div>
    <h3 className="text-xl font-black text-slate-800 mb-4">{title}</h3>
    <p className="text-slate-500 font-medium text-sm leading-relaxed">{desc}</p>
  </div>
);

const Features: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-right" dir="rtl">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-50">
        <div className="flex items-center space-x-3 space-x-reverse cursor-pointer" onClick={() => navigate('/landing')}>
          <Logo size={60} />
          <span className="text-xl font-black text-slate-800 tracking-tighter mr-2">منصة تبصرة</span>
        </div>
        <button 
          onClick={() => navigate('/landing')}
          className="flex items-center text-slate-400 font-bold hover:text-blue-700 transition-colors"
        >
          العودة للرئيسية
          <ArrowRight size={20} className="mr-2" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 pt-20 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full border border-white/20 mb-8 backdrop-blur-md">
            <Zap size={16} className="text-amber-400 ml-2" />
            <span className="text-white text-xs font-black uppercase tracking-widest">لماذا تختار منصة تبصرة؟</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
            نظام متكامل يجمع بين <br />
            <span className="text-blue-300">الأصالة والتقنية الحديثة</span>
          </h1>
          <p className="text-blue-100/70 text-lg font-medium max-w-2xl mx-auto mb-4">
            تم تصميم منصتنا لتلبي احتياجات مراكز القرآن والعلوم الشرعية بأعلى معايير الجودة التقنية والتربوية.
          </p>
        </div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </section>

      {/* Main Features Grid */}
      <section className="max-w-7xl mx-auto mt-12 px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={BrainCircuit}
            title="المساعد الذكي (AI)"
            desc="توليد خطط دراسية مخصصة لكل طالب بناءً على مستواه وقدراته باستخدام تقنيات Gemini المتطورة."
            color="bg-indigo-50 text-indigo-600"
          />
          <FeatureCard 
            icon={Cloud}
            title="تخزين سحابي آمن"
            desc="بيانات مركزك في أمان تام مع Supabase، وصول سريع من أي مكان وفي أي وقت مع نسخ احتياطي دوري."
            color="bg-emerald-50 text-emerald-600"
          />
          <FeatureCard 
            icon={BarChart3}
            title="تقارير تحليلية شاملة"
            desc="لوحات معلومات تفاعلية توضح تقدم الطلاب، أداء المعلمين، ومعدلات الإنجاز في الحلقات بدقة عالية."
            color="bg-blue-50 text-blue-600"
          />
          <FeatureCard 
            icon={LayoutDashboard}
            title="واجهة إدارة سهلة"
            desc="تصميم عصري وبسيط يسهل على المشرفين والمعلمين إدارة الحلقات والطلاب دون تعقيد تقني."
            color="bg-slate-100 text-slate-700"
          />
          <FeatureCard 
            icon={Trophy}
            title="نظام التحفيز والجوائز"
            desc="تتبع نقاط الطلاب، الأوسمة، وقوائم المتصدرين لخلق بيئة تنافسية إيجابية تشجع على الحفظ."
            color="bg-amber-50 text-amber-600"
          />
          <FeatureCard 
            icon={Smartphone}
            title="متوافق مع جميع الأجهزة"
            desc="يعمل النظام بكفاءة عالية على الحواسيب، الأجهزة اللوحية، والهواتف الذكية بفضل التصميم المرن."
            color="bg-rose-50 text-rose-600"
          />
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto space-y-32">
          {/* Section 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <BookOpen size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-6">إدارة الحلقات والبرامج الشرعية</h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                نوفر نظاماً متكاملاً لإدارة الحلقات القرآنية، ابتداءً من تسجيل الطلاب وتوزيعهم على الحلقات، وصولاً إلى إدارة المناهج الشرعية وتوليد الاختبارات الآلية لكل مادة.
              </p>
              <ul className="space-y-4">
                {['توزيع آلي للطلاب على الحلقات', 'متابعة يومية للحضور والغياب', 'توليد اختبارات ذكية لكل مادة', 'مكتبة مراجع علمية مقترحة'].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-700 font-bold">
                    <CheckCircle2 size={20} className="ml-3 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 rounded-[3rem] p-12 flex items-center justify-center border border-slate-100 shadow-inner">
               <div className="relative">
                  <div className="absolute -inset-4 bg-blue-200/20 rounded-[2.5rem] blur-xl"></div>
                  <Logo size={200} className="relative z-10" />
               </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
             <div className="order-2 lg:order-1 bg-gradient-to-br from-indigo-700 to-blue-800 rounded-[3rem] p-12 text-white shadow-2xl">
                <div className="space-y-6">
                   <div className="bg-white/10 p-4 rounded-2xl inline-block backdrop-blur-md">
                      <Star size={32} className="text-amber-400 fill-amber-400" />
                   </div>
                   <h3 className="text-2xl font-black">تجربة تعليمية فريدة</h3>
                   <p className="text-blue-50/80 font-medium leading-relaxed">
                      نهدف من خلال منصة تبصرة إلى تقليل الأعباء الإدارية على المعلم، ليتفرغ تماماً لمهمته الأسمى وهي تعليم القرآن وتوجيه الطلاب تربوياً.
                   </p>
                   <div className="grid grid-cols-2 gap-4 pt-6">
                      <div className="bg-white/10 p-4 rounded-2xl">
                         <span className="text-2xl font-black block">100%</span>
                         <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">دقة البيانات</span>
                      </div>
                      <div className="bg-white/10 p-4 rounded-2xl">
                         <span className="text-2xl font-black block">24/7</span>
                         <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">توفر النظام</span>
                      </div>
                   </div>
                </div>
             </div>
             <div className="order-1 lg:order-2">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-6">الخصوصية والأمان أولاً</h2>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                  نحن ندرك أهمية بيانات الطلاب والمركز، لذلك قمنا ببناء نظام صلاحيات دقيق يضمن وصول كل مستخدم للمعلومات المسموح له بها فقط، مع تشفير كامل لجميع البيانات الحساسة.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-blue-700 rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-200">
           <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-black mb-8">هل أنت جاهز لتطوير مركزك؟</h2>
              <p className="text-blue-100 text-lg font-medium mb-12 max-w-xl mx-auto">
                انضم إلى المراكز القرآنية التي تعتمد على منصة تبصرة في إدارة مسيرتهم التعليمية.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                 <button onClick={() => navigate('/landing#contact-section')} className="w-full sm:w-auto bg-white text-blue-700 px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl hover:scale-105 transition-all">تواصل مع الدعم</button>
              </div>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 text-center text-slate-400 font-bold text-sm">
        <p>© ٢٠٢٤ منصة تبصرة التعليمية. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
};

export default Features;
