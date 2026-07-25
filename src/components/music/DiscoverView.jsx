import React, { useState, useEffect } from 'react';
import { Play, MoreVertical, Heart, Flag } from 'lucide-react';
import pb from '../../pocketbase';

const MOCK_TRACKS = [
  {
    id: 'mock1',
    title: 'Neon Nights',
    artistName: 'SynthWave Dave',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    likes: 234
  },
  {
    id: 'mock2',
    title: 'Acoustic Sunrise',
    artistName: 'Sarah Strings',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300&h=300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    likes: 89
  },
  {
    id: 'mock3',
    title: 'Urban Flow',
    artistName: 'DJ React',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=300&h=300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    likes: 412
  }
];

export default function DiscoverView({ onPlayTrack }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const records = await pb.collection('tracks').getList(1, 50, {
          sort: '-created',
        });
        if (records.items.length > 0) {
          const formatted = records.items.map(t => ({
            id: t.id,
            title: t.title,
            artistName: t.artistName,
            coverUrl: t.coverFile ? pb.files.getUrl(t, t.coverFile) : null,
            audioUrl: pb.files.getUrl(t, t.audioFile),
            likes: 0
          }));
          setTracks(formatted);
        } else {
          setTracks(MOCK_TRACKS);
        }
      } catch (err) {
        console.warn("Could not fetch tracks, using mock data.", err);
        setTracks(MOCK_TRACKS);
      } finally {
        setLoading(false);
      }
    }
    fetchTracks();
  }, []);

  if (loading) {
    return <div className="centered">Loading new music...</div>;
  }

  return (
    <div className="discover-view">
      <div className="discover-hero">
        <h2>New Releases</h2>
        <p>Discover original music from independent artists around the world.</p>
      </div>

      <div className="track-grid">
        {tracks.map((track, i) => (
          <div key={track.id} className="track-card" onClick={() => onPlayTrack(track, tracks, i)}>
            <div className="track-cover-container">
              <img src={track.coverUrl || 'https://placehold.co/300x300/111/333?text=Art'} alt={track.title} className="track-cover" />
              <div className="track-play-overlay">
                <Play size={32} fill="#fff" />
              </div>
            </div>
            <div className="track-info-footer">
              <div className="track-meta">
                <div className="track-title">{track.title}</div>
                <div className="track-artist">{track.artistName}</div>
              </div>
              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); alert('Track reported to admins.'); }} title="Report Track">
                <Flag size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
