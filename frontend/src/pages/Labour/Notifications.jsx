import React, { useState, useEffect } from 'react';
import LabourNavbar from '../../components/LabourNavbar';
import { api } from '../../utils/api';
import { Bell } from 'lucide-react';
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
            alert("All notifications marked as read");
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <LabourNavbar />

            <main className="max-w-3xl mx-auto px-6 py-8">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-500 mt-1">Stay updated with your latest alerts.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={markAllRead} className="text-sm font-bold text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                            Mark all as read
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">No notifications yet.</p>
                    ) : (
                        notifications.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => !n.read && markAsRead(n.id)}
                                className={`p-5 rounded-2xl border ${!n.read ? 'bg-white border-green-200 shadow-sm ring-1 ring-green-50 cursor-pointer' : 'bg-gray-50 border-gray-100'} transition-all hover:shadow-md flex gap-4`}
                            >
                                <div className={`h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                                    n.type === 'payment' ? 'bg-green-100 text-green-600' :
                                    n.type === 'job' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                }`}>
                                    <Bell size={20} />
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-bold ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</h4>
                                        <span className="text-xs text-gray-400 font-medium">{new Date(n.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <p className={`text-sm mt-1 ${!n.read ? 'text-gray-700' : 'text-gray-500'}`}>{n.message}</p>
                                </div>
                                
                                {!n.read && <div className="h-2 w-2 rounded-full bg-red-500 mt-2"></div>}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};
export default Notifications;
