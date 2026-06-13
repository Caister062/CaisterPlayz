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

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);

  const feedEndRef = useRef(null);

  useEffect(() => {
    if (initialRecipientId) {
      setActiveRecipientId(initialRecipientId);
    }
  }, [initialRecipientId]);

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

  const handleSend = async (e) => {
    e.preventDefault();

    if (!activeRecipientId) return;
    if (!inputText.trim() && !imageFile) return;

    setIsSending(true);

    try {
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
    <div className="absolute inset-y-0 right-0 w-full bg-dark-bg z-50 flex flex-col border-l border-dark-border">

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

                    <p className="text-[10px] text-dark-muted mt-1">
                      {formatTime(msg.created)}
                    </p>
                  </div>
                );
              })
            )}

            <div ref={feedEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-dark-border flex gap-2"
          >
            <label>
              <Image className="w-5 h-5" />
              <input
                type="file"
                hidden
                onChange={handleImageChange}
              />
            </label>

            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-dark-surface px-4 py-2 rounded-full"
              placeholder="Message..."
            />

            <button
              disabled={isSending}
              className="bg-brand-primary text-white p-2 rounded-full"
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
