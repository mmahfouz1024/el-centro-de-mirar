
import React, { useState, useEffect } from 'react';
import { 
  Video, 
  PlusCircle, 
  Trash2, 
  Loader2, 
  Check, 
  X, 
  PlayCircle, 
  Search, 
  AlertCircle,
  Film,
  Sparkles,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  Edit2
} from 'lucide-react';
import { db } from '../services/supabase';

const VideoManagement: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    poster: ''
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const result: any = await db.videos.getAll();
      setVideos(result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingVideo(null);
    setFormData({ title: '', description: '', url: '', poster: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (video: any) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '',
      description: video.description || '',
      url: video.url || '',
      poster: video.poster || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingVideo) {
        const updated = await db.videos.update(editingVideo.id, formData);
        if (updated) {
          setVideos(prev => prev.map(v => v.id === editingVideo.id ? { ...v, ...formData } : v));
          setIsModalOpen(false);
        }
      } else {
        const video = await db.videos.create(formData);
        if (video) {
          setVideos(prev => [video, ...prev]);
          setIsModalOpen(false);
        }
      }
      setFormData({ title: '', description: '', url: '', poster: '' });
    } catch (err) {
      alert('فشل في حفظ البيانات. تأكد من صحة الروابط وجودة الاتصال.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقطع نهائياً من المعرض العام؟')) return;
    try {
      setActionLoading(true);
      await db.videos.delete(id);
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert('فشل الحذف');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 text-right" dir="rtl">
      {/* Header Area */}
      <div className="bg-gradient-to-br from-indigo-700 to-blue-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-3">
              <Sparkles size={14} className="ml-2 text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">إدارة المحتوى المرئي</span>
            </div>
            <h2 className="text-3xl font-black mb-1">معرض الفيديوهات التفاعلي</h2>
            <p className="text-blue-100/70 font-bold text-sm">التحكم في المقاطع التي تظهر للجمهور وأولياء الأمور في الصفحة الرئيسية.</p>
          </div>
          
          <button 
            onClick={openAddModal}
            className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black text-sm flex items-center shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            <PlusCircle size={20} className="ml-2" />
            إضافة مقطع جديد
          </button>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 -translate-x-32 blur-3xl"></div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text"
            placeholder="بحث في عنوان المقطع..."
            className="w-full bg-slate-50 border border-slate-50 rounded-xl pr-12 pl-4 py-3 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black whitespace-nowrap">
          إجمالي المقاطع: {videos.length}
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-300">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-black text-xs uppercase tracking-widest">جاري جلب معرض الصور...</p>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map(video => (
            <div key={video.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group relative">
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {video.poster ? (
                  <img src={video.poster} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <Film size={48} className="mb-2" />
                    <span className="text-[10px] font-black uppercase">No Poster</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                     <PlayCircle size={32} />
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-2"></div>
                  <span className="text-white text-[9px] font-black uppercase">Online</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-slate-800 text-lg truncate flex-1">{video.title}</h4>
                  <button 
                    onClick={() => openEditModal(video)}
                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all mr-2"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                <p className="text-slate-400 font-bold text-xs line-clamp-2 leading-relaxed mb-6 h-10">{video.description}</p>
                
                <div className="flex gap-2 pt-4 border-t border-slate-50">
                  <button 
                    onClick={() => handleDelete(video.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-rose-50 text-rose-600 py-3 rounded-xl text-xs font-black hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center"
                  >
                    <Trash2 size={16} className="ml-2" />
                    حذف المقطع
                  </button>
                  <a 
                    href={video.url} 
                    target="_blank" 
                    className="px-4 bg-slate-50 text-slate-400 py-3 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center"
                  >
                    <LinkIcon size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-32 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <Video size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">المعرض فارغ حالياً</h3>
          <p className="text-slate-400 font-bold max-w-sm mx-auto">ابدأ بإضافة أول مقطع فيديو ليتم عرضه للجمهور في الصفحة الرئيسية للمركز.</p>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => !actionLoading && setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[3.5rem] shadow-2xl p-10 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    {editingVideo ? <Edit2 size={24} /> : <PlusCircle size={24} />}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">{editingVideo ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}</h3>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">عنوان المقطع</label>
                <div className="relative">
                  <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="مثال: حلقة الإتقان في رمضان"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رابط الفيديو المباشر (.mp4)</label>
                <div className="relative">
                  <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="url" required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="https://example.com/video.mp4"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رابط صورة الغلاف (Poster)</label>
                <div className="relative">
                  <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="url"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="https://example.com/thumbnail.jpg"
                    value={formData.poster}
                    onChange={(e) => setFormData({...formData, poster: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">وصف المقطع</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none"
                  placeholder="اكتب وصفاً موجزاً يظهر تحت عنوان المقطع..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={actionLoading}
                className="w-full bg-indigo-600 text-white py-5 rounded-[1.8rem] font-black text-lg shadow-xl shadow-indigo-100 flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="animate-spin ml-3" size={24} /> : <Check size={24} className="ml-3" />}
                {editingVideo ? 'حفظ التغييرات' : 'تأكيد النشر في المعرض'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagement;
