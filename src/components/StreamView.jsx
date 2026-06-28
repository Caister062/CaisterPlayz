import React, { useState, useEffect } from 'react';
import { Users, Flame, X, ArrowLeft } from 'lucide-react';
import pb from '../pocketbase';
import LiveChat from './LiveChat';
import MuxPlayer from '@mux/mux-player-react';

export default function StreamView({ stream, onBack }) {
  const [streamData, setStreamData] = useState(stream);
  const [hypeAnimating, setHypeAnimating] = useState(false);

  useEffect(() => {
    if (!stream?.id) return;

    // Subscribe to stream updates (like viewer count, hype count)
    pb.collection('cplayz_streams').subscribe(stream.id, (e) => {
      if (e.action === 'update') {
        setStreamData(e.record);
      }
    });

    // Simulate joining stream (increment viewer count)
    // In a real app, this should be done via a secure backend endpoint
    // to prevent abuse, but we do it directly here for the MVP.
    const joinStream = async () => {
      try {
        await pb.collection('cplayz_streams').update(stream.id, {
          'viewerCount+': 1
        });
      } catch (e) {}
    };
    joinStream();

    return () => {
      pb.collection('cplayz_streams').unsubscribe(stream.id);
      
      // Leave stream
      const leaveStream = async () => {
        try {
          await pb.collection('cplayz_streams').update(stream.id, {
            'viewerCount-': 1
          });
        } catch (e) {}
      };
      leaveStream();
    };
  }, [stream?.id]);

  const handleHype = async () => {
    if (hypeAnimating) return;
    setHypeAnimating(true);
    setTimeout(() => setHypeAnimating(false), 1000);

    try {
      await pb.collection('cplayz_streams').update(stream.id, {
        'hypeCount+': 1
      });
    } catch (e) {}
  };

  if (!streamData) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: '#000',
      zIndex: 100,
      display: 'flex',
      flexDirection: window.innerWidth > 768 ? 'row' : 'column'
    }}>
      {/* Video Player Area */}
      <div style={{
        flex: window.innerWidth > 768 ? 1 : 'none',
        height: window.innerWidth > 768 ? '100%' : '35vh',
        position: 'relative',
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Video Player */}
        {streamData.streamUrl ? (
          <MuxPlayer
            streamType="live"
            playbackId={streamData.streamUrl}
            metadataVideoTitle={streamData.title}
            metadataViewerUserId={pb.authStore.model?.id}
            primaryColor="#ef4444"
            secondaryColor="#ffffff"
            autoPlay
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <MuxPlayer
            streamType="live"
            playbackId="O6LdRc0112FEJVKyzb8v7428f8LpX01sEOfQhH7p79hZg" 
            metadataVideoTitle="Demo Stream"
            primaryColor="#ef4444"
            secondaryColor="#ffffff"
            autoPlay
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* Video Overlays (Top) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '16px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
        }}>
          <button onClick={onBack} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer', backdropFilter: 'blur(10px)'
          }}>
            <ArrowLeft size={20} />
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '4px 10px',
              borderRadius: 6, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4
            }}>
              LIVE <Users size={14} /> {streamData.viewerCount || 0}
            </div>
          </div>
        </div>

        {/* Video Overlays (Bottom) - Hype Button */}
        <div style={{
          position: 'absolute', bottom: 16, right: 16,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
        }}>
          <button 
            onClick={handleHype}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              border: 'none', borderRadius: '50%',
              width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
              transform: hypeAnimating ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <Flame size={24} fill={hypeAnimating ? '#fff' : 'none'} />
          </button>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {streamData.hypeCount || 0}
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        width: window.innerWidth > 768 ? '350px' : '100%',
        flex: window.innerWidth > 768 ? 'none' : 1,
        height: window.innerWidth > 768 ? '100%' : 'auto',
      }}>
        <LiveChat streamId={streamData.id} />
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
