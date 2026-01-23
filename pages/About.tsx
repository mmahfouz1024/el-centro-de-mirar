
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  Info,
  Loader2,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { db } from '../services/supabase';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: 'admin' | 'advisor' | 'teacher';
  image_url: string;
  bio?: string;
}

const TeamSlider = ({ title, icon: Icon, members, color }: { title: string, icon: any, members: TeamMember[], color: string }) => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % members.length);
  const prev = () => setIndex((prev) => (prev - 1 + members.length) % members.length);

  if (members.length === 0) return null;

  return (
    <div className="space-y-10 py-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between px-4 lg:px-0">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className={`p-4 rounded-[1.5rem] bg-${color}-50 text-${color}-600 shadow-sm`}>
            <Icon size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{title}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">نخبة من الكفاءات المتميزة</p>
          </div>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <button onClick={prev} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:shadow-xl transition-all active:scale-90">
            <ChevronRight size={24} />
          </button>
          <button onClick={next} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:shadow-xl transition-all active:scale-90">
            <ChevronLeft size={24} />
          </button>
        </div>
      </div>

      <div className="relative h-[450px] flex items-center justify-center">
        {members.map((member, idx) => {
          const isActive = idx === index;
          const isNext = idx === (index + 1) % members.length;
          const isPrev = idx === (index - 1 + members.length) % members.length;
          
          let opacity = "opacity-0 pointer-events-none scale-75";
          let transform = "translate-x-0 z-0";
          
          if (isActive) { opacity = "opacity-100 scale-100 z-30"; transform = "translate-x-0"; }
          else if (isNext) { opacity = "opacity-40 scale-90 z-10 blur-[2px]"; transform = "translate-x-[-40%] rotate-3"; }
          else if (isPrev) { opacity = "opacity-40 scale-90 z-10 blur-[2px]"; transform = "translate-x-[40%] -rotate-3"; }

          return (
            <div 
              key={member.id} 
              className={`absolute w-full max-w-md transition-all duration-700 ease-out ${opacity} ${transform}`}
            >
              <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-100 group">
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-slate-50 transition-transform group-hover:scale-105 duration-500">
                    <img 
                      src={member.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} 
                      className="w-full h-full object-cover" 
                      alt={member.name} 
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-4 bg-white p-2 rounded-xl shadow-lg border border-slate-50">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <h4 className="text-2xl font-black text-slate-800">{member.name}</h4>
                  <div className={`inline-block px-4 py-1.5 rounded-full bg-${color}-50 text-${color}-700 text-[10px] font-black uppercase tracking-widest`}>
                    {member.role}
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed italic line-clamp-3">
                    "{member.bio || 'عضو فخور في عائلة منصة تبصرة، ملتزم برسالتنا في تأسيس جيل قرآني فريد متمسك بالقيم الإسلامية.'}"
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const About: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const data = await db.team.getAll();
        setTeam(data);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const admins = team.filter(m => m.category === 'admin');
  const advisors = team.filter(m => m.category === 'advisor');
  const teachers = team.filter(m => m.category === 'teacher');

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
      <section className="bg-white pt-20 pb-16 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
            <Info size={16} className="text-blue-700 ml-2" />
            <span className="text-blue-800 text-xs font-black uppercase tracking-widest">من نحن؟</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
            عائلة منصة تبصرة التعليمية
          </h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            مجتمع متكامل من المتخصصين والمربين، يعملون بروح الفريق الواحد لخدمة كتاب الله وتنشئة جيل يحمل القرآن في قلبه وخلقه.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center text-slate-300">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-black text-xs uppercase tracking-widest">جاري جلب بيانات الطاقم...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 pb-32">
          {/* Admin Slider */}
          <TeamSlider title="طاقم الإدارة" icon={ShieldCheck} members={admins} color="blue" />
          
          <div className="w-full h-px bg-slate-100 my-16"></div>

          {/* Advisors Slider */}
          <TeamSlider title="المستشارون" icon={Award} members={advisors} color="amber" />
          
          <div className="w-full h-px bg-slate-100 my-16"></div>

          {/* Teachers Slider */}
          <TeamSlider title="طاقم المعلمين" icon={Users} members={teachers} color="emerald" />
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 text-center text-slate-400 font-bold text-sm">
        <p>© ٢٠٢٤ منصة تبصرة لتأسيس طلاب القرآن. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
};

export default About;
