
import React, { useState, useEffect } from 'react';
import { 
  MessageSquareQuote, 
  Plus, 
  Trash2, 
  Edit2, 
  Star, 
  X, 
  Check, 
  Loader2, 
  Quote,
  Image as ImageIcon,
  Upload,
  Camera
} from 'lucide-react';
import { db } from '../services/supabase';

const Testimonials: React.FC = () => {
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
      const data = await db.testimonials.getAll();
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
    if (!formData.name) {
      alert('يرجى إدخال اسم ولي الأمر على الأقل');
      return;
    }
    setActionLoading(true);
    try {
      if (editingItem) {
        await db.testimonials.update(editingItem.id, formData);
      } else {
        await db.testimonials.create(formData);
      }
      fetchItems();
      setIsModalOpen(false);
    } finally { setActionLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا الرأي؟')) return;
    await db.testimonials.delete(id);
    fetchItems();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <MessageSquareQuote className="ml-3 text-blue-700" size={32} />
            آراء أولياء الأمور
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">إدارة الشهادات والصور المعروضة في الموقع</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setFormData({ name: '', role: '', content: '', rating: 5, image_url: '' }); setIsModalOpen(true); }}
          className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all"
        >
          <Plus size={20} className="ml-2" />
          إضافة رأي أو صورة
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all relative group overflow-hidden flex flex-col">
              <div className="absolute top-4 left-4 z-10 flex space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingItem(item); setFormData({ ...item }); setIsModalOpen(true); }} className="p-2 bg-white/90 backdrop-blur text-blue-600 rounded-xl shadow-sm border border-slate-100"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 backdrop-blur text-rose-600 rounded-xl shadow-sm border border-slate-100"><Trash2 size={16}/></button>
              </div>

              {item.image_url ? (
                <div className="w-full aspect-[4/3] bg-slate-50 relative overflow-hidden border-b border-slate-50">
                  <img src={item.image_url} className="w-full h-full object-cover" alt="شهادة ولي أمر" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              ) : (
                <div className="p-6 pb-0">
                  <Quote className="text-blue-50" size={40} fill="currentColor" />
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                {item.content && (
                  <p className={`text-slate-600 font-bold text-sm leading-relaxed mb-6 italic ${item.image_url ? 'line-clamp-3' : ''}`}>
                    "{item.content}"
                  </p>
                )}
                
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-sm">{item.name[0]}</div>
                    <div>
                      <h4 className="font-black text-slate-800 text-xs">{item.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400">{item.role}</p>
                    </div>
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !actionLoading && setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[3.5rem] shadow-2xl p-8 lg:p-10 animate-in zoom-in duration-300 text-right max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800">{editingItem ? 'تعديل البيانات' : 'إضافة رأي جديد'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500"><X size={20}/></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم ولي الأمر</label>
                    <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الوصف</label>
                    <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.role} placeholder="مثال: والد الطالب يوسف" onChange={e => setFormData({...formData, role: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رفع صورة الرأي (اختياري)</label>
                   <div className="relative group cursor-pointer">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageUpload} />
                      <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-all overflow-hidden">
                        {formData.image_url ? (
                          <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <>
                            <Upload className="text-slate-300 mb-2" size={24} />
                            <span className="text-[10px] font-black text-slate-400">اسحب صورة أو انقر هنا للرفع</span>
                          </>
                        )}
                      </div>
                      {formData.image_url && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({...formData, image_url: ''}); }} className="absolute -top-2 -left-2 bg-rose-500 text-white p-1.5 rounded-full z-20 shadow-lg">
                          <X size={12} />
                        </button>
                      )}
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">نص الرأي (اختياري)</label>
                   <textarea className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none h-24 resize-none" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="اكتب نص الرأي هنا إذا لم ترفع صورة..." />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">التقييم العام</label>
                   <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100 space-x-2 space-x-reverse">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setFormData({...formData, rating: star})} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${formData.rating >= star ? 'bg-amber-100 text-amber-600 shadow-sm' : 'text-slate-300'}`}>
                          <Star size={18} fill={formData.rating >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                   </div>
                </div>

                <button type="submit" disabled={actionLoading} className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black shadow-xl flex items-center justify-center transition-all disabled:opacity-50 mt-4">
                  {actionLoading ? <Loader2 className="animate-spin ml-2" size={20} /> : <Check className="ml-2" size={20} />}
                  حفظ البيانات نهائياً
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
