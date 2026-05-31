import { useRef, useState } from 'react';

export default function LiveStreamHost({ user }) {
  const videoRef = useRef(null);
  const [isLive, setIsLive] = useState(false);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsLive(true);
    } catch (err) {
      console.error(err);
      alert('Failed to access camera or microphone');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-4">
        🔴 Go Live
      </h1>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full rounded-xl bg-black"
      />

      {!isLive && (
        <button
          onClick={startStream}
          className="mt-4 bg-red-600 hover:bg-red-500 px-6 py-3 rounded-xl font-bold text-white"
        >
          Start Stream
        </button>
      )}
    </div>
  );
}
