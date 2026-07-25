import React, { useState, useEffect } from 'react';
import { Play, MoreVertical, Heart, Flag } from 'lucide-react';
import pb from '../../pocketbase';



export default function DiscoverView({ onPlayTrack }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const myUserId = pb.authStore.model?.id;

  const fetchTracks = async () => {
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
          likedBy: t.likedBy || [],
          likes: (t.likedBy || []).length
        }));
        setTracks(formatted);
      } else {
        setTracks([]);
      }
    } catch (err) {
      console.error("Could not fetch tracks.", err);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleLike = async (e, track) => {
    e.stopPropagation();
    if (!myUserId) return alert("Log in to like tracks!");
    
    try {
      const isLiked = track.likedBy.includes(myUserId);
      const newLikedBy = isLiked 
        ? track.likedBy.filter(id => id !== myUserId)
        : [...track.likedBy, myUserId];
        
      // Optimistic UI update
      setTracks(prev => prev.map(t => {
        if (t.id === track.id) {
          return { ...t, likedBy: newLikedBy, likes: newLikedBy.length };
        }
        return t;
      }));
      
      // Update backend
      await pb.collection('tracks').update(track.id, {
        likedBy: newLikedBy
      });
    } catch (err) {
      console.error("Failed to like track", err);
      // Revert on error
      fetchTracks();
    }
  };

  if (loading) {
    return <div className="centered">Loading new music...</div>;
  }

  return (
    <div className="discover-view">
      <div className="discover-hero">
        <h2>New Releases</h2>
        <p>Discover original music from independent artists around the world.</p>
      </div>

      {tracks.length === 0 && !loading && (
        <div className="empty-state centered">
          <Music size={48} color="var(--text2)" style={{ marginBottom: 16 }} />
          <h3>No Tracks Yet</h3>
          <p style={{ color: 'var(--text2)' }}>Be the first to upload an original track to IndieStream!</p>
        </div>
      )}

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
              <div className="track-actions" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button 
                  className="icon-btn" 
                  onClick={(e) => handleLike(e, track)} 
                  title="Like Track"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, color: track.likedBy?.includes(myUserId) ? '#f43f5e' : '#fff' }}
                >
                  <Heart size={18} fill={track.likedBy?.includes(myUserId) ? "#f43f5e" : "transparent"} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{track.likes}</span>
                </button>
                <button className="icon-btn" onClick={(e) => { e.stopPropagation(); alert('Track reported to admins.'); }} title="Report Track">
                  <Flag size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
