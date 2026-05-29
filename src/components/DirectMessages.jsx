import { useState, useEffect, useRef, useMemo } from 'react';
import { X, ArrowLeft, Send, Image, Search, MessageSquare } from 'lucide-react';
import { useDirectMessages, sendMessage, useDMThreads } from '../hooks';
import { Avatar, Spinner } from './Shared';
import { formatTime, compressImage } from '../utils';

export default function DirectMessages({ isOpen, onClose, currentUserId, users, initialRecipientId }) {
  const { threads, loading: threadsLoading } = useDMThreads(currentUserId);
  const [activeRecipientId, setActiveRecipientId] = useState(initialRecipientId || null);

  useEffect(() => {
    if (initialRecipientId) {
      setActiveRecipientId(initialRecipientId);
    }
  }, [initialRecipientId]);
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Active chat state
  const { messages, loading: messagesLoading } = useDirectMessages(currentUserId, activeRecipientId);
  const activeRecipient = useMemo(() => {
    return users.find(u => u.id === activeRecipientId);
  }, [users, activeRecipientId]);

  // Message area ref for scrolling
  const feedEndRef = useRef(null);

  // Scroll to bottom helper
  useEffect(() => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeRecipientId]);

  // Image select handler
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 600, 0.7);
      setImagePreview(base64);
      setImageFile(base64);
    } catch (err) {
      console.error('Failed to compress DM image:', err);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !imageFile) return;
    if (!activeRecipientId) return;

    setIsSending(true);
    try {
      await sendMessage(currentUserId, activeRecipientId, inputText.trim(), imageFile || '');
      setInputText('');
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error('Failed to send DM:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Filtered users for starting a new chat
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) {
      // Show all users excluding current user
      return users.filter(u => u.id !== currentUserId);
    }
    const q = userSearchQuery.toLowerCase();
    return users.filter(u => 
      u.id !== currentUserId && 
      (u.displayName?.toLowerCase().includes(q) || u.bio?.toLowerCase().includes(q))
    );
  }, [users, currentUserId, userSearchQuery]);

  // Map threads to user details
  const enrichedThreads = useMemo(() => {
    return threads.map(t => {
      const otherUser = users.find(u => u.id === t.userId);
      return {
        ...t,
        user: otherUser || { id: t.userId, displayName: `User_${t.userId.slice(0,6)}` }
      };
    });
  }, [threads, users]);

  return (
    <div 
      className={`absolute inset-y-0 right-0 w-full bg-dark-bg z-50 flex flex-col border-l border-dark-border transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* ─── Chat View ─── */}
      {activeRecipientId ? (
        <div className="flex-1 flex flex-col h-full relative">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-border bg-dark-bg/95 backdrop-blur">
            <button 
              onClick={() => {
                setActiveRecipientId(null);
                setImageFile(null);
                setImagePreview(null);
              }}
              className="p-1 rounded-full text-dark-muted hover:text-dark-text hover:bg-dark-hover"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar src={activeRecipient?.avatarUrl} name={activeRecipient?.displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-dark-text truncate">
                {activeRecipient?.displayName}
              </h4>
              <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">
                Direct Message
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-dark-muted hover:text-brand-danger"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            {messagesLoading ? (
              <Spinner />
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <MessageSquare className="w-10 h-10 text-dark-muted mb-2" />
                <p className="text-sm font-bold text-dark-text">No messages yet</p>
                <p className="text-xs text-dark-muted">Send a message to start a conversation.</p>
              </div>
            ) : (
              messages.map(msg => {
                const isOwn = msg.senderId === currentUserId;
                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div 
                      className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isOwn 
                          ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-medium rounded-tr-none shadow-[0_0_10px_rgba(0,240,255,0.15)]' 
                          : 'bg-dark-elevated text-dark-text border border-dark-border rounded-tl-none'
                      }`}
                    >
                      {msg.imageUrl && (
                        <img 
                          src={msg.imageUrl} 
                          alt="attached" 
                          className="max-w-full rounded-lg mb-2 object-cover max-h-48"
                        />
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-dark-muted mt-1 px-1">
                      {formatTime(msg.created)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={feedEndRef} />
          </div>

          {/* Image preview overlay above input */}
          {imagePreview && (
            <div className="absolute bottom-[60px] left-4 right-4 p-2 bg-dark-elevated border border-dark-border rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={imagePreview} alt="preview" className="w-12 h-12 object-cover rounded-lg" />
                <span className="text-xs text-dark-muted">Image ready to upload</span>
              </div>
              <button 
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                }}
                className="p-1 rounded-full bg-black/50 text-white hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form Input */}
          <form 
            onSubmit={handleSend}
            className="p-3 border-t border-dark-border bg-dark-bg/95 flex items-center gap-2 safe-bottom"
          >
            <label className="p-2.5 rounded-full text-dark-muted hover:text-brand-primary hover:bg-dark-hover cursor-pointer transition-colors">
              <Image className="w-5 h-5" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" 
              />
            </label>
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
              className="flex-1 bg-dark-surface border border-dark-border rounded-full px-4 py-2 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-brand-primary transition-all"
            />
            <button 
              type="submit"
              disabled={isSending || (!inputText.trim() && !imageFile)}
              className="p-2.5 bg-brand-primary text-white font-bold rounded-full hover:bg-brand-primary/80 disabled:opacity-50 disabled:hover:bg-brand-primary transition-all shadow-sm active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* ─── Threads & User Search View ─── */
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
            <h3 className="text-lg font-black text-dark-text tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-primary" />
              Direct Messages
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowUserSearch(!showUserSearch)}
                className={`p-2 rounded-full transition-colors ${showUserSearch ? 'bg-brand-primary/10 text-brand-primary' : 'text-dark-muted hover:text-dark-text hover:bg-dark-hover'}`}
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-2 rounded-full text-dark-muted hover:text-brand-danger hover:bg-dark-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Search Bar */}
          {showUserSearch && (
            <div className="p-3 border-b border-dark-border bg-dark-surface/50 animate-fade-in">
              <input 
                type="text" 
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-dark-surface border border-dark-border rounded-full px-4 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-primary placeholder-dark-muted"
              />
            </div>
          )}

          {/* Threads/Users List */}
          <div className="flex-1 overflow-y-auto">
            {showUserSearch || enrichedThreads.length === 0 ? (
              // User Search Results / User Discovery Mode
              <div className="p-2 space-y-1">
                <p className="text-[10px] font-black text-dark-muted px-3 py-1 uppercase tracking-wider">
                  {showUserSearch ? 'Search Results' : 'New Chat'}
                </p>
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-dark-muted px-3 py-2 italic">No users found</p>
                ) : (
                  filteredUsers.map(u => (
                    <div 
                      key={u.id}
                      onClick={() => {
                        setActiveRecipientId(u.id);
                        setShowUserSearch(false);
                        setUserSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-hover cursor-pointer transition-colors border border-transparent hover:border-dark-border"
                    >
                      <Avatar src={u.avatarUrl} name={u.displayName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-dark-text truncate">{u.displayName}</p>
                        {u.bio && <p className="text-xs text-dark-muted truncate">{u.bio}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Active Threads List
              <div className="p-2 space-y-1">
                <p className="text-[10px] font-black text-dark-muted px-3 py-1 uppercase tracking-wider">
                  Chats
                </p>
                {threadsLoading && enrichedThreads.length === 0 ? (
                  <Spinner />
                ) : (
                  enrichedThreads.map(thread => (
                    <div 
                      key={thread.userId}
                      onClick={() => setActiveRecipientId(thread.userId)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-hover cursor-pointer transition-colors border border-transparent hover:border-dark-border"
                    >
                      <Avatar src={thread.user?.avatarUrl} name={thread.user?.displayName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className="text-sm font-bold text-dark-text truncate">
                            {thread.user?.displayName}
                          </p>
                          <span className="text-[9px] text-dark-muted">
                            {formatTime(thread.lastMessage?.created)}
                          </span>
                        </div>
                        <p className="text-xs text-dark-muted truncate">
                          {thread.lastMessage?.senderId === currentUserId ? 'You: ' : ''}
                          {thread.lastMessage?.text || 'Sent an image'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
