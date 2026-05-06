import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { PaperAirplaneIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { useTranslation } from '../utils/i18n_simple';

const MessagesPage = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConvo) {
      fetchMessages(selectedConvo.other_id);
    }
  }, [selectedConvo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data.data);
      if (res.data.data.length > 0 && !selectedConvo) {
        setSelectedConvo(res.data.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const res = await api.get(`/messages/${otherUserId}`);
      setMessages(res.data.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvo) return;

    setSending(true);
    try {
      const res = await api.post('/messages', {
        receiverId: selectedConvo.other_id,
        content: newMessage
      });
      setMessages([...messages, res.data.data]);
      setNewMessage('');
      fetchConversations(); // Update last message in sidebar
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-6">
      <div className="max-w-6xl mx-auto h-[80vh] bg-white rounded-3xl shadow-xl overflow-hidden flex border border-gray-100">
        
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-6 border-b border-gray-100 bg-white">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-orange-500" />
              {t('nav.messages')}
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="font-bold">Aucun message pour le moment</p>
                <p className="text-xs mt-1">Commencez une conversation depuis une commande ou une page produit.</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <div 
                  key={convo.other_id}
                  onClick={() => setSelectedConvo(convo)}
                  className={`p-4 flex gap-4 cursor-pointer transition-all border-b border-gray-50/50 ${
                    selectedConvo?.other_id === convo.other_id ? 'bg-white shadow-sm' : 'hover:bg-gray-100/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0 shadow-sm border-2 border-white">
                    {convo.first_name?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="font-bold text-gray-900 truncate">{convo.first_name} {convo.last_name}</h3>
                      <span className="text-[10px] font-bold text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                        {convo.role === 'vendor' ? 'Vendeur' : 'Client'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate font-medium">{convo.last_message}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wider">
                      {new Date(convo.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConvo ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-white/80 backdrop-blur-md z-10">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shadow-sm">
                  {selectedConvo.first_name?.[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 leading-none">{selectedConvo.first_name} {selectedConvo.last_name}</h2>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{selectedConvo.role === 'vendor' ? 'Vendeur' : 'Client'}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/20">
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                      <div className={`max-w-[70%] ${isMe ? 'order-1' : 'order-2'}`}>
                        <div className={`p-4 rounded-3xl shadow-sm text-sm font-medium ${
                          isMe 
                          ? 'bg-orange-500 text-white rounded-tr-none' 
                          : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                        <p className={`text-[10px] font-bold text-gray-400 mt-2 ${isMe ? 'text-right' : 'text-left'} uppercase tracking-tighter`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-100 bg-white shadow-2xl">
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 p-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-200 outline-none placeholder:text-gray-400 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="p-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white rounded-2xl transition-all shadow-lg shadow-orange-200 hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                  >
                    <PaperAirplaneIcon className="w-6 h-6" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-gray-300">
              <ChatBubbleLeftRightIcon className="w-24 h-24 mb-6 opacity-20" />
              <h2 className="text-3xl font-black text-gray-100 mb-2">Sélectionnez une conversation</h2>
              <p className="max-w-xs font-bold text-gray-400">Choisissez une discussion dans la liste pour commencer à envoyer des messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
