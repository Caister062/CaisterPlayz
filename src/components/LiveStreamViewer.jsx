import { useEffect, useRef, useState } from 'react';
import pb from '../pocketbase';

export default function LiveStreamViewer({ streamId, user }) {
  const videoRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!streamId || !user) return;

    const connect = async () => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [
            {
              urls: 'stun:stun.l.google.com:19302'
            }
          ]
        });

        pc.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
          }
        };

        const offerResult = await pb.collection('cplayz_signals').getList(1, 1, {
          filter: `streamId="${streamId}" && type="offer"`,
          sort: '-created'
        });

        if (!offerResult.items.length) {
          return;
        }

        const offer = JSON.parse(
          offerResult.items[0].payload
        );

        await pc.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const answer = await pc.createAnswer();

        await pc.setLocalDescription(answer);

        await pb.collection('cplayz_signals').create({
          streamId,
          senderId: user.id,
          receiverId: '',
          type: 'answer',
          payload: JSON.stringify(answer)
        });

        pc.onicecandidate = async (event) => {
          if (!event.candidate) return;

          await pb.collection('cplayz_signals').create({
            streamId,
            senderId: user.id,
            receiverId: '',
            type: 'candidate',
            payload: JSON.stringify(event.candidate)
          });
        };

        setConnected(true);

      } catch (err) {
        console.error(err);
      }
    };

    connect();
  }, [streamId, user]);

  return (
    <div className="p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full rounded-xl bg-black"
      />

      <div className="mt-3 text-sm">
        {connected ? '🟢 Connected' : '🟡 Connecting...'}
      </div>
    </div>
  );
}
