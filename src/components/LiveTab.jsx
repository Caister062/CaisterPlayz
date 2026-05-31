import { useEffect, useState } from 'react';
import pb from '../pocketbase';

export default function LiveTab({ currentUser }) {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStreams = async () => {
    try {
      const result = await pb.collection('cplayz_streams').getList(1, 100, {
        filter: 'isLive=true',
        sort: '-created'
      });

      setStreams(result.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();

    let unsubscribe;

    pb.collection('cplayz_streams')
      .subscribe('*', () => {
        fetchStreams();
      })
      .then(fn => {
        unsubscribe = fn;
      });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading streams...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          🔴 Live
        </h1>

        <button
          className="bg-red-600 px-4 py-2 rounded-xl font-bold"
        >
          Go Live
        </button>
      </div>

      {streams.length === 0 ? (
        <div className="text-center text-zinc-400 mt-20">
          Nobody is live right now.
        </div>
      ) : (
        streams.map(stream => (
          <div
            key={stream.id}
            className="bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer"
          >
            <img
              src={
                stream.thumbnailUrl ||
                'https://placehold.co/800x450'
              }
              alt=""
              className="w-full aspect-video object-cover"
            />

            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 px-2 py-1 rounded text-xs font-bold">
                  LIVE
                </span>

                <span className="text-sm">
                  👁 {stream.viewerCount || 0}
                </span>
              </div>

              <h2 className="font-bold mt-2">
                {stream.title}
              </h2>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
