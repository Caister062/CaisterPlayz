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
  useDMThreads,
  useSquads,
  useSquadMessages,
  sendSquadMessage,
  createSquad,
  joinSquad
} from '../hooks';
import pb from '../pocketbase';

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
  const { squads, loading: squadsLoading } = useSquads();

  const [activeRecipientId, setActiveRecipientId] = useState(null);
  const [activeSquadId, setActiveSquadId] = useState(null);
  
  const [showCreateSquad, setShowCreateSquad] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [isCreatingSquad, setIsCreatingSquad] = useState(false);
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  // Typing state tracking
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const squadMembers = useMemo(() => {
    const squad = squads.find(s => s.id === activeSquadId);
    return squad ? users.filter(u => squad.members?.includes(u.id)) : [];
  }, [squads, activeSquadId, users]);

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
      if (activeRecipientId || activeSquadId) {
        pb.collection('users').update(currentUserId, { typingTo: '' }).catch(() => {});
      }
    };
  }, [activeRecipientId, activeSquadId, currentUserId]);

  const { messages: dmMessages, loading: dmMessagesLoading } = useDirectMessages(
    currentUserId,
    activeRecipientId
  );

  const { messages: squadMessages, loading: squadMessagesLoading } = useSquadMessages(
    activeSquadId
  );

  const messages = activeSquadId ? squadMessages : dmMessages;
  const messagesLoading = activeSquadId ? squadMessagesLoading : dmMessagesLoading;

  const activeRecipient = useMemo(() => {
    return users.find(u => u.id === activeRecipientId);
  }, [users, activeRecipientId]);

  const activeSquad = useMemo(() => {
    return squads.find(s => s.id === activeSquadId);
  }, [squads, activeSquadId]);

  useEffect(() => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeRecipientId, activeSquadId]);

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
    const val = e.target.value;
    setInputText(val);

    const targetId = activeSquadId || activeRecipientId;
    // Update typing status
    if (targetId) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      pb.collection('users').update(currentUserId, { typingTo: targetId }).catch(() => {});
      
      typingTimeoutRef.current = setTimeout(() => {
        pb.collection('users').update(currentUserId, { typingTo: '' }).catch(() => {});
      }, 3000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!activeRecipientId && !activeSquadId) return;
    if (!inputText.trim() && !imageFile) return;

    setIsSending(true);

    try {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      pb.collection('users').update(currentUserId, { typingTo: '' }).catch(() => {});

      if (activeSquadId) {
        await sendSquadMessage(
          currentUserId,
          activeSquadId,
          inputText.trim(),
          imageFile || ''
        );
      } else {
        await sendMessage(
          currentUserId,
          activeRecipientId,
          inputText.trim(),
          imageFile || ''
        );
      }

      setInputText('');
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error('Message send failed:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateSquad = async (e) => {
    e.preventDefault();
    if (!newSquadName.trim()) return;
    setIsCreatingSquad(true);
    try {
      const sq = await createSquad(newSquadName.trim(), currentUserId);
      setActiveSquadId(sq.id);
      setActiveRecipientId(null);
      setShowCreateSquad(false);
      setNewSquadName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingSquad(false);
    }
  };

  const handleJoinSquad = async (squad) => {
    try {
      await joinSquad(squad, currentUserId);
      setActiveSquadId(squad.id);
      setActiveRecipientId(null);
    } catch (err) {
      console.error(err);
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

  const isChatOpen = !!activeRecipientId || !!activeSquadId;

  return (
    <div className="absolute inset-y-0 right-0 w-full sm:w-[400px] backdrop-blur-xl bg-dark-bg/95 z-50 flex flex-col border-l border-dark-border shadow-2xl transition-all duration-300">
      {/* ───────── CHAT VIEW ───────── */}
      {isChatOpen ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-border">
            <button
              onClick={() => {
                setActiveRecipientId(null);
                setActiveSquadId(null);
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {activeSquadId ? (
              <Avatar
                src={activeSquad?.avatarUrl}
                name={activeSquad?.name}
                size="sm"
              />
            ) : (
              <Avatar
                src={activeRecipient?.avatarUrl}
                name={activeRecipient?.displayName}
                size="sm"
              />
            )}

            <div className="flex-1">
              <p className="font-bold text-sm">
                {activeSquadId ? activeSquad?.name : activeRecipient?.displayName}
              </p>
              <p className="text-[10px] text-brand-primary">
                {activeSquadId ? 'Squad Chat' : 'Direct Message'}
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
                const sender = activeSquadId && !isOwn ? users.find(u => u.id === msg.senderId) : null;

                return (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] ${
                      isOwn ? 'ml-auto text-right' : ''
                    }`}
                  >
                    {sender && (
                      <span className="text-[10px] text-dark-muted ml-1 mb-1 block">{sender.displayName}</span>
                    )}
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
            {(() => {
              const targetId = activeSquadId || activeRecipientId;
              const typingUsers = users.filter(u => u.id !== currentUserId && u.typingTo === targetId);
              if (typingUsers.length === 0) return null;

              const names = typingUsers.map(u => u.displayName).join(', ');
              return (
                <div className="text-xs text-brand-primary/80 italic p-2 animate-pulse flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  {names} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              );
            })()}

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
              placeholder={activeSquadId ? `Message ${activeSquad?.name}...` : "Message..."}
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

        /* ───────── THREADS / SQUADS / USERS VIEW ───────── */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-dark-border flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages & Squads
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setShowUserSearch(!showUserSearch)} className="p-2 hover:bg-dark-surface rounded-full">
                <Search className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-dark-surface rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showCreateSquad ? (
             <form onSubmit={handleCreateSquad} className="p-4 border-b border-dark-border bg-dark-surface/50">
               <h4 className="text-sm font-bold mb-2">Create New Squad</h4>
               <input
                 value={newSquadName}
                 onChange={e => setNewSquadName(e.target.value)}
                 className="w-full bg-dark-bg border border-dark-border px-4 py-2 rounded-lg text-sm mb-2"
                 placeholder="Squad Name"
               />
               <div className="flex gap-2 justify-end">
                 <button type="button" onClick={() => setShowCreateSquad(false)} className="px-3 py-1 text-sm text-dark-muted">Cancel</button>
                 <button disabled={isCreatingSquad} type="submit" className="px-3 py-1 text-sm bg-brand-primary rounded-lg font-bold">Create</button>
               </div>
             </form>
          ) : (
             <div className="px-4 py-2 flex justify-between items-center border-b border-dark-border">
               <span className="text-xs font-bold text-dark-muted uppercase">Squads</span>
               <button onClick={() => setShowCreateSquad(true)} className="text-xs text-brand-primary font-bold hover:underline">+ Create</button>
             </div>
          )}

          {/* Search */}
          {showUserSearch && (
            <div className="p-3 border-b border-dark-border">
              <input
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-dark-surface px-4 py-2 rounded-full text-sm"
              />
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            
            {/* Squads List */}
            {squads.length > 0 && !showUserSearch && (
              <div className="space-y-1">
                {squads.map(sq => {
                  const isMember = Array.isArray(sq.members) && sq.members.includes(currentUserId);
                  return (
                    <div
                      key={sq.id}
                      className="flex items-center gap-3 p-3 hover:bg-dark-hover rounded-xl cursor-pointer"
                      onClick={() => isMember ? setActiveSquadId(sq.id) : handleJoinSquad(sq)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                        {sq.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{sq.name}</p>
                        <p className="text-xs text-brand-primary">{isMember ? 'Squad Chat' : 'Tap to Join'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DMs List */}
            <div>
              {!showUserSearch && <div className="px-2 pb-2 text-xs font-bold text-dark-muted uppercase">Direct Messages</div>}
              <div className="space-y-1">
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

          </div>
        </div>
      )}
    </div>
  );
}
