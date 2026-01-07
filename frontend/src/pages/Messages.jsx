import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronLeft, MoreVertical, Phone, CreditCard, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { io } from 'socket.io-client';

const Messages = ({ onClose, initialGroupName, initialOtherId, jobId }) => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isFarmer = currentUser?.role === 'farmer';

  if (!currentUser.id) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
            <h2 className="text-xl font-black text-gray-900 mb-4">You need to login first</h2>
            <button onClick={() => navigate('/login')} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                Go to Login
            </button>
        </div>
    );
  }

  // --- E2EE Helpers ---
  const getSecretKey = async (otherId) => {
    const ids = [currentUser.id, otherId].sort();
    const sharedSecret = ids.join('_'); // Simple shared secret for demo E2EE
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw', enc.encode(sharedSecret), 'PBKDF2', false, ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: enc.encode('farmhand-salt'), iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const encryptMessage = async (text, otherId) => {
    try {
      const key = await getSecretKey(otherId);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const enc = new TextEncoder();
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv }, key, enc.encode(text)
      );
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      return btoa(String.fromCharCode(...combined));
    } catch (err) {
      console.error("Encryption failed", err);
      return text;
    }
  };

  const decryptMessage = async (data, otherId) => {
    if (!data || typeof data !== 'string' || !data.includes('==') && data.length < 24) return data;
    try {
      const key = await getSecretKey(otherId);
      const combined = new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)));
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv }, key, encrypted
      );
      return new TextDecoder().decode(decrypted);
    } catch (err) {
      // If decryption fails, it might be an unencrypted legacy message
      return data;
    }
  };
  // --- End E2EE ---

  // Initialize socket and fetch chat list
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    newSocket.emit('join', currentUser.id);

    newSocket.on('receive-message', async (msg) => {
        // 1. Decrypt if possible
        const decryptedContent = await decryptMessage(msg.content, msg.senderId === currentUser.id ? msg.receiverId : msg.senderId);
        const processedMsg = { ...msg, content: decryptedContent };

        // 2. Update active chat messages
        if (activeChat && (msg.senderId === activeChat.otherId || msg.receiverId === activeChat.otherId)) {
            setMessages(prev => [...prev, processedMsg]);
        }
        
        // 3. Update chat list (last msg/unread)
        setChats(prevChats => {
            const chatExists = prevChats.some(c => c.otherId === msg.senderId || c.otherId === msg.receiverId);
            if (chatExists) {
                return prevChats.map(c => {
                    if (c.otherId === msg.senderId || c.otherId === msg.receiverId) {
                        return {
                            ...c,
                            lastMsg: decryptedContent,
                            time: 'Now',
                            unread: (activeChat?.otherId === msg.senderId) ? c.unread : (c.unread || 0) + 1
                        };
                    }
                    return c;
                });
            } else {
                return [{
                    id: Date.now().toString(),
                    name: msg.senderName || 'New User',
                    otherId: msg.senderId === currentUser.id ? msg.receiverId : msg.senderId,
                    lastMsg: decryptedContent,
                    time: 'Now',
                    unread: 1
                }, ...prevChats];
            }
        });
    });

    setSocket(newSocket);

    const fetchConversations = async () => {
        try {
            const data = await api.get('/messages/conversations');
            // Decrypt last messages
            const decryptedChats = await Promise.all(data.map(async chat => ({
                ...chat,
                lastMsg: await decryptMessage(chat.lastMsg, chat.otherId)
            })));
            setChats(decryptedChats);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        }
    };
    fetchConversations();

    return () => newSocket.disconnect();
  }, [currentUser.id]); // Removed activeChat dependency to avoid re-connecting.

  useEffect(() => {
    if (initialGroupName) {
        const chat = chats.find(c => c.name === initialGroupName);
        if (chat) {
            setActiveChat(chat);
        } else if (initialOtherId) {
            setActiveChat({ 
                name: initialGroupName, 
                otherId: initialOtherId, 
                lastMsg: '', 
                time: 'Now' 
            });
        } else if (job && job.userId) {
            setActiveChat({ 
                name: initialGroupName, 
                otherId: job.userId, 
                lastMsg: '', 
                time: 'Now' 
            });
        }
    }
  }, [initialGroupName, initialOtherId, chats, job]);

  useEffect(() => {
    if (activeChat) {
        // Fetch real history
        api.get(`/messages/${activeChat.otherId}`).then(async data => {
            const decryptedMessages = await Promise.all(data.map(async m => ({
                ...m,
                content: await decryptMessage(m.content, activeChat.otherId)
            })));
            setMessages(decryptedMessages);
        }).catch(err => console.error("Failed to fetch messages", err));
    }
  }, [activeChat]);

  // Auto scroll to bottom
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (jobId) {
        setLoadingJob(true);
        api.get(`/jobs/${jobId}`).then(data => {
            setJob(data);
            setLoadingJob(false);
        }).catch(err => {
            console.error("Failed to fetch job context", err);
            setLoadingJob(false);
        });
    }
  }, [jobId]);
  
  const handleBack = () => {
      if (activeChat) {
          setActiveChat(null);
      } else if (onClose) {
          onClose();
      } else {
          navigate('/dashboard');
      }
  };

  const handlePayNow = () => {
      onClose();
      navigate(`/payment/${jobId}`);
  };

  const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!newMessage.trim() || !activeChat || !socket) return;

      const encryptedContent = await encryptMessage(newMessage, activeChat.otherId);

      const msgData = {
          senderId: currentUser.id,
          receiverId: activeChat.otherId,
          content: encryptedContent
      };

      socket.emit('send-message', msgData);
      setNewMessage('');
  };

  const handleClearChat = async () => {
      if (!activeChat) return;
      if (window.confirm('Are you sure you want to clear this chat? This cannot be undone.')) {
        try {
            await api.delete(`/messages/${activeChat.otherId}`);
            setMessages([]);
            setShowSettings(false);
            // Refresh conversations list
            const data = await api.get('/messages/conversations');
            setChats(data);
        } catch (err) {
            console.error("Failed to clear chat", err);
        }
      }
  };

  const handleCall = () => {
      if (!activeChat || !activeChat.otherId) return;
      // Fetch phone number from profile if not in chat object
      api.get(`/auth/labourers`).then(labs => {
          const lab = labs.find(l => l.id === activeChat.otherId);
          if (lab && lab.mobile) {
              window.location.href = `tel:${lab.mobile}`;
          } else {
              // Try farmers
              api.get(`/auth/farmers`).then(farmers => {
                  const farmer = farmers.find(f => f.id === activeChat.otherId);
                  if (farmer && farmer.mobile) {
                      window.location.href = `tel:${farmer.mobile}`;
                  } else {
                      alert("Phone number not available");
                  }
              });
          }
      });
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
                        <h1 className="text-sm font-black text-gray-900 leading-tight truncate max-w-[120px]">{activeChat.name}</h1>
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online</p>
                    </div>
                ) : (
                    <h1 className="text-lg font-black text-gray-900 tracking-tight">Messages</h1>
                )}
            </div>

            <div className="flex items-center gap-2 relative">
                {activeChat && isFarmer && job && job.status === 'Completed' && job.paymentStatus === 'Pending' && (
                    <button 
                        onClick={handlePayNow}
                        className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100 animate-bounce transition-all hover:scale-105 active:scale-95"
                    >
                        <CreditCard size={14} /> Pay ₹{job.cost}
                    </button>
                )}
                
                {activeChat && (
                    <>
                        <button onClick={handleCall} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-green-600 transition-colors">
                            <Phone className="h-4 w-4" />
                        </button>
                        <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-green-600 transition-colors">
                            < MoreVertical className="h-4 w-4" />
                        </button>
                    </>
                )}

                {/* Settings Dropdown */}
                {showSettings && (
                    <div className="absolute top-12 right-0 bg-white rounded-xl shadow-xl border border-gray-100 w-48 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button onClick={() => setShowSettings(false)} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors">
                            View Profile
                        </button>
                        <button onClick={handleClearChat} className="w-full text-left px-4 py-3 hover:bg-red-50 text-xs font-bold text-red-600 transition-colors border-t border-gray-50">
                            Clear Chat
                        </button>
                    </div>
                )}
            </div>
       </div>

       {/* Banner for completed & paid */}
       {activeChat && job && job.paymentStatus === 'Paid' && (
           <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center justify-center gap-2 text-[10px] font-black text-blue-700 uppercase tracking-widest">
               <CheckCircle2 size={12} /> Payment Completed (ID: {job.paymentId || 'PAY-723...'})
           </div>
       )}

       {/* Content */}
       <div className="flex-1 overflow-y-auto bg-[#efeae2] bg-opacity-40">
            {!activeChat ? (
                // Chat List
                <div className="divide-y divide-gray-100 bg-white">
                    {chats.map(chat => (
                        <div key={chat.id} onClick={() => setActiveChat(chat)} className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-black">
                                {chat.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900 text-sm">{chat.name}</h3>
                                    <span className="text-[10px] font-bold text-gray-400">{chat.time}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate mt-0.5">{chat.lastMsg}</p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="h-4 w-4 bg-green-600 rounded-full flex items-center justify-center text-[8px] font-black text-white">
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                // Active Msg Window
                <div className="p-4 space-y-4">
                    <div className="flex justify-center">
                        <span className="bg-white/80 backdrop-blur-sm shadow-sm text-[10px] font-black text-gray-400 px-3 py-1 rounded-lg uppercase tracking-widest">History</span>
                    </div>

                    {messages.map((msg, i) => (
                        <div key={msg.id || i} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`${msg.senderId === currentUser.id ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'} p-3 rounded-2xl max-w-[85%] shadow-sm`}>
                                <p className="text-sm font-medium">{msg.content}</p>
                                <span className={`text-[9px] font-black block mt-1 text-right ${msg.senderId === currentUser.id ? 'text-green-200' : 'text-gray-300'}`}>
                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            )}
       </div>

       {/* Input Area (only if chat active) */}
       {activeChat && (
           <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-gray-100 sticky bottom-0">
               <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-2 py-1 shadow-inner border border-gray-100">
                   <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..." 
                        className="flex-1 bg-transparent border-none px-3 py-3 focus:outline-none text-sm font-medium text-gray-700"
                   />
                   <button type="submit" className="h-10 w-10 bg-green-600 rounded-xl text-white flex items-center justify-center hover:bg-green-700 shadow-lg shadow-green-100 transition-all hover:scale-105 active:scale-95">
                       <Send className="h-5 w-5" />
                   </button>
               </div>
           </form>
       )}
    </div>
  );
};

export default Messages;
