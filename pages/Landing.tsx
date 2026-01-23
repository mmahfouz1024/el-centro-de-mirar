
import React, { useEffect } from 'react';
import { 
  Zap, 
  Star, 
  LogIn, 
  Facebook, 
  MapPin, 
  MessageCircle,
  ChevronLeft, 
  ShieldCheck,
  BookOpen,
  PhoneCall,
  Globe,
  Sparkles,
  PlayCircle,
  ArrowDown
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#contact-section') {
      setTimeout(() => {
        const section = document.getElementById('contact-section');
        section?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [location]);

  const scrollToContact = () => {
    const section = document.getElementById('contact-section');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Tajawal'] overflow-x-hidden" dir="rtl">
      {/* Glass Navigation */}
      <nav className="fixed w-full z-50 top-0 left-0 transition-all duration-300">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm"></div>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3 space-x-reverse cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-700">
               <Logo size={50} />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight hidden sm:block group-hover:text-emerald-700 transition-colors">El Centro de Mirar</span>
          </div>
          
          <div className="flex items-center space-x-3 lg:space-x-4 space-x-reverse">
            <div className="hidden md:flex items-center space-x-2 space-x-reverse ml-4 pl-4 border-l border-slate-200">
               <a href="https://wa.me/201147300322" target="_blank" className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/30">
                 <MessageCircle size={18} className="animate-wiggle" />
               </a>
               <a href="https://www.facebook.com/share/1Z69rEUt7f/" target="_blank" className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30">
                 <Facebook size={18} />
               </a>
            </div>

            <button onClick={() => navigate('/about')} className="text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors hidden sm:block">من نحن</button>
            <button onClick={scrollToContact} className="text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors hidden sm:block">تواصل معنا</button>

            <button onClick={() => navigate('/login')} className="flex items-center bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-3 rounded-full font-black text-xs hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all active:scale-95 group">
              <LogIn size={16} className="ml-2 group-hover:animate-pulse" />
              الدخول للنظام
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-48 pb-32 px-6 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none animate-pulse-glow"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 to-orange-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none animate-float-slow"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-right">
            <div className="inline-flex items-center space-x-2 space-x-reverse bg-white border border-slate-100 px-4 py-2 rounded-full mb-8 shadow-sm animate-in slide-in-from-bottom-4 duration-700 hover:shadow-md transition-shadow cursor-default">
              <Star size={16} className="text-amber-500 fill-amber-500 animate-spin-slow" />
              <span className="text-slate-600 text-xs font-bold uppercase tracking-widest">أكاديمية تعليمية متخصصة</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[1.1] mb-8 animate-in slide-in-from-bottom-6 duration-1000">
              <span className="block text-4xl lg:text-5xl font-extrabold text-slate-500 mb-2">مرحباً بكم في</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500">
                El Centro
              </span>
              <br />
              <span className="text-slate-800">de Mirar</span>
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12 max-w-lg animate-in slide-in-from-bottom-8 duration-1000">
              منظومة تعليمية متكاملة تهدف لبناء جيل متميز، متقن للغات والعلوم، ومتمسك بالقيم الأخلاقية، برؤية مستقبلية وتقنيات حديثة.
            </p>
            
            <div className="flex flex-wrap gap-4 animate-in slide-in-from-bottom-10 duration-1000">
              <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-8 py-4 rounded-full font-black text-base flex items-center group shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 hover:-translate-y-1">
                لوحة التحكم
                <div className="bg-white/20 rounded-full p-1 mr-3 group-hover:rotate-90 transition-transform">
                   <ChevronLeft size={20} className="text-white" />
                </div>
              </button>
              
              <button onClick={scrollToContact} className="group bg-white text-slate-700 px-8 py-4 rounded-full font-black text-base border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-95 flex items-center hover:shadow-lg">
                تواصل معنا
                <PhoneCall size={20} className="mr-2 group-hover:animate-wiggle" />
              </button>
            </div>
          </div>
          
          <div className="relative flex justify-center lg:justify-end animate-in fade-in zoom-in duration-1000 delay-200">
             <div className="relative w-full max-w-md aspect-square">
                {/* Floating Elements */}
                <div className="absolute top-0 right-10 bg-white p-4 rounded-3xl shadow-xl z-20 animate-float">
                   <Sparkles className="text-amber-500" size={32} />
                </div>
                <div className="absolute bottom-10 left-0 bg-white p-4 rounded-3xl shadow-xl z-20 animate-float-slow">
                   <Globe className="text-emerald-500" size={32} />
                </div>

                <div className="relative h-full bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/50 flex flex-col items-center justify-center text-center p-8 shadow-2xl shadow-emerald-900/10">
                   <div className="bg-white rounded-full p-4 mb-8 shadow-2xl shadow-emerald-500/20 ring-8 ring-emerald-50 animate-pulse-glow">
                      <Logo size={180} />
                   </div>
                   <h3 className="text-3xl font-black text-slate-800 mb-2">تعليم متميز</h3>
                   <div className="flex gap-2 justify-center mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">جودة</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 px-3 py-1 rounded-full">إتقان</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
           <ArrowDown size={32} className="text-slate-400" />
        </div>
      </section>

      {/* Features Brief */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full mb-4 text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
               <Zap size={14} className="ml-2 animate-pulse" />
               مميزات المنصة
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900">نظام تعليمي متكامل</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { title: 'منهجية أصيلة', desc: 'نعتمد على مناهج تعليمية موثوقة ومراجعة بمعايير عالمية.', icon: ShieldCheck, color: 'emerald' },
               { title: 'تعليم تفاعلي', desc: 'حلقات تعليمية مباشرة ومتابعة دقيقة لمستوى الطالب.', icon: BookOpen, color: 'blue' },
               { title: 'تحفيز مستمر', desc: 'نظام نقاط وجوائز لتشجيع الطلاب على الإنجاز.', icon: Star, color: 'amber' }
             ].map((feature, i) => (
               <div key={i} className="bg-slate-50 p-10 rounded-[3rem] hover:bg-white hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 border border-slate-100 group relative overflow-hidden">
                 <div className={`absolute top-0 right-0 w-32 h-32 bg-${feature.color}-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`}></div>
                 
                 <div className={`w-20 h-20 bg-white text-${feature.color}-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-${feature.color}-100`}>
                   <feature.icon size={40} className="group-hover:animate-pulse" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-800 mb-3 text-center group-hover:text-${feature.color}-600 transition-colors">{feature.title}</h3>
                 <p className="text-slate-500 font-medium text-sm leading-relaxed text-center">{feature.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight">نسعد بخدمتكم في <br/><span className="text-emerald-400">El Centro de Mirar</span></h2>
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">تواصل معنا عبر القنوات الرسمية للاستفسار والتسجيل، فريقنا جاهز للرد على جميع تساؤلاتكم.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="https://wa.me/201147300322" target="_blank" className="bg-white/5 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 hover:scale-105 transition-all text-center group">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/30">
                 <MessageCircle size={32} />
              </div>
              <h4 className="text-xl font-black mb-1">واتساب</h4>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">تواصل مباشر</p>
            </a>
            <a href="https://www.facebook.com/share/1Z69rEUt7f/" target="_blank" className="bg-white/5 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 hover:scale-105 transition-all text-center group">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:rotate-12 transition-transform shadow-lg shadow-blue-600/30">
                 <Facebook size={32} />
              </div>
              <h4 className="text-xl font-black mb-1">فيسبوك</h4>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">تابع أخبارنا</p>
            </a>
            <a href="https://maps.app.goo.gl/VhNPmTafcrHfdKFR6" target="_blank" className="bg-white/5 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 hover:scale-105 transition-all text-center group">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:rotate-12 transition-transform shadow-lg shadow-amber-500/30">
                 <MapPin size={32} />
              </div>
              <h4 className="text-xl font-black mb-1">الموقع</h4>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">الزقازيق - مركز اللغات</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 px-6 border-t border-slate-100 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          <div className="p-2 bg-slate-50 rounded-full mb-8 hover:scale-110 transition-transform duration-500">
             <Logo size={70} />
          </div>
          
          <p className="text-slate-500 font-medium text-sm md:text-base max-w-xl leading-relaxed mb-12">
            El Centro de Mirar - المركز الأول لتعليم اللغات والعلوم الحديثة في الزقازيق.
          </p>

          <div className="w-full max-w-md mx-auto mb-8 flex flex-col items-center space-y-4">
             <div className="flex items-center space-x-2 space-x-reverse text-slate-600 font-black text-base">
                <span>تصميم وإنشاء</span>
                <div className="flex items-center space-x-5 space-x-reverse mr-4">
                   <a 
                     href="https://www.facebook.com/profile.php?id=61585240134160" 
                     target="_blank" 
                     rel="noreferrer" 
                     className="text-blue-600 hover:scale-125 transition-transform"
                     title="Software Gates Facebook"
                   >
                      <Facebook size={24} />
                   </a>
                   <a 
                     href="https://www.softwaregates.store/" 
                     target="_blank" 
                     rel="noreferrer" 
                     className="text-emerald-600 hover:scale-125 transition-transform"
                     title="Software Gates Website"
                   >
                      <Globe size={24} />
                   </a>
                </div>
             </div>
          </div>

          <div className="w-12 h-1 bg-slate-100 rounded-full mb-8"></div>
          
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              © ٢٠٢٤ El Centro de Mirar. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
        
        {/* Footer Ambient Light */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-emerald-50/50 to-transparent pointer-events-none"></div>
      </footer>
    </div>
  );
};

export default Landing;
