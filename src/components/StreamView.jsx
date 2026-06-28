import React, { useState, useEffect } from 'react';
import { Users, Flame, X, ArrowLeft } from 'lucide-react';
import pb from '../pocketbase';
import LiveChat from './LiveChat';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function StreamView({ stream, onBack }) {
  const [streamData, setStreamData] = useState(stream);
  const [hypeAnimating, setHypeAnimating] = useState(false);
  const [token, setToken] = useState('');

  const LIVEKIT_URL = 'wss://lets-do-this-q7xchf2l.livekit.cloud';

  useEffect(() => {
    if (!stream?.id) return;

    pb.collection('cplayz_streams').subscribe(stream.id, (e) => {
      if (e.action === 'update') setStreamData(e.record);
    });

    const joinStream = async () => {
      try {
        await pb.collection('cplayz_streams').update(stream.id, {
          'viewerCount+': 1
        });
      } catch (e) {}
    };
    joinStream();

    if (stream.streamUrl === 'livekit' && stream.isLive) {
      // Get LiveKit Token as a viewer
      fetch(`https://caisterplayz-caisterplayz-backend.hf.space/api/livekit-token?room=${stream.id}`, {
        headers: {
          'Authorization': pb.authStore.token
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          setToken(data.token);
        }
      })
      .catch(console.error);
    }

    return () => {
      pb.collection('cplayz_streams').unsubscribe(stream.id);
      
      const leaveStream = async () => {
        try {
          await pb.collection('cplayz_streams').update(stream.id, {
            'viewerCount-': 1
          });
        } catch (e) {}
      };
      leaveStream();
    };
  }, [stream?.id, stream?.isLive]);

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
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {streamData.isLive && token ? (
          <LiveKitRoom
            video={false}
            audio={false} // We don't send audio/video as a viewer
            token={token}
            serverUrl={LIVEKIT_URL}
            data-lk-theme="default"
            style={{ width: '100%', height: '100%' }}
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        ) : (
          <div style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: '#ef4444', animation: 'pulse 2s infinite' }} />
            Stream is offline
          </div>
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
