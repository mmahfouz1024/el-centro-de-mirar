
import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  Mail, 
  Building2, 
  User, 
  MapPin, 
  Search,
  MoreVertical,
  Loader2,
  Filter,
  Eye,
  X
} from 'lucide-react';
import { db } from '../services/supabase';
import { SubscriptionRequest } from '../types';

const Subscriptions: React.FC = () => {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await db.subscriptions.getAll();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'contacted') => {
    try {
      await db.subscriptions.updateStatus(id, status);
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
      setSelectedRequest(null);
    } catch (error) {
      alert('حدث خطأ أثناء التحديث');
    }
  };

  const filteredRequests = requests.filter(r => 
    r.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.supervisorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">جديد</span>;
      case 'contacted': return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase">تم التواصل</span>;
      case 'approved': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">مقبول</span>;
      case 'rejected': return <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase">مرفوض</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center">
            <Inbox className="ml-3 text-blue-700" size={32} />
            طلبات الاشتراك
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">مراجعة طلبات المدارس والمراكز الجديدة</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="البحث عن مدرسة أو مشرف..." 
            className="w-full bg-white border border-slate-100 rounded-2xl pr-12 pl-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-bold">جاري جلب الطلبات من السيرفر...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Building2 size={24} />
                </div>
                {getStatusBadge(req.status)}
              </div>

              <h3 className="text-lg font-black text-slate-800 mb-1">{req.schoolName}</h3>
              <p className="text-xs font-bold text-slate-400 mb-6 flex items-center">
                <User size={14} className="ml-1.5 text-blue-500" />
                المشرف: {req.supervisorName}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                   <span className="text-[9px] font-black text-slate-400 block mb-0.5">الطلاب</span>
                   <span className="text-sm font-black text-slate-700">{req.studentsCount}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                   <span className="text-[9px] font-black text-slate-400 block mb-0.5">الموقع</span>
                   <span className="text-sm font-black text-slate-700 truncate">{req.location.split('-')[0]}</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedRequest(req)}
                className="w-full py-3.5 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"
              >
                عرض التفاصيل
                <Eye size={16} className="mr-2" />
              </button>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-300">
               <Inbox size={80} className="mx-auto mb-4 opacity-20" />
               <p className="text-xl font-black">لا توجد طلبات اشتراك جديدة حالياً</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 lg:p-12 text-right">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-2xl font-black text-slate-800">تفاصيل طلب مدرسة {selectedRequest.schoolName}</h3>
                   <button onClick={() => setSelectedRequest(null)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500"><X size={24}/></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">اسم المستخدم المقترح</label>
                         <div className="text-lg font-black text-blue-700">{selectedRequest.username}</div>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse">
                         <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Phone size={18}/></div>
                         <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase">رقم الموبايل</div>
                            <div className="text-sm font-bold">{selectedRequest.phone}</div>
                         </div>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse">
                         <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Mail size={18}/></div>
                         <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase">البريد الإلكتروني</div>
                            <div className="text-sm font-bold">{selectedRequest.email}</div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                         <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><MapPin size={18}/></div>
                         <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase">الموقع</div>
                            <div className="text-sm font-bold">{selectedRequest.location}</div>
                         </div>
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">مصدر التعرف</label>
                         <div className="text-sm font-bold">{selectedRequest.referralSource}</div>
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">ملاحظات إضافية</label>
                         <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[80px]">
                            {selectedRequest.notes || 'لا توجد ملاحظات'}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                   <button 
                    onClick={() => updateStatus(selectedRequest.id, 'approved')}
                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 flex items-center justify-center"
                   >
                     <CheckCircle size={20} className="ml-2" />
                     قبول الطلب وتجهيز الحساب
                   </button>
                   <button 
                    onClick={() => updateStatus(selectedRequest.id, 'contacted')}
                    className="flex-1 bg-amber-500 text-white py-4 rounded-2xl font-black shadow-xl shadow-amber-100 flex items-center justify-center"
                   >
                     <Clock size={20} className="ml-2" />
                     تم التواصل المبدئي
                   </button>
                   <button 
                    onClick={() => updateStatus(selectedRequest.id, 'rejected')}
                    className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors"
                   >
                     <XCircle size={20} className="ml-2" />
                     رفض الطلب
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
