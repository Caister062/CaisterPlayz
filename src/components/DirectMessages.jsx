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
  const [createError, setCreateError] = useState('');
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
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
        await sendSquadMessage(currentUserId, activeSquadId, inputText.trim(), imageFile || '');
      } else {
        await sendMessage(currentUserId, activeRecipientId, inputText.trim(), '', imageFile || '');
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
    setCreateError('');
    try {
      const sq = await createSquad(newSquadName.trim(), currentUserId);
      setActiveSquadId(sq.id);
      setActiveRecipientId(null);
      setShowCreateSquad(false);
      setNewSquadName('');
    } catch (err) {
      console.error(err);
      setCreateError(err?.message || 'Failed to create squad. Try again.');
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
      (!q || u.displayName?.toLowerCase().includes(q) || u.bio?.toLowerCase().includes(q))
    );
  }, [users, currentUserId, userSearchQuery]);

  const enrichedThreads = useMemo(() => {
    return threads.map(t => {
      const user = users.find(u => u.id === t.userId);
      return {
        ...t,
        user: user || { id: t.userId, displayName: `User_${t.userId.slice(0, 5)}` }
      };
    });
  }, [threads, users]);

  if (!isOpen) return null;

  const isChatOpen = !!activeRecipientId || !!activeSquadId;

  return (
    <div className="dm-view">

      {isChatOpen ? (
        /* ───────── CHAT VIEW ───────── */
        <div className="dm-chat">
          <div className="dm-chat-head">
            <button
              className="dm-chat-back"
              onClick={() => {
                setActiveRecipientId(null);
                setActiveSquadId(null);
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              <ArrowLeft size={18} />
            </button>

            <Avatar
              src={activeSquadId ? activeSquad?.avatarUrl : activeRecipient?.avatarUrl}
              name={activeSquadId ? activeSquad?.name : activeRecipient?.displayName}
              size="sm"
            />

            <div style={{ flex: 1 }}>
              <div className="dm-chat-name">
                {activeSquadId ? activeSquad?.name : activeRecipient?.displayName}
              </div>
              <div className="dm-chat-sub">
                {activeSquadId ? 'Squad Chat' : 'Direct Signal'}
              </div>
            </div>

            <button className="dm-icon-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="dm-messages" ref={messagesEndRef}>
            {messagesLoading ? (
              <Spinner />
            ) : messages.length === 0 ? (
              <div className="dm-empty">No signals yet. Drop the first one!</div>
            ) : (
              messages.map(msg => {
                const isOwn = msg.senderId === currentUserId;
                const sender = activeSquadId && !isOwn ? users.find(u => u.id === msg.senderId) : null;
                return (
                  <div key={msg.id} className={`dm-bubble-wrap${isOwn ? ' own' : ''}`}>
                    {sender && <span className="dm-bubble-sender">{sender.displayName}</span>}
                    <div className={`dm-bubble${isOwn ? ' own' : ''}`}>
                      {msg.imageUrl && <img src={msg.imageUrl} alt="" />}
                      {msg.text && <p>{msg.text}</p>}
                    </div>
                    <div className={`dm-bubble-meta${isOwn ? ' own' : ''}`}>
                      <span>{formatTime(msg.created)}</span>
                      {isOwn && (
                        <span className={`dm-read-tick${msg.read ? ' seen' : ''}`}>
                          {msg.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing indicator */}
            {(() => {
              const targetId = activeSquadId || activeRecipientId;
              const typingUsers = users.filter(u => u.id !== currentUserId && u.typingTo === targetId);
              if (!typingUsers.length) return null;
              return (
                <div className="dm-typing">
                  <div className="dm-typing-dots">
                    <div className="dm-typing-dot" />
                    <div className="dm-typing-dot" />
                    <div className="dm-typing-dot" />
                  </div>
                  {typingUsers.map(u => u.displayName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
                </div>
              );
            })()}

            <div ref={feedEndRef} />
          </div>

          <form onSubmit={handleSend} className="dm-input-bar">
            {imagePreview && (
              <div className="dm-img-preview">
                <img src={imagePreview} alt="preview" />
                <button
                  type="button"
                  className="dm-img-remove"
                  onClick={() => { setImagePreview(null); setImageFile(null); }}
                >✕</button>
              </div>
            )}

            <label className="dm-attach-btn" title="Attach image">
              <Image size={18} />
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </label>

            <input
              className="dm-input"
              value={inputText}
              onChange={handleInputChange}
              placeholder={activeSquadId ? `Message ${activeSquad?.name}…` : 'Drop a signal…'}
            />

            <button
              className="dm-send-btn"
              disabled={isSending || (!inputText.trim() && !imageFile)}
            >
              <Send size={15} />
            </button>
          </form>
        </div>

      ) : (
        /* ───────── THREADS / SQUADS LIST ───────── */
        <>
          <div className="dm-head">
            <div className="dm-head-title">
              <MessageSquare size={16} />
              Messages &amp; Squads
            </div>
            <div className="dm-head-actions">
              <button
                className="dm-icon-btn"
                onClick={() => setShowUserSearch(v => !v)}
                title="Search players"
              >
                <Search size={16} />
              </button>
              <button className="dm-icon-btn" onClick={onClose} title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          {showUserSearch && (
            <div className="dm-search-wrap">
              <input
                className="dm-search"
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                placeholder="Search players…"
                autoFocus
              />
            </div>
          )}

          {!showUserSearch && (
            showCreateSquad ? (
              <form onSubmit={handleCreateSquad} className="dm-create-form">
                <div className="dm-create-title">Create Squad</div>
                {createError && (
                  <div style={{ fontSize: 12, color: 'var(--hot)', marginBottom: 8, padding: '6px 8px', background: 'var(--hot-dim)', borderRadius: 6 }}>
                    {createError}
                  </div>
                )}
                <input
                  className="dm-create-input"
                  value={newSquadName}
                  onChange={e => setNewSquadName(e.target.value)}
                  placeholder="Squad name…"
                  autoFocus
                />
                <div className="dm-create-actions">
                  <button type="button" className="dm-create-cancel" onClick={() => { setShowCreateSquad(false); setCreateError(''); }}>
                    Cancel
                  </button>
                  <button type="submit" className="dm-create-submit" disabled={isCreatingSquad}>
                    {isCreatingSquad ? '…' : 'Create'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="dm-section-label">
                <span>Squads</span>
                <span className="dm-section-action" onClick={() => setShowCreateSquad(true)}>+ Create</span>
              </div>
            )
          )}

          <div className="dm-list">
            {/* Squads */}
            {squads.length > 0 && !showUserSearch && squads.map(sq => {
              const isMember = Array.isArray(sq.members) && sq.members.includes(currentUserId);
              return (
                <div
                  key={sq.id}
                  className="dm-row"
                  onClick={() => isMember ? setActiveSquadId(sq.id) : handleJoinSquad(sq)}
                >
                  <div className="dm-row-squad-icon">{sq.name.charAt(0).toUpperCase()}</div>
                  <div className="dm-row-info">
                    <div className="dm-row-name">{sq.name}</div>
                    <div className={`dm-row-sub${isMember ? ' accent' : ''}`}>
                      {isMember ? 'Squad Chat' : 'Tap to Join'}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Section label */}
            {!showUserSearch && (
              <div className="dm-section-label" style={{ marginTop: squads.length ? 8 : 0 }}>
                <span>Direct Messages</span>
              </div>
            )}

            {/* DMs / User search results */}
            {(showUserSearch ? filteredUsers : enrichedThreads).map(item => {
              const user = showUserSearch ? item : item.user;
              return (
                <div key={user.id} className="dm-row" onClick={() => setActiveRecipientId(user.id)}>
                  <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
                  <div className="dm-row-info">
                    <div className="dm-row-name">{user.displayName}</div>
                    <div className="dm-row-sub">{user.bio || 'Start a signal…'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
