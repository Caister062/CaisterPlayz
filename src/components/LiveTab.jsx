import { Radio, Video } from 'lucide-react';
import { useState } from 'react';

export default function LiveTab() {
  const [showHost, setShowHost] = useState(false);

  if (showHost) {
    return (
      <div className="p-4 text-white">
        Host Page Test
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">
            🔴 Live
          </h1>

          <p className="text-zinc-400 text-sm">
            Watch live streams from creators
          </p>
        </div>

        <button
          onClick={() => setShowHost(true)}
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl font-bold text-white flex items-center gap-2"
        >
          <Video size={18} />
          Go Live
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <Radio className="mx-auto mb-4 text-red-500" size={40} />

        <h2 className="text-lg font-bold text-white mb-2">
          No Live Streams Yet
        </h2>

        <p className="text-zinc-400 mb-6">
          Be the first creator to go live.
        </p>

        <button
          onClick={() => setShowHost(true)}
          className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-xl font-bold text-white"
        >
          🔴 Start Streaming
        </button>
      </div>
    </div>
  );
}
