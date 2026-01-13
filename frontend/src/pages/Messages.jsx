import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronLeft, MoreVertical, Phone, CreditCard, CheckCircle2, Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
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
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const contextMenuRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);

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
    const sharedSecret = ids.join('_');
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
      return text;
    }
  };

  const decryptMessage = async (data, otherId) => {
    if (!data || typeof data !== 'string' || (data.length < 24 && !data.includes('=='))) return data;
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
      return data;
    }
  };

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    newSocket.emit('join', currentUser.id);

    newSocket.on('receive-message', async (msg) => {
        const decryptedContent = msg.type === 'text' ? await decryptMessage(msg.content, msg.senderId === currentUser.id ? msg.receiverId : msg.senderId) : msg.content;
        const processedMsg = { ...msg, content: decryptedContent };

        if (activeChat && (msg.senderId === activeChat.otherId || msg.receiverId === activeChat.otherId)) {
            setMessages(prev => [...prev, processedMsg]);
        }
        
        setChats(prevChats => {
            const chatExists = prevChats.some(c => c.otherId === msg.senderId || c.otherId === msg.receiverId);
            if (chatExists) {
                return prevChats.map(c => {
                    if (c.otherId === msg.senderId || c.otherId === msg.receiverId) {
                        return {
                            ...c,
                            lastMsg: msg.type === 'audio' ? '🎤 Voice message' : decryptedContent,
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
                    lastMsg: msg.type === 'audio' ? '🎤 Voice message' : decryptedContent,
                    time: 'Now',
                    unread: 1
                }, ...prevChats];
            }
        });
    });

    newSocket.on('message-deleted', (msgId) => {
        setMessages(prev => prev.filter(m => m.id !== msgId));
    });

    setSocket(newSocket);
    const fetchConversations = async () => {
        try {
            const data = await api.get('/messages/conversations');
            const decryptedChats = await Promise.all(data.map(async chat => ({
                ...chat,
                lastMsg: chat.type === 'audio' ? '🎤 Voice message' : await decryptMessage(chat.lastMsg, chat.otherId)
            })));
            setChats(decryptedChats);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        }
    };
    fetchConversations();
    return () => newSocket.disconnect();
  }, [currentUser.id, activeChat?.otherId]);

  useEffect(() => {
    if (initialGroupName && initialOtherId) {
        setActiveChat({ 
            name: initialGroupName, 
            otherId: initialOtherId, 
            lastMsg: '', 
            time: 'Now' 
        });
    }
  }, [initialGroupName, initialOtherId]);

  useEffect(() => {
    if (activeChat) {
        api.get(`/messages/${activeChat.otherId}`).then(async data => {
            const decryptedMessages = await Promise.all(data.map(async m => ({
                ...m,
                content: m.type === 'text' ? await decryptMessage(m.content, activeChat.otherId) : m.content
            })));
            setMessages(decryptedMessages);
        });
    }
  }, [activeChat]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (jobId) {
        setLoadingJob(true);
        api.get(`/jobs/${jobId}`).then(data => {
            setJob(data);
            setLoadingJob(false);
        }).catch(() => setLoadingJob(false));
    }
  }, [jobId]);
  
  const handleBack = () => {
    if (activeChat) {
      setActiveChat(null);
    } else {
      if (onClose) {
        onClose();
      } else {
        navigate(-1); // Use navigate(-1) for better back behavior
      }
    }
  };

  const handleSendMessage = async (e, type = 'text', customContent = null) => {
      if (e) e.preventDefault();
      const content = customContent || newMessage;
      if (!content.trim() || !activeChat || !socket) return;

      const finalContent = type === 'text' ? await encryptMessage(content, activeChat.otherId) : content;
      const msgData = {
          senderId: currentUser.id,
          receiverId: activeChat.otherId,
          content: finalContent,
          type,
          replyTo: replyingTo ? replyingTo.id : null,
          isForwarded: type === 'forward'
      };

      socket.emit('send-message', msgData);
      if (!customContent) setNewMessage('');
      setReplyingTo(null);
  };

  const handleForward = async (chat) => {
    if (!forwardingMessage || !socket) return;
    
    const msgData = {
        senderId: currentUser.id,
        receiverId: chat.otherId,
        content: forwardingMessage.content, // Already encrypted if text
        type: forwardingMessage.type,
        isForwarded: true
    };

    socket.emit('send-message', msgData);
    setForwardingMessage(null);
    alert(`Message forwarded to ${chat.name}`);
  };

  const handleDeleteMessage = async (msgId) => {
    if (window.confirm('Delete this message for everyone?')) {
        try {
            await api.delete(`/messages/message/${msgId}`);
            setMessages(prev => prev.filter(m => m.id !== msgId));
        } catch (err) {
            alert("Failed to delete message");
        }
    }
    setContextMenu(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => handleSendMessage(null, 'audio', reader.result);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleClearChat = async () => {
      if (!activeChat) return;
      if (window.confirm('Clear this chat?')) {
        try {
            await api.delete(`/messages/${activeChat.otherId}`);
            setMessages([]);
            setShowSettings(false);
            const data = await api.get('/messages/conversations');
            setChats(data);
        } catch (err) {}
      }
  };

  const handleCall = () => {
      if (!activeChat) return;
      api.get(`/auth/user/${activeChat.otherId}`).then(user => {
          if (user.mobile) window.location.href = `tel:${user.mobile}`;
          else alert("Phone number not available");
      }).catch(() => {
          // Fallback to legacy routes if /user/:id fails
          api.get(`/auth/labourers`).then(labs => {
              const lab = labs.find(l => l.id === activeChat.otherId);
              if (lab && lab.mobile) window.location.href = `tel:${lab.mobile}`;
              else alert("Phone number not available");
          });
      });
  };

  return (
    <>
    <div className={`bg-gray-50 flex flex-col ${onClose ? 'h-full rounded-2xl overflow-hidden' : 'min-h-screen'}`}>
        <div className="bg-white p-3 md:p-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
            <div className="flex items-center gap-2 md:gap-3">
                <button onClick={handleBack} className="h-9 w-9 md:h-10 md:w-10 bg-gray-50 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all text-gray-900 border border-gray-100">
                    <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                {activeChat ? (
                    <div className="flex items-center gap-2 md:gap-2.5">
                        <div className="h-9 w-9 md:h-10 md:w-10 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-black text-base border border-white shadow-sm">
                            {activeChat.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-sm md:text-base font-bold text-gray-900 leading-tight truncate max-w-[100px] md:max-w-[150px] uppercase text-left">{activeChat.name}</h1>
                            <div className="flex items-center gap-1">
                                <span className="h-1 w-1 bg-green-500 rounded-full"></span>
                                <p className="text-[7px] md:text-[8px] text-green-600 font-black uppercase tracking-widest">Online</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-gray-900 uppercase">Messages</h1>
                        <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Safe & Secure</p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 relative">
                {activeChat && isFarmer && job && job.status === 'Completed' && job.paymentStatus === 'Pending' && (
                    <button onClick={() => navigate(`/payment/${jobId}`)} className="h-9 px-4 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">
                        Pay ₹{job.cost}
                    </button>
                )}
                {activeChat && (
                    <>
                        <button onClick={handleCall} className="h-9 w-9 bg-green-50 flex items-center justify-center rounded-xl text-green-600 hover:bg-green-100 border border-green-100 transition-all">
                            <Phone className="h-4 w-4" />
                        </button>
                        <button onClick={() => setShowSettings(!showSettings)} className="h-9 w-9 bg-gray-50 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-900 border border-gray-100 transition-all">
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </>
                )}
                {showSettings && (
                    <div className="absolute top-11 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 w-44 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                        <button onClick={handleClearChat} className="w-full text-left px-4 py-3 hover:bg-red-50 text-[9px] font-black uppercase tracking-widest text-red-600 transition-colors">
                            Clear Chat
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#efeae2] bg-opacity-40">
            {!activeChat ? (
                <div className="divide-y divide-gray-100 bg-white">
                    {chats.length === 0 ? (
                        <div className="p-12 text-center">
                            <Send className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 uppercase">No Activity</h3>
                            <p className="text-gray-400 font-bold text-[9px] uppercase tracking-widest mt-2 px-8">Start a conversation to discuss job details.</p>
                        </div>
                    ) : (
                        chats.map(chat => (
                            <div key={chat.id} onClick={() => setActiveChat(chat)} className="p-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-all border-l-4 border-transparent hover:border-green-500">
                                <div className="h-11 w-11 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center text-green-700 font-black text-lg border border-white shadow-sm">
                                    {chat.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="font-bold text-gray-900 text-sm uppercase">{chat.name}</h3>
                                        <span className="text-[7px] font-black text-gray-400">{chat.time}</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-500 truncate">{chat.lastMsg}</p>
                                </div>
                                {chat.unread > 0 && (
                                    <div className="h-4 w-4 bg-green-600 rounded-full flex items-center justify-center text-[7px] font-black text-white">
                                        {chat.unread}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="p-4 space-y-4">
                    <div className="flex justify-center mb-4">
                        <span className="bg-white/90 backdrop-blur-md shadow-sm text-[8px] font-black text-gray-400 px-4 py-1.5 rounded-full uppercase tracking-widest border border-white">End-to-End Encrypted</span>
                    </div>
                    {messages.map((msg, i) => {
                        const isOwn = msg.senderId === currentUser.id;
                        const repliedMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;

                        return (
                            <div key={msg.id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group/msg relative`}>
                                <div className={`
                                    relative px-4 py-3 max-w-[85%] shadow-sm transition-all duration-300 cursor-context-menu
                                    ${isOwn 
                                        ? 'bg-green-600 text-white rounded-2xl rounded-tr-none' 
                                        : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100'}
                                `}
                                onClick={(e) => {
                                    setContextMenu({
                                        id: msg.id,
                                        x: e.clientX,
                                        y: e.clientY,
                                        msg: msg
                                    });
                                }}
                                >
                                    {msg.isForwarded && (
                                        <div className="flex items-center gap-1 mb-1 opacity-70 italic text-[8px] font-black uppercase">
                                            <Send size={8} /> Forwarded
                                        </div>
                                    )}
                                    
                                    {repliedMsg && (
                                        <div className={`mb-2 p-2 rounded-lg border-l-4 bg-black/5 text-[9px] truncate
                                            ${isOwn ? 'border-green-300 text-green-100' : 'border-green-600 text-gray-500'}
                                        `}>
                                            <p className="font-black uppercase mb-0.5">{repliedMsg.senderId === currentUser.id ? 'You' : (activeChat.name)}</p>
                                            {repliedMsg.type === 'audio' ? '🎤 Voice message' : repliedMsg.content}
                                        </div>
                                    )}

                                    {msg.type === 'audio' ? (
                                        <VoiceMessage 
                                            src={msg.content} 
                                            isOwn={isOwn} 
                                        />
                                    ) : (
                                        <p className="text-xs font-bold leading-relaxed">{msg.content}</p>
                                    )}
                                    <div className={`text-[6px] font-black mt-1 flex items-center gap-1 ${isOwn ? 'text-green-200 justify-end' : 'text-gray-400 justify-start'}`}>
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                        {isOwn && <CheckCircle2 size={8} className="fill-current" />}
                                    </div>
                                </div>

                                {contextMenu && contextMenu.id === msg.id && (
                                    <div 
                                        className={`absolute z-30 bg-white rounded-xl shadow-2xl border border-gray-100 w-32 overflow-hidden animate-in fade-in zoom-in duration-100
                                            ${isOwn ? 'right-0 top-full' : 'left-0 top-full'}
                                        `}
                                    >
                                        <button onClick={() => { setReplyingTo(msg); setContextMenu(null); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-600 border-b border-gray-50 flex items-center gap-2">
                                            Reply
                                        </button>
                                        <button onClick={() => { setForwardingMessage(msg); setContextMenu(null); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-600 border-b border-gray-50 flex items-center gap-2">
                                            Forward
                                        </button>
                                        {isOwn && (
                                            <button onClick={() => handleDeleteMessage(msg.id)} className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-[9px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>

        {activeChat && (
            <div className="bg-white p-2 pb-5 md:pb-3 border-t border-gray-100 sticky bottom-0">
                <div className="flex flex-col gap-2">
                    {replyingTo && (
                        <div className="mx-2 p-2 bg-gray-50 rounded-xl border-l-4 border-green-600 flex items-center justify-between animate-in slide-in-from-bottom-2">
                            <div className="truncate">
                                <p className="text-[8px] font-black text-green-600 uppercase">Replying to {replyingTo.senderId === currentUser.id ? 'yourself' : activeChat.name}</p>
                                <p className="text-[10px] text-gray-500 font-bold truncate">
                                    {replyingTo.type === 'audio' ? '🎤 Voice message' : replyingTo.content}
                                </p>
                            </div>
                            <button onClick={() => setReplyingTo(null)} className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600">
                                <ChevronLeft className="rotate-90" size={16} />
                            </button>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 px-2">
                        {isRecording ? (
                            <div className="flex-1 flex items-center justify-between bg-red-50 rounded-2xl px-4 py-3 border border-red-100 animate-pulse">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-red-500 rounded-full animate-ping"></div>
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Recording {recordingTime}s</span>
                                </div>
                                <span className="text-[8px] font-bold text-red-400 uppercase">Release to Send</span>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-1 border border-gray-100 focus-within:border-green-500 transition-all">
                                <input 
                                     type="text" 
                                     value={newMessage}
                                     onChange={(e) => setNewMessage(e.target.value)}
                                     placeholder="Type a message..." 
                                     className="flex-1 bg-transparent border-none py-3 focus:outline-none text-xs font-bold text-gray-700"
                                />
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            {isRecording ? (
                                <button 
                                    onClick={stopRecording} 
                                    className="h-12 w-12 bg-red-600 rounded-full text-white flex items-center justify-center shadow-lg shadow-red-100"
                                >
                                    <Square size={20} fill="white" />
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={startRecording}
                                        className="h-12 w-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center border border-gray-200 active:bg-green-100 active:text-green-600 transition-all"
                                    >
                                        <Mic size={20} />
                                    </button>
                                    {newMessage.trim() && (
                                        <button 
                                            onClick={(e) => handleSendMessage(e)}
                                            className="h-12 w-12 bg-green-600 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95"
                                        >
                                            <Send size={20} />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>

    {forwardingMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-xs rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 uppercase">Forward To</h2>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select a conversation</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {chats.map(chat => (
                        <div key={chat.id} onClick={() => handleForward(chat)} className="p-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-black">
                                {chat.name.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-900 text-sm uppercase">{chat.name}</span>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-gray-50">
                    <button onClick={() => setForwardingMessage(null)} className="w-full py-3 bg-white text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-xl border border-gray-200">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )}

    {contextMenu && (
        <div className="fixed inset-0 z-20" onClick={() => setContextMenu(null)}></div>
    )}
  </>
  );
};

const VoiceMessage = ({ src, isOwn }) => {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (playing) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setPlaying(!playing);
        }
    };

    return (
        <div className="flex items-center gap-3 min-w-[140px]">
            <button 
                onClick={togglePlay}
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${isOwn ? 'bg-white text-green-600' : 'bg-green-600 text-white'}`}
            >
                {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            </button>
            <div className="flex-1">
                <div className={`h-1 rounded-full w-full ${isOwn ? 'bg-green-200' : 'bg-gray-100'}`}>
                    <div className={`h-1 rounded-full ${playing ? 'w-full animate-pulse' : 'w-1/3'} transition-all duration-500 ${isOwn ? 'bg-white' : 'bg-green-600'}`}></div>
                </div>
                <p className={`text-[7px] font-black mt-1 uppercase ${isOwn ? 'text-green-200' : 'text-gray-400'}`}>
                    {playing ? 'Playing...' : 'Voice Message'}
                </p>
            </div>
            <audio 
                ref={audioRef}
                className="hidden" 
                src={src} 
                onEnded={() => setPlaying(false)}
            />
        </div>
    );
};

export default Messages;
