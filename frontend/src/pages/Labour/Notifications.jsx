import React, { useState, useEffect } from 'react';
import LabourNavbar from '../../components/LabourNavbar';
import { api } from '../../utils/api';
import { Bell, CheckCircle2, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const data = await api.get('/notifications');
            setNotifications(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (id) => {
         try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <LabourNavbar />
            <div className="flex-1 flex items-center justify-center">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-green-600 animate-spin"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-green-100">
            <LabourNavbar />

            <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 md:gap-6">
                    <div>
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <div className="h-10 w-10 md:h-12 md:w-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                                <Bell className="text-green-600 h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter italic uppercase">Intelligence Hub</h1>
                        </div>
                        <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed max-w-md">
                            Monitor your real-time alerts, payment updates, and job confirmations from one central dashboard.
                        </p>
                    </div>
                    {notifications.length > 0 && (
                        <button 
                            onClick={markAllRead} 
                            className="h-12 md:h-14 px-6 md:px-8 bg-white border border-gray-100 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 group hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <CheckCircle2 className="text-gray-400 group-hover:text-green-600 transition-colors h-4 w-4 md:h-5 md:w-5" />
                            <span className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-gray-900 uppercase tracking-widest">Mark all read</span>
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl shadow-gray-200/50 border border-white">
                            <div className="h-24 w-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <ShieldCheck className="text-green-600/30" size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter mb-2">Zero Notifications</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System status optimal. Waiting for new activity.</p>
                        </div>
                    ) : (
                        notifications.map((n, idx) => (
                            <div 
                                key={n.id} 
                                onClick={() => !n.read && markAsRead(n.id)}
                                className={`group p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 slide-out-to-top-4 fill-mode-both ${
                                    !n.read 
                                    ? 'bg-white border-green-500 shadow-2xl shadow-green-100/50 cursor-pointer scale-[1.01]' 
                                    : 'bg-white/40 border-transparent hover:border-gray-100 opacity-60 grayscale hover:grayscale-0 hover:bg-white hover:opacity-100'
                                } flex gap-8 items-center`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className={`h-16 w-16 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 ${
                                    n.type === 'payment' ? 'bg-green-600 text-white shadow-green-200' :
                                    n.type === 'job' ? 'bg-gray-900 text-white shadow-gray-200' : 'bg-orange-500 text-white shadow-orange-200'
                                }`}>
                                    <Bell size={24} className={!n.read ? 'animate-bounce' : ''} />
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`text-xl font-black italic uppercase tracking-tight ${!n.read ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {n.title}
                                        </h4>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 group-hover:border-green-100 transition-colors">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-[11px] font-black uppercase tracking-wide leading-relaxed ${!n.read ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {n.message}
                                    </p>
                                </div>
                                
                                {!n.read ? (
                                    <div className="h-4 w-4 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse"></div>
                                ) : (
                                    <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all cursor-pointer">
                                        <Trash2 size={16} />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="mt-12 p-8 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white flex items-center justify-between shadow-xl shadow-gray-200/20">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-100">
                                <ShieldCheck className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest italic">Encrypted Secure Portal</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">V3.5.0-STABLE</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="bg-gray-900 text-white h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95"
                        >
                            Back to Command Center <ArrowRight size={14} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Notifications;
