
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  Loader2, 
  Camera,
  Upload,
  UserCheck,
  Award,
  ShieldCheck,
  Search
} from 'lucide-react';
import { db } from '../services/supabase';

const ManageTeam: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    category: 'admin',
    image_url: '',
    bio: ''
  });

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await db.team.getAll();
      setMembers(data);
    } finally { setLoading(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingMember) {
        await db.team.update(editingMember.id, formData);
      } else {
        await db.team.create(formData);
      }
      fetchMembers();
      setIsModalOpen(false);
    } finally { setActionLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) return;
    await db.team.delete(id);
    fetchMembers();
  };

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'admin': return <ShieldCheck size={14} className="text-blue-500" />;
      case 'advisor': return <Award size={14} className="text-amber-500" />;
      case 'teacher': return <UserCheck size={14} className="text-emerald-500" />;
      default: return <Users size={14} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Users className="ml-3 text-blue-700" size={32} />
            إدارة طاقم العمل
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">إضافة وتعديل بيانات الإداريين والمستشارين والمعلمين</p>
        </div>
        <button 
          onClick={() => { setEditingMember(null); setFormData({ name: '', role: '', category: 'admin', image_url: '', bio: '' }); setIsModalOpen(true); }}
          className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all active:scale-95"
        >
          <Plus size={20} className="ml-2" />
          إضافة عضو جديد
        </button>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center relative">
        <Search className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input 
          type="text" 
          placeholder="ابحث عن عضو..." 
          className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-14 pl-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map(member => (
            <div key={member.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-white shadow-inner overflow-hidden flex items-center justify-center">
                  <img src={member.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex space-x-1 space-x-reverse">
                  <button onClick={() => { setEditingMember(member); setFormData({ ...member }); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(member.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
              
              <h3 className="font-black text-slate-800 mb-1">{member.name}</h3>
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                {getCategoryIcon(member.category)}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.role}</span>
              </div>
              <p className="text-xs text-slate-400 font-medium line-clamp-2 italic mb-4">{member.bio || 'لا يوجد نبذة تعريفية.'}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-50">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                  member.category === 'admin' ? 'bg-blue-50 text-blue-600' : 
                  member.category === 'advisor' ? 'bg-amber-50 text-amber-600' : 
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {member.category === 'admin' ? 'إداري' : member.category === 'advisor' ? 'مستشار' : 'معلم'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !actionLoading && setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[3.5rem] shadow-2xl p-8 lg:p-10 animate-in zoom-in duration-300 text-right max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800">{editingMember ? 'تعديل البيانات' : 'إضافة عضو للطاقم'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors"><X size={24}/></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden flex items-center justify-center bg-slate-50 transition-all hover:bg-blue-50">
                      {formData.image_url ? (
                        <img src={formData.image_url} className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        <div className="text-center">
                          <Camera size={32} className="mx-auto text-slate-300 mb-2" />
                          <span className="text-[9px] font-black text-slate-400 uppercase">صورة العضو</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <Upload size={14} />
                    </div>
                    <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الاسم الكامل</label>
                    <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المسمى الوظيفي</label>
                    <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" value={formData.role} placeholder="مثال: مدير عام، خبير قراءات..." onChange={e => setFormData({...formData, role: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">التصنيف</label>
                  <select required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black outline-none appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="admin">طاقم الإدارة</option>
                    <option value="advisor">المستشارون</option>
                    <option value="teacher">طاقم المعلمين</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">نبذة تعريفية</label>
                  <textarea className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none h-24 resize-none focus:ring-4 focus:ring-blue-500/10" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="اكتب نبذة مختصرة عن العضو..." />
                </div>

                <button type="submit" disabled={actionLoading} className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black shadow-xl flex items-center justify-center transition-all disabled:opacity-50 mt-4 active:scale-95">
                  {actionLoading ? <Loader2 className="animate-spin ml-2" size={20} /> : <Check className="ml-2" size={20} />}
                  حفظ بيانات العضو
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeam;
