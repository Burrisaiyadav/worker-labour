import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle2, AlertCircle, Info, Trash2 } from 'lucide-react';
import { api } from '../utils/api';

const NotificationModal = ({ onClose, userId, socket }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const data = await api.get('/notifications');
            setNotifications(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        if (socket) {
            socket.on('new-notification', (notif) => {
                setNotifications(prev => [notif, ...prev]);
            });
        }

        return () => {
            if (socket) socket.off('new-notification');
        };
    }, [socket]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'job': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case 'alert': return <AlertCircle className="h-5 w-5 text-red-600" />;
            default: return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md h-full max-h-[500px] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-green-600" />
                        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {notifications.some(n => !n.read) && (
                            <button onClick={markAllAsRead} className="text-xs font-bold text-green-600 hover:underline">Mark all read</button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div 
                                key={notif.id} 
                                onClick={() => !notif.read && markAsRead(notif.id)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${notif.read ? 'bg-white border-gray-100' : 'bg-green-50 border-green-100 shadow-sm'}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${notif.read ? 'bg-gray-50' : 'bg-white'}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-sm font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    {!notif.read && <div className="h-2 w-2 bg-green-600 rounded-full mt-2"></div>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
