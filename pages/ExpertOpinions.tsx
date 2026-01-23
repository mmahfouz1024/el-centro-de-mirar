
import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  Loader2, 
  GraduationCap,
  Sparkles,
  Star,
  Upload,
  Camera,
  User,
  FileImage,
  ImageIcon
} from 'lucide-react';
import { db } from '../services/supabase';

const ExpertOpinions: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    rating: 5,
    image_url: ''
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await db.experts.getAll();
      setItems(data);
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
      if (editingItem) {
        await db.experts.update(editingItem.id, formData);
      } else {
        await db.experts.create(formData);
      }
      fetchItems();
      setIsModalOpen(false);
    } finally { setActionLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذه الشهادة؟')) return;
    await db.experts.delete(id);
    fetchItems();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Award className="ml-3 text-emerald-600" size={32} />
            تزكيات المتخصصين
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">إدارة نصوص وصور تزكيات الخبراء للمركز</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setFormData({ name: '', role: '', content: '', rating: 5, image_url: '' }); setIsModalOpen(true); }}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
        >
          <Plus size={20} className="ml-2" />
          إضافة تزكية جديدة
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm hover:shadow-md transition-all relative group overflow-hidden flex flex-col">
              <div className="absolute top-6 left-6 flex space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => { setEditingItem(item); setFormData({ ...item }); setIsModalOpen(true); }} className="p-2 bg-white/90 backdrop-blur text-emerald-600 rounded-xl shadow-sm border border-emerald-100"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 backdrop-blur text-rose-600 rounded-xl shadow-sm border border-rose-100"><Trash2 size={16}/></button>
              </div>
              
              {item.image_url ? (
                <div className="w-full aspect-video bg-slate-50 relative overflow-hidden border-b border-emerald-50">
                  <img src={item.image_url} className="w-full h-full object-cover" alt="صورة التزكية" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-black text-emerald-600 flex items-center">
                    <ImageIcon size={10} className="ml-1" />
                    تزكية مصورة
                  </div>
                </div>
              ) : (
                <div className="p-8 pb-0">
                  <Award className="text-emerald-50" size={50} fill="currentColor" />
                </div>
              )}

              <div className="p-8 flex-1 flex flex-col">
                <p className="text-slate-700 font-bold text-sm mb-8 leading-relaxed italic">"{item.content}"</p>
                
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-800 text-base">{item.name}</h4>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-tighter mt-0.5">{item.role}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className={i < item.rating ? "text-amber-400 fill-amber-400" : "text-slate-100"} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-10 animate-in zoom-in duration-300 text-right max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800">{editingItem ? 'تعديل التزكية' : 'إضافة تزكية متخصص'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500"><X size={20}/></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم المتخصص</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المسمى العلمي</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رفع صورة الرأي/التزكية (اختياري)</label>
                   <div className="relative group cursor-pointer">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageUpload} />
                      <div className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all overflow-hidden">
                        {formData.image_url ? (
                          <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <>
                            <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 text-emerald-600">
                               <FileImage size={32} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">انقر لرفع صورة الشهادة أو التزكية المكتوبة</span>
                          </>
                        )}
                      </div>
                      {formData.image_url && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({...formData, image_url: ''}); }} className="absolute -top-2 -left-2 bg-rose-500 text-white p-2 rounded-full z-20 shadow-lg hover:bg-rose-600 transition-colors">
                          <X size={14} />
                        </button>
                      )}
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">نص التزكية</label>
                   <textarea required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none h-32 resize-none focus:ring-4 focus:ring-emerald-500/10" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                </div>

                <button type="submit" disabled={actionLoading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-xl flex items-center justify-center transition-all disabled:opacity-50 mt-4 active:scale-95">
                  {actionLoading ? <Loader2 className="animate-spin ml-2" size={20} /> : <Check className="ml-2" size={20} />}
                  حفظ بيانات التزكية
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertOpinions;
