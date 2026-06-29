import { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  ArrowLeft,
  Send,
  Image,
  Search,
  MessageSquare
} from 'lucide-react';

import {
  useDirectMessages,
  sendMessage,
  useDMThreads
} from '../hooks';

import { Avatar, Spinner } from './Shared';
import { formatTime, compressImage } from '../utils';

export default function DirectMessages({
  isOpen,
  onClose,
  currentUserId,
  users,
  initialRecipientId
}) {
  const { threads, loading: threadsLoading } = useDMThreads(currentUserId);

  const [activeRecipientId, setActiveRecipientId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  // Typing state tracking
  const typingTimeoutRef = useRef(null);

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);

  const feedEndRef = useRef(null);

  useEffect(() => {
    if (initialRecipientId) {
      setActiveRecipientId(initialRecipientId);
    }
  }, [initialRecipientId]);

  // Clear typing status on unmount or active recipient change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (activeRecipientId) {
        pb.collection('users').update(currentUserId, { typingTo: '' }).catch(() => {});
      }
    };
  }, [activeRecipientId, currentUserId]);

  const { messages, loading: messagesLoading } = useDirectMessages(
    currentUserId,
    activeRecipientId
  );

  const activeRecipient = useMemo(() => {
    return users.find(u => u.id === activeRecipientId);
  }, [users, activeRecipientId]);

  useEffect(() => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeRecipientId]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await compressImage(file, 600, 0.7);
      setImagePreview(base64);
      setImageFile(base64);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Update typing status
    if (activeRecipientId) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      pb.collection('users').update(currentUserId, { typingTo: activeRecipientId }).catch(() => {});
      
      typingTimeoutRef.current = setTimeout(() => {
        pb.collection('users').update(currentUserId, { typingTo: '' }).catch(() => {});
      }, 3000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!activeRecipientId) return;
    if (!inputText.trim() && !imageFile) return;

    setIsSending(true);

    try {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      pb.collection('users').update(currentUserId, { typingTo: '' }).catch(() => {});

      await sendMessage(
        currentUserId,
        activeRecipientId,
        inputText.trim(),
        imageFile || ''
      );

      setInputText('');
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error('DM send failed:', err);
    } finally {
      setIsSending(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearchQuery.toLowerCase();

    return users.filter(u =>
      u.id !== currentUserId &&
      (!q ||
        u.displayName?.toLowerCase().includes(q) ||
        u.bio?.toLowerCase().includes(q))
    );
  }, [users, currentUserId, userSearchQuery]);

  const enrichedThreads = useMemo(() => {
    return threads.map(t => {
      const user = users.find(u => u.id === t.userId);
      return {
        ...t,
        user: user || {
          id: t.userId,
          displayName: `User_${t.userId.slice(0, 5)}`
        }
      };
    });
  }, [threads, users]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-full backdrop-blur-xl bg-dark-bg/95 z-50 flex flex-col border-l border-dark-border shadow-2xl transition-all duration-300">

      {/* ───────── CHAT VIEW ───────── */}
      {activeRecipientId ? (
        <div className="flex-1 flex flex-col">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-border">
            <button
              onClick={() => {
                setActiveRecipientId(null);
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <Avatar
              src={activeRecipient?.avatarUrl}
              name={activeRecipient?.displayName}
              size="sm"
            />

            <div className="flex-1">
              <p className="font-bold text-sm">
                {activeRecipient?.displayName}
              </p>
              <p className="text-[10px] text-brand-primary">
                Direct Message
              </p>
            </div>

            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messagesLoading ? (
              <Spinner />
            ) : messages.length === 0 ? (
              <div className="text-center text-sm text-dark-muted">
                No messages yet
              </div>
            ) : (
              messages.map(msg => {
                const isOwn = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] ${
                      isOwn ? 'ml-auto text-right' : ''
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-brand-primary text-white'
                          : 'bg-dark-surface'
                      }`}
                    >
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          className="rounded-lg mb-2 max-h-48"
                        />
                      )}
                      <p>{msg.text}</p>
                    </div>

                    <div className={`flex items-center gap-1 mt-1 text-[10px] ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-dark-muted">{formatTime(msg.created)}</span>
                      {isOwn && (
                        <span className={msg.read ? 'text-brand-primary font-bold' : 'text-dark-muted'} title={msg.read ? 'Read' : 'Delivered'}>
                          {msg.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {activeRecipient?.typingTo === currentUserId && (
              <div className="flex items-center gap-2 mb-2 ml-4">
                <Avatar src={activeRecipient.avatarUrl} name={activeRecipient.displayName} size="sm" />
                <div className="bg-dark-surface p-3 rounded-2xl flex gap-1 items-center max-w-[80%]">
                  <div className="w-2 h-2 bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={feedEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-dark-border flex gap-2 items-center bg-dark-bg/50 backdrop-blur-md"
          >
            {imagePreview && (
              <div className="relative w-10 h-10">
                <img src={imagePreview} className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setImageFile(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <label className="p-2 text-dark-muted hover:text-white cursor-pointer transition-colors">
              <Image className="w-5 h-5" />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            <input
              value={inputText}
              onChange={handleInputChange}
              className="flex-1 bg-dark-surface border border-dark-border px-4 py-2.5 rounded-full text-sm outline-none focus:border-brand-primary transition-colors"
              placeholder="iMessage..."
            />

            <button
              disabled={isSending || (!inputText.trim() && !imageFile)}
              className="bg-brand-primary disabled:opacity-50 text-white p-2.5 rounded-full transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (

        /* ───────── THREADS / USERS VIEW ───────── */
        <div className="flex-1 flex flex-col">

          {/* Header */}
          <div className="p-3 border-b border-dark-border flex justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
            </h3>

            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          {showUserSearch && (
            <div className="p-3 border-b">
              <input
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-dark-surface px-4 py-2 rounded-full"
              />
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">

            {(showUserSearch ? filteredUsers : enrichedThreads).map(item => {
              const user = showUserSearch ? item : item.user;

              return (
                <div
                  key={user.id}
                  onClick={() => setActiveRecipientId(user.id)}
                  className="flex items-center gap-3 p-3 hover:bg-dark-hover rounded-xl cursor-pointer"
                >
                  <Avatar
                    src={user.avatarUrl}
                    name={user.displayName}
                    size="sm"
                  />

                  <div className="flex-1">
                    <p className="font-bold text-sm">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-dark-muted truncate">
                      {user.bio || 'Start chatting'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
