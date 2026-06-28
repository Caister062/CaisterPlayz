import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, ShieldAlert, Ban } from 'lucide-react';
import pb from '../pocketbase';

export default function LiveChat({ streamId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState(new Set());
  const chatEndRef = useRef(null);

  // Load chat messages and subscribe to realtime updates
  useEffect(() => {
    if (!streamId) return;
    
    // Load existing messages
    const fetchMessages = async () => {
      try {
        const records = await pb.collection('cplayz_stream_chats').getList(1, 50, {
          filter: `streamId = "${streamId}"`,
          sort: '-created',
          expand: 'userId'
        });
        setMessages(records.items.reverse());
        scrollToBottom();
      } catch (err) {
        console.error('Error fetching chat:', err);
      }
    };
    fetchMessages();

    // Subscribe to new messages
    pb.collection('cplayz_stream_chats').subscribe('*', async (e) => {
      if (e.action === 'create' && e.record.streamId === streamId) {
        // Fetch the expanded user info for the new message
        try {
          const fullMessage = await pb.collection('cplayz_stream_chats').getOne(e.record.id, {
            expand: 'userId'
          });
          setMessages(prev => [...prev, fullMessage]);
          scrollToBottom();
        } catch (err) {}
      }
    });

    return () => {
      pb.collection('cplayz_stream_chats').unsubscribe('*');
    };
  }, [streamId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !pb.authStore.model) return;
    
    const text = newMessage.trim();
    setNewMessage('');
    
    try {
      await pb.collection('cplayz_stream_chats').create({
        streamId: streamId,
        userId: pb.authStore.model.id,
        message: text
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleReport = async (msg) => {
    try {
      await pb.collection('cplayz_reports').create({
        reporterId: pb.authStore.model.id,
        reportedUserId: msg.expand?.userId?.id,
        targetType: 'chat',
        targetId: msg.id,
        reason: 'Inappropriate content in live chat',
        status: 'pending'
      });
      alert('Message reported to moderators.');
      setSelectedMessage(null);
    } catch (err) {
      alert('Failed to report.');
    }
  };

  const handleBlock = (userId) => {
    setBlockedUsers(prev => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });
    alert('User blocked. You will no longer see their messages.');
    setSelectedMessage(null);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.6)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>Live Chat</h3>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.filter(m => !blockedUsers.has(m.userId)).map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <div 
              style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}
              onClick={() => setSelectedMessage(msg.id === selectedMessage ? null : msg.id)}
            >
              <div style={{
                width: 24, height: 24, borderRadius: 12,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden'
              }}>
                {msg.expand?.userId?.avatarUrl ? (
                  <img src={msg.expand.userId.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>
                    {(msg.expand?.userId?.displayName || 'U')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, marginRight: 8 }}>
                  {msg.expand?.userId?.displayName || 'User'}
                </span>
                <span style={{ color: '#fff', fontSize: 14, wordBreak: 'break-word' }}>
                  {msg.message}
                </span>
              </div>
            </div>

            {/* Moderation Actions Menu (Apple Compliance) */}
            {selectedMessage === msg.id && msg.userId !== pb.authStore.model?.id && (
              <div style={{
                marginTop: 8,
                marginLeft: 32,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                padding: 4,
                display: 'flex',
                gap: 8
              }}>
                <button 
                  onClick={() => handleReport(msg)}
                  style={{
                    flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                    border: 'none', padding: '6px 12px', borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <ShieldAlert size={14} /> Report
                </button>
                <button 
                  onClick={() => handleBlock(msg.userId)}
                  style={{
                    flex: 1, background: 'rgba(255, 255, 255, 0.1)', color: '#fff',
                    border: 'none', padding: '6px 12px', borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <Ban size={14} /> Block
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} style={{
        padding: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        gap: '8px',
        background: 'rgba(0,0,0,0.4)'
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Send a message..."
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '10px 16px',
            color: '#fff',
            fontSize: 14,
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          style={{
            width: 40, height: 40,
            borderRadius: 20,
            background: newMessage.trim() ? '#3b82f6' : 'rgba(255,255,255,0.1)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s'
          }}
        >
          <Send size={18} style={{ marginLeft: 2 }} />
        </button>
      </form>
    </div>
  );
}
