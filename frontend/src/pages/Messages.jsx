import React, { useState } from 'react';
import { Send, ChevronLeft, MoreVertical, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Messages = ({ onClose, initialGroupName }) => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Mock Chats
  const chats = [
    { id: 1, name: 'Sharma Labour Group', lastMsg: 'Yes, we are available on 15th.', time: '10:30 AM', unread: 2 },
    { id: 2, name: 'Verma Brothers', lastMsg: 'What is the rate for 10 acres?', time: 'Yesterday', unread: 0 },
  ];

  React.useEffect(() => {
    if (initialGroupName) {
        const chat = chats.find(c => c.name === initialGroupName);
        if (chat) {
            setActiveChat(chat);
        }
    }
  }, [initialGroupName]);
  
  const handleBack = () => {
      if (activeChat) {
          setActiveChat(null);
      } else if (onClose) {
          onClose();
      } else {
          navigate('/dashboard');
      }
  };
  


  const handleChatClick = (chat) => {
    setActiveChat(chat);
  };

  return (
    <div className={`bg-gray-50 flex flex-col ${onClose ? 'h-full rounded-2xl overflow-hidden' : 'min-h-screen'}`}>
       {/* Header */}
       <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                {activeChat ? (
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{activeChat.name}</h1>
                        <p className="text-xs text-green-600 font-medium">Online</p>
                    </div>
                ) : (
                    <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                )}
            </div>
            {activeChat && (
                <div className="flex items-center gap-2 relative">
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-green-600 transition-colors">
                        <Phone className="h-5 w-5" />
                    </button>
                    <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-green-600 transition-colors">
                        <MoreVertical className="h-5 w-5" />
                    </button>

                    {/* Settings Dropdown */}
                    {showSettings && (
                        <div className="absolute top-12 right-0 bg-white rounded-xl shadow-xl border border-gray-100 w-48 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button onClick={() => { alert('View Profile'); setShowSettings(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                                View Profile
                            </button>
                            <button onClick={() => { alert('Notifications Muted'); setShowSettings(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors border-t border-gray-50">
                                Mute Notifications
                            </button>
                             <button onClick={() => { alert('Chat Cleared'); setShowSettings(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors border-t border-gray-50">
                                Clear Chat
                            </button>
                            <button onClick={() => { alert('User Blocked'); setShowSettings(false); }} className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm font-medium text-red-600 transition-colors border-t border-gray-50">
                                Block User
                            </button>
                        </div>
                    )}
                </div>
            )}
       </div>

       {/* Content */}
       <div className="flex-1 overflow-y-auto">
            {!activeChat ? (
                // Chat List
                <div className="divide-y divide-gray-100 bg-white">
                    {chats.map(chat => (
                        <div key={chat.id} onClick={() => handleChatClick(chat)} className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                                {chat.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-gray-900">{chat.name}</h3>
                                    <span className="text-xs text-gray-400">{chat.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{chat.lastMsg}</p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="h-5 w-5 bg-green-600 rounded-full flex items-center justify-center text-xs text-white">
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                // Active Msg Window
                <div className="p-4 space-y-4">
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 max-w-[80%]">
                            <p className="text-gray-800 text-sm">Hello Sir, are you looking for workers?</p>
                            <span className="text-[10px] text-gray-400 block mt-1">10:00 AM</span>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <div className="bg-green-600 p-3 rounded-2xl rounded-tr-none text-white max-w-[80%] shadow-lg">
                            <p className="text-sm">Yes, for wheat harvesting.</p>
                            <span className="text-[10px] text-green-200 block mt-1">10:05 AM</span>
                        </div>
                    </div>
                     <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 max-w-[80%]">
                            <p className="text-gray-800 text-sm">{activeChat.lastMsg}</p>
                            <span className="text-[10px] text-gray-400 block mt-1">{activeChat.time}</span>
                        </div>
                    </div>
                </div>
            )}
       </div>

       {/* Input Area (only if chat active) */}
       {activeChat && (
           <div className="bg-white p-4 border-t border-gray-100 sticky bottom-0">
               <div className="flex items-center gap-2">
                   <input 
                        type="text" 
                        placeholder="Type a message..." 
                        className="flex-1 bg-gray-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                   />
                   <button className="p-3 bg-green-600 rounded-full text-white hover:bg-green-700 shadow-md transition-all">
                       <Send className="h-5 w-5" />
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};

export default Messages;
