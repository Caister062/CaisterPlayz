import React, { useState, useEffect } from 'react';
import { Video, PlayCircle, Users } from 'lucide-react';
import pb from '../pocketbase';

export default function LiveStreamsTab({ onWatchStream, onBroadcast }) {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const records = await pb.collection('cplayz_streams').getList(1, 50, {
          filter: 'isLive = true',
          sort: '-viewerCount',
          expand: 'hostId'
        });
        setStreams(records.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();

    // Subscribe to stream updates
    const unsub = pb.collection('cplayz_streams').subscribe('*', (e) => {
      if (e.action === 'create' && e.record.isLive) {
        setStreams(prev => [e.record, ...prev]);
      } else if (e.action === 'update') {
        setStreams(prev => {
          if (!e.record.isLive) {
            return prev.filter(s => s.id !== e.record.id);
          }
          const exists = prev.find(s => s.id === e.record.id);
          if (exists) {
            return prev.map(s => s.id === e.record.id ? e.record : s).sort((a, b) => b.viewerCount - a.viewerCount);
          }
          return [...prev, e.record].sort((a, b) => b.viewerCount - a.viewerCount);
        });
      } else if (e.action === 'delete') {
        setStreams(prev => prev.filter(s => s.id !== e.record.id));
      }
    });

    return () => {
      pb.collection('cplayz_streams').unsubscribe('*');
    };
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Video color="#ef4444" /> Live Streams
        </h2>
        <button 
          onClick={onBroadcast}
          style={{
            background: '#3b82f6', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: 12, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <PlayCircle size={18} /> Go Live
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>Scanning frequencies...</div>
      ) : streams.length === 0 ? (
        <div style={{ 
          color: '#64748b', textAlign: 'center', padding: 60,
          background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)'
        }}>
          <Video size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <div>No active streams right now.</div>
          <div style={{ fontSize: 13, marginTop: 8 }}>Be the first to go live!</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {streams.map(stream => (
            <div 
              key={stream.id}
              onClick={() => onWatchStream(stream)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.2s',
                display: 'flex', flexDirection: 'column'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Thumbnail Placeholder */}
              <div style={{ height: 160, background: '#111', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: '#ef4444', color: '#fff', padding: '4px 8px',
                  borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em'
                }}>
                  LIVE
                </div>
                <div style={{
                  position: 'absolute', bottom: 12, left: 12,
                  background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px',
                  borderRadius: 6, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                  backdropFilter: 'blur(4px)'
                }}>
                  <Users size={12} /> {stream.viewerCount}
                </div>
              </div>
              
              {/* Stream Info */}
              <div style={{ padding: 16, display: 'flex', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 20, background: '#3b82f6',
                  flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {stream.expand?.hostId?.avatarUrl ? (
                    <img src={stream.expand.hostId.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>
                      {(stream.expand?.hostId?.displayName || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {stream.title}
                  </h3>
                  <div style={{ color: '#94a3b8', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {stream.expand?.hostId?.displayName || 'Unknown User'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
