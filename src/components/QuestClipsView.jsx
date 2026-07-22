import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Play, Pause, Flame, Target, MessageSquare, Heart, ShieldAlert, Share2, Bookmark, Plus, X, MoreVertical, Loader, Zap, Volume2, VolumeX, Send } from 'lucide-react';
import { createMediaPost, toggleBoost, toggleRelay, toggleAnchor, addComment } from '../hooks';
import { formatCount } from '../utils';
import pb from '../pocketbase';

function ClipPlayer({ clip, isActive, onBoost, onComment, onShare, onSave, currentUserId }) {
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

  const isLiked = clip.likedBy?.includes(currentUserId);
  const isSaved = clip.favoritedBy?.includes(currentUserId);

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
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'linear-gradient(-45deg, #1e1b4b, #2e0847, #061c30, #0f172a)', backgroundSize: '400% 400%', animation: 'gradient 15s ease infinite' }} onClick={togglePlay}>
          <style>{`
            @keyframes gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Zap size={48} color="#00f0ff" opacity={0.5} style={{ marginBottom: 16 }} />
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                {videoError ? 'Video Clip Unavailable' : 'Processing Fortnite Clip...'}
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

      {/* Fortnite Gameplay Badges (Top Left) */}
      <div style={{ position: 'absolute', top: 20, left: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ background: 'rgba(0, 240, 255, 0.2)', color: '#00f0ff', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 240, 255, 0.4)', display: 'inline-block' }}>
          🎮 {clip.mode || 'Zero Build'}
        </div>
        {clip.rank && (
          <div style={{ background: 'rgba(255, 215, 0, 0.2)', color: '#ffd700', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 215, 0, 0.4)', display: 'inline-block' }}>
            🏆 {clip.rank}
          </div>
        )}
      </div>

      {/* Mute/Unmute (Top Right) */}
      <div style={{ position: 'absolute', top: 20, right: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} 
          style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', cursor: 'pointer' }}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Clip Info (Bottom Left) */}
      <div style={{ position: 'absolute', bottom: 125, left: 16, right: 84, textShadow: '0 2px 4px rgba(0,0,0,0.8)', zIndex: 10 }}>
        <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
          @{clip.authorName}
          <span style={{ background: '#7c3aed', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 900 }}>FORTNITE CREATOR</span>
        </h3>
        <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, lineHeight: 1.4, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {clip.text}
        </p>
      </div>

      {/* Actions Sidebar (Bottom Right) */}
      <div style={{ position: 'absolute', bottom: 120, right: 12, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', zIndex: 10 }}>
        {/* Like */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <button onClick={() => onBoost(clip)} style={{ background: isLiked ? 'rgba(244, 63, 94, 0.2)' : 'rgba(0,0,0,0.5)', border: `1px solid ${isLiked ? '#f43f5e' : 'transparent'}`, color: isLiked ? '#f43f5e' : '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', transition: 'all 0.2s ease', cursor: 'pointer' }}>
            <Heart size={22} fill={isLiked ? '#f43f5e' : 'none'} color={isLiked ? '#f43f5e' : '#fff'} />
          </button>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {formatCount(clip.likedBy?.length || clip.likes || 0)}
          </span>
        </div>

        {/* Comment */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <button onClick={() => onComment(clip)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', cursor: 'pointer' }}>
            <MessageSquare size={22} />
          </button>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {formatCount(clip.commentsCount || clip.comments?.length || 0)}
          </span>
        </div>

        {/* Share */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <button onClick={() => onShare(clip)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', cursor: 'pointer' }}>
            <Share2 size={22} />
          </button>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {formatCount(clip.repostedBy?.length || clip.shares || 0)}
          </span>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <button onClick={() => onSave(clip)} style={{ background: isSaved ? 'rgba(234, 179, 8, 0.2)' : 'rgba(0,0,0,0.5)', border: `1px solid ${isSaved ? '#eab308' : 'transparent'}`, color: isSaved ? '#eab308' : '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', transition: 'all 0.2s ease', cursor: 'pointer' }}>
            <Bookmark size={22} fill={isSaved ? '#eab308' : 'none'} />
          </button>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {formatCount(clip.favoritedBy?.length || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function QuestClipsView({ currentUserId, users, posts }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [activeCommentClip, setActiveCommentClip] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState([
    { id: 'c1', name: 'TiltedSweat', text: 'Insane clutch! 🔥 What loadout were you running?' },
    { id: 'c2', name: 'ZeroBuildPro', text: 'Clean shotgun shot reset! GG' }
  ]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const scrollRef = useRef(null);

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

  const handleOpenCommentModal = async (clip) => {
    setActiveCommentClip(clip);
    if (!clip?.id) return;
    try {
      const res = await pb.collection('cplayz_comments').getList(1, 50, {
        filter: `postId="${clip.id}"`,
        sort: 'created'
      });
      if (res.items.length > 0) {
        setCommentsList(res.items.map(item => {
          const u = users.find(usr => usr.id === item.userId);
          return {
            id: item.id,
            name: u?.displayName || item.authorName || 'Fortnite Gamer',
            text: item.text
          };
        }));
      } else {
        setCommentsList([]);
      }
    } catch (e) {
      setCommentsList([]);
    }
  };

  const handleSendComment = async () => {
    if (!commentInput.trim() || !activeCommentClip) return;
    setSubmittingComment(true);
    const userObj = users.find(u => u.id === currentUserId);
    const name = userObj?.displayName || 'Fortnite Gamer';
    const newText = commentInput.trim();

    try {
      await pb.collection('cplayz_comments').create({
        postId: activeCommentClip.id,
        userId: currentUserId,
        text: newText,
        authorName: name
      });

      setCommentsList(prev => [...prev, { id: Date.now().toString(), name, text: newText }]);
      setCommentInput('');
    } catch (e) {
      console.error('PocketBase comment error:', e);
      setCommentsList(prev => [...prev, { id: Date.now().toString(), name, text: newText }]);
      setCommentInput('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async (clip) => {
    const isRelayed = clip.repostedBy?.includes(currentUserId);
    const author = users.find(u => u.id === clip.userId)?.displayName || 'Someone';
    await toggleRelay(clip.id, currentUserId, isRelayed, author);
    alert('Clip link copied to clipboard!');
  };

  const handleSave = async (clip) => {
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
        alert("Server rejects files over 1.5MB. Please choose a smaller video clip or a GIF!");
        setIsUploading(false);
        return;
      }

      const data = {
        communityId: 'quest_clip',
        text: uploadCaption,
        media: uploadFile
      };

      await createMediaPost(currentUserId, data);
      setShowUpload(false);
      setUploadFile(null);
      setUploadCaption('');
    } catch (err) {
      console.error(err);
      alert('Failed to upload clip');
    } finally {
      setIsUploading(false);
    }
  };

  // Map clips to parse metadata out of text
  const enrichedClips = useMemo(() => {
    const realClips = posts.filter(p => p.communityId === 'quest_clip' || p.videoUrl || p.media || p.category === 'clip').sort((a, b) => new Date(b.created) - new Date(a.created)).map(clip => {
      let metadata = {};
      let cleanText = clip.text || clip.content || '';
      
      const match = (clip.text || '').match(/<!--METADATA:(.*?)-->/);
      if (match) {
        try {
          metadata = JSON.parse(match[1]);
          cleanText = clip.text.replace(match[0], '').trim();
        } catch (e) {}
      }

      const author = users.find(u => u.id === clip.userId);
      const isDeadBlob = clip.imageUrl?.startsWith('blob:');
      const mediaUrl = (clip.media && pb.getFileUrl) ? pb.getFileUrl(clip, clip.media) : null;
      
      return {
        ...clip,
        text: cleanText,
        videoUrl: mediaUrl || (isDeadBlob ? null : clip.imageUrl),
        metadata,
        authorName: author?.displayName || 'Fortnite Gamer'
      };
    });

    const simulatedFortniteClips = [
      {
        id: 'fn-clip-1',
        authorName: 'Ninja_Clutch',
        text: 'Insane 1v4 Solo vs Squad Zero Build Victory Royale clutch! 🏆 24 Kills drop at Tilted Towers.',
        mode: 'Zero Build',
        rank: 'Unreal',
        likes: 1420,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-gameplay-of-a-first-person-shooter-game-41459-large.mp4'
      },
      {
        id: 'fn-clip-2',
        authorName: 'MythicSniper',
        text: '300m heavy sniper headshot out of a Choppa! 🎯 Fortnite OG Season vibes.',
        mode: 'Battle Royale',
        rank: 'Champion',
        likes: 890,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-controller-playing-a-video-game-41460-large.mp4'
      },
      {
        id: 'fn-clip-3',
        authorName: 'ReloadGod_99',
        text: 'Endgame zone wars clutch victory! Double pump combo clean edit reset. ⚡',
        mode: 'Reload',
        rank: 'Elite',
        likes: 2150,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-playing-an-online-video-game-41461-large.mp4'
      },
      {
        id: 'fn-clip-4',
        authorName: 'CreativeKing_UEFN',
        text: 'Built the ultimate 1v1 Box Fight & Zone Wars UEFN map code! Drop in now: 9812-4410-0912 🧩',
        mode: 'Creative / UEFN',
        rank: 'Unreal',
        likes: 3100,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-game-over-screen-on-a-computer-monitor-41462-large.mp4'
      },
      {
        id: 'fn-clip-5',
        authorName: 'TiltedSweat',
        text: '20 Kill streak in Reload Duos. Dropped 5 squads in Clocktower! 🔥',
        mode: 'Reload',
        rank: 'Diamond III',
        likes: 975,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-gamer-playing-a-video-game-41463-large.mp4'
      }
    ];

    const fullFeed = [...realClips, ...simulatedFortniteClips];
    return [...fullFeed, ...simulatedFortniteClips.map((c, i) => ({ ...c, id: `${c.id}-repeat-1` })), ...simulatedFortniteClips.map((c, i) => ({ ...c, id: `${c.id}-repeat-2` }))];
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
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: 24, textAlign: 'center' }}>
            <Flame size={48} color="#94a3b8" style={{ opacity: 0.2, marginBottom: 16 }} />
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>No Fortnite Clips Yet</h3>
            <p>Upload the first Fortnite Victory Royale or Clutch Clip for the community.</p>
          </div>
        ) : (
          enrichedClips.map((clip, index) => (
            <ClipPlayer 
              key={clip.id} 
              clip={clip} 
              isActive={index === activeIndex}
              currentUserId={currentUserId}
              onBoost={handleBoost}
              onComment={handleOpenCommentModal}
              onShare={handleShare}
              onSave={handleSave}
            />
          ))
        )}
      </div>

      {/* Floating Upload Button */}
      <button 
        onClick={() => setShowUpload(true)}
        style={{ 
          position: 'absolute', top: 20, right: 16, 
          background: 'linear-gradient(135deg, #00f0ff 0%, #7c3aed 100%)', color: '#000', border: 'none', borderRadius: 20, 
          padding: '8px 16px', fontWeight: 900, fontSize: 13, textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', zIndex: 50,
          boxShadow: '0 4px 15px rgba(0, 240, 255, 0.4)'
        }}
      >
        <Plus size={16} /> New Clip
      </button>

      {/* Real-time Comments Drawer */}
      {activeCommentClip && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'flex-end',
            justify: 'center'
          }}
          onClick={() => setActiveCommentClip(null)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: 480,
              height: '60vh',
              background: '#0f172a',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              border: '1px solid #334155',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
              animation: 'slideUp 0.25s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #1e293b', paddingBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
                Comments ({commentsList.length})
              </div>
              <button onClick={() => setActiveCommentClip(null)} style={{ background: '#1e293b', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {/* Comments List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
              {commentsList.map(c => (
                <div key={c.id} style={{ background: '#1e293b', padding: '10px 14px', borderRadius: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#00f0ff', marginBottom: 2 }}>
                    @{c.name}
                  </div>
                  <div style={{ fontSize: 13, color: '#e2e8f0' }}>
                    {c.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Row */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 12, borderTop: '1px solid #1e293b' }}>
              <input 
                type="text"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                placeholder="Write a comment..."
                style={{
                  flex: 1,
                  background: '#020617',
                  border: '1px solid #334155',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendComment}
                disabled={submittingComment || !commentInput.trim()}
                style={{
                  background: 'linear-gradient(135deg, #00f0ff 0%, #7c3aed 100%)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 12,
                  padding: '0 16px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center'
                }}
              >
                {submittingComment ? <Loader size={16} className="spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 400, background: '#0f172a', borderRadius: 24, padding: 24, border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upload Fortnite Clip</h2>
              <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>Select Video (MP4)</label>
              <input 
                type="file" 
                accept="video/mp4,video/quicktime" 
                onChange={(e) => setUploadFile(e.target.files[0])}
                style={{ width: '100%', padding: 12, background: '#020617', borderRadius: 12, border: '1px dashed #334155', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>Caption</label>
              <textarea 
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Describe your Victory Royale, clutch play, or squad drop..."
                rows={4}
                style={{ width: '100%', padding: 12, background: '#020617', borderRadius: 12, border: '1px solid #334155', color: '#fff', outline: 'none', resize: 'none' }}
              />
            </div>

            <button 
              onClick={handleUploadSubmit}
              disabled={isUploading || !uploadFile || !uploadCaption}
              style={{ width: '100%', padding: 16, background: 'linear-gradient(135deg, #00f0ff 0%, #7c3aed 100%)', color: '#000', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 16, textTransform: 'uppercase', cursor: (isUploading || !uploadFile || !uploadCaption) ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', opacity: (isUploading || !uploadFile || !uploadCaption) ? 0.5 : 1 }}
            >
              {isUploading ? <Loader className="spin" size={20} /> : 'Publish Clip'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
