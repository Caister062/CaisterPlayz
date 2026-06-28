import React, { useState, useEffect, useRef } from 'react';
import { Video, StopCircle, PlayCircle, Settings, Users, Monitor, Camera } from 'lucide-react';
import pb from '../pocketbase';
import LiveChat from './LiveChat';

export default function BroadcastStudio({ onBack }) {
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [isLiveLocally, setIsLiveLocally] = useState(false);
  
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map()); // Map of viewerId -> RTCPeerConnection

  // ICE Servers
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    const fetchOrInitStream = async () => {
      try {
        const records = await pb.collection('cplayz_streams').getList(1, 1, {
          filter: `hostId = "${pb.authStore.model.id}"`
        });

        if (records.items.length > 0) {
          setStreamData(records.items[0]);
          setTitle(records.items[0].title);
        } else {
          const newStream = await pb.collection('cplayz_streams').create({
            hostId: pb.authStore.model.id,
            title: `${pb.authStore.model.displayName || 'User'}'s Stream`,
            isLive: false,
            viewerCount: 0,
            hypeCount: 0,
            streamUrl: 'webrtc'
          });
          setStreamData(newStream);
          setTitle(newStream.title);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrInitStream();

    return () => {
      stopLocalVideo();
      // Close all peer connections
      peerConnectionsRef.current.forEach(pc => pc.close());
      peerConnectionsRef.current.clear();
      pb.collection('cplayz_webrtc_signals').unsubscribe('*');
    };
  }, []);

  const handleUpdateTitle = async () => {
    if (!title.trim() || !streamData) return;
    try {
      await pb.collection('cplayz_streams').update(streamData.id, { title });
      alert('Stream title updated!');
    } catch (err) {}
  };

  const startLocalVideo = async (useScreen = false) => {
    try {
      const stream = useScreen 
        ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        : await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return true;
    } catch (err) {
      alert('Could not access camera/microphone: ' + err.message);
      return false;
    }
  };

  const stopLocalVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const toggleLiveStatus = async () => {
    if (!streamData) return;
    
    const willBeLive = !streamData.isLive;

    if (willBeLive) {
      // Prompt for camera/mic before going live
      const started = await startLocalVideo();
      if (!started) return;

      setIsLiveLocally(true);
      // Listen for WebRTC signals (Offers and ICE candidates from Viewers)
      pb.collection('cplayz_webrtc_signals').subscribe('*', async (e) => {
        if (e.action === 'create' && e.record.receiverId === pb.authStore.model.id && e.record.streamId === streamData.id) {
          const { senderId, signalType, payload } = e.record;
          handleSignalingMessage(senderId, signalType, payload);
        }
      });
    } else {
      setIsLiveLocally(false);
      stopLocalVideo();
      pb.collection('cplayz_webrtc_signals').unsubscribe('*');
      peerConnectionsRef.current.forEach(pc => pc.close());
      peerConnectionsRef.current.clear();
    }

    try {
      const updated = await pb.collection('cplayz_streams').update(streamData.id, {
        isLive: willBeLive,
        viewerCount: !willBeLive ? 0 : streamData.viewerCount,
        hypeCount: !willBeLive ? 0 : streamData.hypeCount,
        streamUrl: 'webrtc'
      });
      setStreamData(updated);
    } catch (err) {}
  };

  // --- WebRTC Signaling Logic ---
  const handleSignalingMessage = async (viewerId, type, payload) => {
    let pc = peerConnectionsRef.current.get(viewerId);

    if (type === 'offer') {
      if (!pc) {
        pc = createPeerConnection(viewerId);
        peerConnectionsRef.current.set(viewerId, pc);
      }
      await pc.setRemoteDescription(new RTCSessionDescription(payload));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      // Send answer back to viewer
      await pb.collection('cplayz_webrtc_signals').create({
        streamId: streamData.id,
        senderId: pb.authStore.model.id,
        receiverId: viewerId,
        signalType: 'answer',
        payload: answer
      });
    } else if (type === 'ice' && pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(payload));
      } catch (err) {}
    } else if (type === 'leave' && pc) {
      pc.close();
      peerConnectionsRef.current.delete(viewerId);
    }
  };

  const createPeerConnection = (viewerId) => {
    const pc = new RTCPeerConnection(configuration);

    // Add local stream tracks to the connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await pb.collection('cplayz_webrtc_signals').create({
          streamId: streamData.id,
          senderId: pb.authStore.model.id,
          receiverId: viewerId,
          signalType: 'ice',
          payload: event.candidate
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        pc.close();
        peerConnectionsRef.current.delete(viewerId);
      }
    };

    return pc;
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
            <Video size={24} color="#3b82f6" /> WebRTC Studio
          </h2>
          <button onClick={onBack} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer'
          }}>Exit</button>
        </div>

        {/* Video Preview */}
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 24, position: 'relative' }}>
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
          />
          {!isLiveLocally && (
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
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>Viewers (P2P)</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={18} /> {peerConnectionsRef.current.size} / {streamData.viewerCount}
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
            {streamData.isLive ? 'End Stream' : 'Go Live (Camera)'}
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
          <p style={{ color: '#f59e0b', fontSize: 12 }}>
            <strong>Warning:</strong> You are using WebRTC Pure Peer-to-Peer mode. Your device will upload the video directly to every viewer. Do not exceed ~5 viewers or your connection may drop.
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
