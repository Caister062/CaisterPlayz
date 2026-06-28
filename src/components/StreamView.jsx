import React, { useState, useEffect, useRef } from 'react';
import { Users, Flame, X, ArrowLeft } from 'lucide-react';
import pb from '../pocketbase';
import LiveChat from './LiveChat';

export default function StreamView({ stream, onBack }) {
  const [streamData, setStreamData] = useState(stream);
  const [hypeAnimating, setHypeAnimating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const videoRef = useRef(null);
  const pcRef = useRef(null);

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

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

    // Setup WebRTC Viewer if the stream is P2P
    if (stream.streamUrl === 'webrtc' && stream.isLive) {
      initWebRTCViewer();
    }

    return () => {
      pb.collection('cplayz_streams').unsubscribe(stream.id);
      
      const leaveStream = async () => {
        try {
          await pb.collection('cplayz_streams').update(stream.id, {
            'viewerCount-': 1
          });
          
          if (pcRef.current) {
            await pb.collection('cplayz_webrtc_signals').create({
              streamId: stream.id,
              senderId: pb.authStore.model.id,
              receiverId: stream.hostId,
              signalType: 'leave',
              payload: {}
            });
          }
        } catch (e) {}
      };
      leaveStream();

      if (pcRef.current) {
        pcRef.current.close();
      }
      pb.collection('cplayz_webrtc_signals').unsubscribe('*');
    };
  }, [stream?.id, stream?.isLive]);

  const initWebRTCViewer = async () => {
    const pc = new RTCPeerConnection(configuration);
    pcRef.current = pc;

    // We want to receive video and audio
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        try {
          await pb.collection('cplayz_webrtc_signals').create({
            streamId: stream.id,
            senderId: pb.authStore.model.id,
            receiverId: stream.hostId,
            signalType: 'ice',
            payload: event.candidate
          });
        } catch (e) {}
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected') {
        setIsConnected(true);
      } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setIsConnected(false);
      }
    };

    // Listen for Answer and ICE candidates from Broadcaster
    pb.collection('cplayz_webrtc_signals').subscribe('*', async (e) => {
      if (e.action === 'create' && e.record.receiverId === pb.authStore.model.id && e.record.streamId === stream.id) {
        const { signalType, payload } = e.record;
        
        if (signalType === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
        } else if (signalType === 'ice') {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload));
          } catch (err) {}
        }
      }
    });

    // Create Offer and send to Broadcaster
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    try {
      await pb.collection('cplayz_webrtc_signals').create({
        streamId: stream.id,
        senderId: pb.authStore.model.id,
        receiverId: stream.hostId, // Target the host
        signalType: 'offer',
        payload: offer
      });
    } catch (e) {
      console.error('Failed to send offer:', e);
    }
  };

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
        {streamData.isLive ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            {!isConnected && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', color: '#fff', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 30, height: 30, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Connecting P2P...
              </div>
            )}
          </>
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
