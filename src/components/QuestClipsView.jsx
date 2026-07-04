import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Play, Pause, Flame, Target, MessageSquare, Heart, ShieldAlert, Share2, Bookmark, Plus, X, MoreVertical, Loader, Zap, Volume2, VolumeX } from 'lucide-react';
import { createMediaPost, toggleBoost, toggleRelay, toggleAnchor } from '../hooks';
import pb from '../pocketbase';

/* 
  QuestClipsView
  Vertical video feed designed for fitness and RPG progression.
*/

function ClipPlayer({ clip, isActive, onBoost, onRally, onEcho, onVault, currentUserId }) {
  const [playing, setPlaying] = useState(isActive);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isActive && !videoError) {
      setPlaying(true);
      const playPromise = videoRef.current?.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Autoplay prevented:", e.message || e);
          // Catch ALL errors (NotSupported, NotAllowed, etc.) to guarantee fallback shows
          setVideoError(true);
        });
      }
    } else {
      setPlaying(false);
      videoRef.current?.pause();
    }
  }, [isActive, videoError]);

  const togglePlay = () => {
    if (playing) {
      videoRef.current?.pause();
      setPlaying(false);
    } else {
      videoRef.current?.play();
      setPlaying(true);
    }
  };

  const isBoosted = clip.likedBy?.includes(currentUserId);
  const isVaulted = clip.favoritedBy?.includes(currentUserId);

  // RPG Overlays based on clip metadata
  const xp = clip.metadata?.xp || 0;
  const bossDamage = clip.metadata?.bossDamage || 0;
  const isPR = clip.metadata?.isPR || false;
  const levelUp = clip.metadata?.levelUp || false;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', scrollSnapAlign: 'start', background: '#000', overflow: 'hidden' }}>
      {/* Video Element */}
      {clip.videoUrl && !videoError ? (
        <video 
          ref={videoRef}
          src={clip.videoUrl}
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlay}
          onError={() => setVideoError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)', backgroundSize: '400% 400%', animation: 'gradient 15s ease infinite' }} onClick={togglePlay}>
          {/* Animated CSS Fallback for dead blob URLs / hotlink issues */}
          <style>{`
            @keyframes gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Zap size={48} color="#fff" opacity={0.5} style={{ marginBottom: 16 }} />
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                {videoError ? 'Video Unavailable' : 'Processing...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!playing && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: 20, pointerEvents: 'none' }}>
          <Play fill="#fff" size={48} />
        </div>
      )}

      {/* RPG Overlays (Top Left) */}
      <div style={{ position: 'absolute', top: 20, left: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {xp > 0 && (
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', backdropFilter: 'blur(10px)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'inline-block' }}>
            +{xp} XP
          </div>
        )}
        {bossDamage > 0 && (
          <div style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', backdropFilter: 'blur(10px)', border: '1px solid rgba(244, 63, 94, 0.4)', display: 'inline-block' }}>
            -{bossDamage} DMG
          </div>
        )}
        {isPR && (
          <div style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', backdropFilter: 'blur(10px)', border: '1px solid rgba(234, 179, 8, 0.4)', display: 'inline-block' }}>
            🏆 NEW PR
          </div>
        )}
        {levelUp && (
          <div style={{ background: 'rgba(0, 240, 255, 0.2)', color: 'var(--cyan)', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 240, 255, 0.4)', display: 'inline-block', animation: 'pulse 2s infinite' }}>
            LEVEL UP!
          </div>
        )}
      </div>

      {/* Admin/Safety (Top Right) */}
      <div style={{ position: 'absolute', top: 20, right: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <MoreVertical size={18} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} 
          style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', cursor: 'pointer' }}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Clip Info (Bottom Left) */}
      <div style={{ position: 'absolute', bottom: 100, left: 16, right: 80, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
        <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          @{clip.authorName}
          {clip.metadata?.level && <span style={{ background: 'var(--cyan)', color: '#000', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>Lv.{clip.metadata.level}</span>}
        </h3>
        {clip.metadata?.guild && (
          <div style={{ color: 'var(--cyan)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldAlert size={12} /> {clip.metadata.guild}
          </div>
        )}
        <p style={{ color: '#fff', fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
          {clip.text}
        </p>
      </div>

      {/* Actions Sidebar (Bottom Right) */}
      <div style={{ position: 'absolute', bottom: 100, right: 16, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
        {/* Boost (Like) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button onClick={() => onBoost(clip)} style={{ background: isBoosted ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0,0,0,0.5)', border: `1px solid ${isBoosted ? 'var(--cyan)' : 'transparent'}`, color: isBoosted ? 'var(--cyan)' : '#fff', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', transition: 'all 0.2s ease' }}>
            <Zap size={24} fill={isBoosted ? 'var(--cyan)' : 'none'} />
          </button>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {clip.likedBy?.length || 0}
          </span>
        </div>

        {/* Rally (Comment) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button onClick={() => onRally(clip)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <MessageSquare size={24} />
          </button>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            Rally
          </span>
        </div>

        {/* Echo (Share) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button onClick={() => onEcho(clip)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <Share2 size={24} />
          </button>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            Echo
          </span>
        </div>

        {/* Vault (Save) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button onClick={() => onVault(clip)} style={{ background: isVaulted ? 'rgba(234, 179, 8, 0.2)' : 'rgba(0,0,0,0.5)', border: `1px solid ${isVaulted ? '#eab308' : 'transparent'}`, color: isVaulted ? '#eab308' : '#fff', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', transition: 'all 0.2s ease' }}>
            <Bookmark size={24} fill={isVaulted ? '#eab308' : 'none'} />
          </button>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            Vault
          </span>
        </div>
      </div>
    </div>
  );
}

export default function QuestClipsView({ currentUserId, users, posts }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const scrollRef = useRef(null);

  // Filter only 'clip' type posts
  const clips = useMemo(() => {
    return posts.filter(p => p.type === 'clip').sort((a, b) => new Date(b.created) - new Date(a.created));
  }, [posts]);

  const handleScroll = (e) => {
    const el = e.target;
    const index = Math.round(el.scrollTop / el.clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleBoost = async (clip) => {
    const isBoosted = clip.likedBy?.includes(currentUserId);
    const author = users.find(u => u.id === clip.userId)?.displayName || 'Someone';
    await toggleBoost(clip.id, currentUserId, isBoosted, author);
  };

  const handleRally = (clip) => {
    alert("Rally (Comment) feature coming soon!");
  };

  const handleEcho = async (clip) => {
    const isRelayed = clip.repostedBy?.includes(currentUserId);
    const author = users.find(u => u.id === clip.userId)?.displayName || 'Someone';
    await toggleRelay(clip.id, currentUserId, isRelayed, author);
  };

  const handleVault = async (clip) => {
    const isAnchored = clip.favoritedBy?.includes(currentUserId);
    const author = users.find(u => u.id === clip.userId)?.displayName || 'Someone';
    await toggleAnchor(clip.id, currentUserId, isAnchored, author);
  };

  // Upload Modal State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadSubmit = async () => {
    if (!uploadFile || !uploadCaption) return;
    setIsUploading(true);

    try {
      if (uploadFile.size > 1.5 * 1024 * 1024) {
        alert("Your HuggingFace server rejects files over 1.5MB (413 Payload Too Large). Please choose a smaller video clip or a GIF!");
        setIsUploading(false);
        return;
      }

      const data = {
        xp: Math.floor(Math.random() * 500) + 100, // Simulated XP
        bossDamage: Math.floor(Math.random() * 2000) + 500, // Simulated DMG
        isPR: Math.random() > 0.8,
        levelUp: Math.random() > 0.9,
        level: 5,
        guild: "Iron Vanguard"
      };

      const embeddedText = `<!--METADATA:${JSON.stringify(data)}-->\n${uploadCaption}`;
      
      // We pass the actual File object to createMediaPost which handles FormData
      await createMediaPost(currentUserId, embeddedText, uploadFile, 'quest_clip');
        
      setShowUpload(false);
      setUploadFile(null);
      setUploadCaption('');
      setIsUploading(false);
    } catch (e) {
      console.error(e);
      alert('Failed to upload clip');
      setIsUploading(false);
    }
  };

  // Map clips to parse metadata out of text
  const enrichedClips = useMemo(() => {
    // Treat posts with communityId 'quest_clip' as clips
    return posts.filter(p => p.communityId === 'quest_clip').sort((a, b) => new Date(b.created) - new Date(a.created)).map(clip => {
      let metadata = {};
      let cleanText = clip.text;
      
      const match = clip.text.match(/<!--METADATA:(.*?)-->/);
      if (match) {
        try {
          metadata = JSON.parse(match[1]);
          cleanText = clip.text.replace(match[0], '').trim();
        } catch (e) {}
      }

      const author = users.find(u => u.id === clip.userId);
      
      // If the post has a 'media' file, construct the PocketBase file URL
      const isDeadBlob = clip.imageUrl?.startsWith('blob:');
      const mediaUrl = clip.media ? pb.files.getUrl(clip, clip.media) : null;
      
      return {
        ...clip,
        text: cleanText,
        videoUrl: mediaUrl || (isDeadBlob ? null : clip.imageUrl),
        metadata,
        authorName: author?.displayName || 'Unknown Player'
      };
    });
  }, [posts, users]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', background: '#000' }}>
      {/* Feed Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ 
          width: '100%', height: '100%', 
          overflowY: 'scroll', scrollSnapType: 'y mandatory', 
          scrollbarWidth: 'none', msOverflowStyle: 'none' 
        }}
      >
        <style>{`
          ::-webkit-scrollbar { display: none; }
        `}</style>
        
        {enrichedClips.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', padding: 24, textAlign: 'center' }}>
            <Flame size={48} color="var(--text2)" style={{ opacity: 0.2, marginBottom: 16 }} />
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>The Vault is Empty</h3>
            <p>Upload the first Quest Clip to inspire the community.</p>
          </div>
        ) : (
          enrichedClips.map((clip, index) => (
            <ClipPlayer 
              key={clip.id} 
              clip={clip} 
              isActive={index === activeIndex}
              currentUserId={currentUserId}
              onBoost={handleBoost}
              onRally={handleRally}
              onEcho={handleEcho}
              onVault={handleVault}
            />
          ))
        )}
      </div>

      {/* Floating Upload Button */}
      <button 
        onClick={() => setShowUpload(true)}
        style={{ 
          position: 'absolute', top: 20, right: 16, 
          background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: 20, 
          padding: '8px 16px', fontWeight: 900, fontSize: 13, textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', zIndex: 50,
          boxShadow: '0 0 20px var(--cyan-glow)'
        }}
      >
        <Plus size={16} /> New Clip
      </button>

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 400, background: 'var(--surface)', borderRadius: 24, padding: 24, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upload Quest Clip</h2>
              <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: 'var(--text2)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>Select Video (MP4)</label>
              <input 
                type="file" 
                accept="video/mp4,video/quicktime" 
                onChange={(e) => setUploadFile(e.target.files[0])}
                style={{ width: '100%', padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: '1px dashed var(--border)', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: 'var(--text2)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>Caption</label>
              <textarea 
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Describe your PR, highlight, or victory..."
                rows={4}
                style={{ width: '100%', padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: '1px solid var(--border)', color: '#fff', outline: 'none', resize: 'none' }}
              />
            </div>

            <button 
              onClick={handleUploadSubmit}
              disabled={isUploading || !uploadFile || !uploadCaption}
              style={{ width: '100%', padding: 16, background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 16, textTransform: 'uppercase', cursor: (isUploading || !uploadFile || !uploadCaption) ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', opacity: (isUploading || !uploadFile || !uploadCaption) ? 0.5 : 1 }}
            >
              {isUploading ? <Loader className="spin" size={20} /> : 'Publish Clip'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
