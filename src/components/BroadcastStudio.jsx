import React, { useState, useEffect } from 'react';
import { Video, StopCircle, PlayCircle, Settings, Users, Camera } from 'lucide-react';
import pb from '../pocketbase';
import LiveChat from './LiveChat';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function BroadcastStudio({ onBack }) {
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [token, setToken] = useState('');

  const LIVEKIT_URL = 'wss://lets-do-this-q7xchf2l.livekit.cloud';

  useEffect(() => {
    const fetchOrInitStream = async () => {
      try {
        const records = await pb.collection('cplayz_streams').getList(1, 1, {
          filter: `hostId = "${pb.authStore.model.id}"`
        });

        let currentStream;
        if (records.items.length > 0) {
          currentStream = records.items[0];
          setStreamData(currentStream);
          setTitle(currentStream.title);
        } else {
          currentStream = await pb.collection('cplayz_streams').create({
            hostId: pb.authStore.model.id,
            title: `${pb.authStore.model.displayName || 'User'}'s Stream`,
            isLive: false,
            viewerCount: 0,
            hypeCount: 0,
            streamUrl: 'livekit'
          });
          setStreamData(currentStream);
          setTitle(currentStream.title);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrInitStream();
  }, []);

  const handleUpdateTitle = async () => {
    if (!title.trim() || !streamData) return;
    try {
      await pb.collection('cplayz_streams').update(streamData.id, { title });
      alert('Stream title updated!');
    } catch (err) {}
  };

  const toggleLiveStatus = async () => {
    if (!streamData) return;
    const willBeLive = !streamData.isLive;

    if (willBeLive) {
      // Get LiveKit Token
      try {
        const res = await fetch(`https://caisterplayz-caisterplayz-backend.hf.space/api/livekit-token?room=${streamData.id}`, {
          headers: {
            'Authorization': pb.authStore.token
          }
        });
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
        } else {
          throw new Error('Failed to fetch token');
        }
      } catch (err) {
        alert('Could not start stream: ' + err.message);
        return;
      }
    } else {
      setToken('');
    }

    try {
      const updated = await pb.collection('cplayz_streams').update(streamData.id, {
        isLive: willBeLive,
        viewerCount: !willBeLive ? 0 : streamData.viewerCount,
        hypeCount: !willBeLive ? 0 : streamData.hypeCount,
        streamUrl: 'livekit'
      });
      setStreamData(updated);
    } catch (err) {}
  };

  if (loading) return <div style={{ color: '#fff', padding: 20 }}>Loading Studio...</div>;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: '#000',
      zIndex: 100,
      display: 'flex',
      flexDirection: window.innerWidth > 768 ? 'row' : 'column'
    }}>
      {/* Studio Controls */}
      <div style={{
        flex: window.innerWidth > 768 ? 1 : 'none',
        height: window.innerWidth > 768 ? '100%' : '50vh',
        background: '#111',
        padding: '24px',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Video size={24} color="#3b82f6" /> LiveKit Studio
          </h2>
          <button onClick={onBack} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer'
          }}>Exit</button>
        </div>

        {/* Video Preview */}
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 24, position: 'relative' }}>
          {token ? (
            <LiveKitRoom
              video={true}
              audio={true}
              token={token}
              serverUrl={LIVEKIT_URL}
              data-lk-theme="default"
              style={{ height: '100%' }}
            >
              <VideoConference />
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Camera off
            </div>
          )}
        </div>

        {/* Status Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 20, marginBottom: 24,
          border: `1px solid ${streamData.isLive ? '#ef4444' : 'rgba(255,255,255,0.1)'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>Status</div>
              <div style={{ color: streamData.isLive ? '#ef4444' : '#64748b', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                {streamData.isLive && <span style={{ width: 8, height: 8, borderRadius: 4, background: '#ef4444', animation: 'pulse 2s infinite' }} />}
                {streamData.isLive ? 'LIVE' : 'OFFLINE'}
              </div>
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>Viewers (SFU)</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={18} /> {streamData.viewerCount}
              </div>
            </div>
          </div>

          <button 
            onClick={toggleLiveStatus}
            style={{
              width: '100%', padding: 14, borderRadius: 8, border: 'none',
              background: streamData.isLive ? 'rgba(239, 68, 68, 0.1)' : '#3b82f6',
              color: streamData.isLive ? '#ef4444' : '#fff',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            {streamData.isLive ? <StopCircle size={20} /> : <Camera size={20} />}
            {streamData.isLive ? 'End Stream' : 'Go Live (SFU)'}
          </button>
        </div>

        {/* Stream Settings */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', margin: '0 0 16px 0', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} /> Stream Info
          </h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Stream Title</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff' }}
              />
              <button onClick={handleUpdateTitle} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0 16px', borderRadius: 8, cursor: 'pointer' }}>
                Save
              </button>
            </div>
          </div>
          <p style={{ color: '#10b981', fontSize: 12 }}>
            <strong>Enterprise Mode Active:</strong> Your video is being routed through LiveKit's global edge network. Your device only uploads 1 stream, and the server distributes it to thousands of viewers with 0 delay.
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        width: window.innerWidth > 768 ? '350px' : '100%',
        flex: window.innerWidth > 768 ? 'none' : 1,
        height: window.innerWidth > 768 ? '100%' : 'auto',
      }}>
        {streamData ? <LiveChat streamId={streamData.id} /> : null}
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
