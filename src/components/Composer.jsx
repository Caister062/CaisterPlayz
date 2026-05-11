import { useState, useRef, useEffect } from 'react';
import { Image, X, Loader2, Music, Play, Square, Check, Gamepad2 } from 'lucide-react';
import { Avatar } from './Shared';
import { compressImage } from '../utils';
import { createPost } from '../hooks';
import { MUSIC_TRACKS, previewTrack, stopTrack } from '../musicLibrary';
import { playPostSound } from '../sounds';

export default function Composer({ currentUserId, profile }) {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [compressedImage, setCompressedImage] = useState('');
  const [posting, setPosting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [previewingId, setPreviewingId] = useState(null);
  const [selectedTag, setSelectedTag] = useState('');
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [text]);

  // Stop preview when picker closes
  useEffect(() => {
    if (!showMusicPicker) {
      stopTrack();
      setPreviewingId(null);
    }
  }, [showMusicPicker]);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Video must be less than 10MB.');
        if (fileRef.current) fileRef.current.value = '';
        return;
      }
      setCompressing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setImagePreview(base64);
        setCompressedImage(base64);
        setCompressing(false);
      };
      reader.onerror = () => {
        alert('Failed to read video file.');
        setCompressing(false);
      };
      reader.readAsDataURL(file);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setCompressing(true);
    try {
      const base64 = await compressImage(file, 800, 0.75);
      setImagePreview(base64);
      setCompressedImage(base64);
    } catch (err) {
      console.error('Image compression failed:', err);
      alert('Failed to process image. Try a smaller file.');
    }
    setCompressing(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = () => {
    setImagePreview('');
    setCompressedImage('');
    setSelectedTrack(null);
  };

  const handlePreview = (track) => {
    if (previewingId === track.id) {
      stopTrack();
      setPreviewingId(null);
    } else {
      previewTrack(track.id);
      setPreviewingId(track.id);
    }
  };

  const handleSelectTrack = (track) => {
    stopTrack();
    setPreviewingId(null);
    setSelectedTrack(track);
    setShowMusicPicker(false);
  };

  const handleRemoveTrack = () => {
    setSelectedTrack(null);
  };

  const handlePost = async () => {
    const finalContent = selectedTag ? `${selectedTag} ${text.trim()}` : text.trim();
    if ((!finalContent && !compressedImage) || posting) return;
    setPosting(true);
    try {
      await createPost(
        currentUserId,
        finalContent,
        compressedImage,
        selectedTrack?.id || '',
        selectedTrack?.name || ''
      );
      setText('');
      setImagePreview('');
      setCompressedImage('');
      setSelectedTrack(null);
      setSelectedTag('');
      playPostSound();
      window.dispatchEvent(new Event('refreshPosts'));
    } catch (err) {
      console.error('Post failed:', err);
      alert('Failed to create post. Please try again.');
    }
    setPosting(false);
  };

  const charCount = text.length;
  const maxChars = 280;
  const charPerc = (charCount / maxChars) * 100;

  return (
    <div className="px-4 py-3 border-b border-dark-border">
      <div className="flex gap-3">
        <Avatar src={profile?.avatarUrl} name={profile?.displayName} size="md" />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxChars))}
            placeholder="What's happening?"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '200px' }}
            className="w-full bg-transparent text-dark-text text-lg placeholder-dark-muted resize-none focus:outline-none py-2 overflow-hidden"
          />

          {/* Image/Video Preview */}
          {imagePreview && (
            <div className="relative mt-2 mb-3 rounded-2xl overflow-hidden border border-dark-border animate-fade-slide">
              {imagePreview.startsWith('data:video/') ? (
                <>
                  <video src={imagePreview} controls className="w-full max-h-[300px] bg-black" />
                  <p className="text-xs text-brand-warning p-2 bg-brand-warning/10 border-t border-brand-warning/20">
                    By uploading, you agree that this video is appropriate. No AI content, nudes, or deepfakes allowed.
                  </p>
                </>
              ) : (
                <img src={imagePreview} alt="Preview" className="w-full max-h-[300px] object-cover" />
              )}
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-dark-bg/70 backdrop-blur rounded-full flex items-center justify-center hover:bg-dark-bg/90 transition-colors z-10"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Selected Music Track */}
          {selectedTrack && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl border border-dark-border bg-dark-surface animate-fade-slide">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedTrack.color + '20' }}>
                <Music className="w-4 h-4" style={{ color: selectedTrack.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-dark-text truncate">{selectedTrack.name}</p>
                <p className="text-xs text-dark-muted">{selectedTrack.genre} • {selectedTrack.artist}</p>
              </div>
              <button onClick={handleRemoveTrack} className="p-1 rounded-full hover:bg-dark-hover">
                <X className="w-4 h-4 text-dark-muted" />
              </button>
            </div>
          )}

          {/* Compressing indicator */}
          {compressing && (
            <div className="flex items-center gap-2 text-brand-primary text-sm mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing media...
            </div>
          )}

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between border-t border-dark-border pt-3 mt-1">
            <div className="flex items-center gap-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={compressing}
                className="p-2 rounded-full hover:bg-brand-primary/10 transition-colors"
              >
                <Image className="w-5 h-5 text-brand-primary" />
              </button>
              {/* Music button — only when image is attached (makes it a Reel) */}
              {compressedImage && (
                <button
                  onClick={() => setShowMusicPicker(true)}
                  className={`p-2 rounded-full hover:bg-brand-secondary/10 transition-colors ${
                    selectedTrack ? 'text-brand-secondary' : 'text-brand-primary'
                  }`}
                  title="Add music (creates a Reel)"
                >
                  <Music className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Game Tag Selector */}
            <div className="flex gap-2 overflow-x-auto flex-1 mx-2" style={{ scrollbarWidth: 'none' }}>
              {['#Fortnite', '#RobloxGhosts', '#LFG'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    selectedTag === tag 
                      ? 'bg-brand-primary text-black shadow-[0_0_8px_rgba(0,240,255,0.6)]' 
                      : 'bg-dark-surface text-dark-muted border border-dark-border hover:text-brand-primary'
                  }`}
                >
                  <Gamepad2 className="w-3 h-3" />
                  {tag.replace('#', '')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Char counter */}
              {charCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6">
                    <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" className="text-dark-border" strokeWidth="2" />
                      <circle
                        cx="12" cy="12" r="10" fill="none"
                        strokeWidth="2"
                        strokeDasharray={`${charPerc * 0.628} 62.8`}
                        className={charPerc > 90 ? 'text-brand-danger' : charPerc > 75 ? 'text-brand-warning' : 'text-brand-primary'}
                        stroke="currentColor"
                      />
                    </svg>
                  </div>
                  {charPerc > 85 && (
                    <span className={`text-xs font-mono ${charPerc > 95 ? 'text-brand-danger' : 'text-brand-warning'}`}>
                      {maxChars - charCount}
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={handlePost}
                disabled={(!text.trim() && !compressedImage && !selectedTag) || posting || compressing}
                className="px-5 py-2 bg-brand-primary text-black font-bold rounded-full text-sm disabled:opacity-40 hover:bg-brand-primary/90 transition-all active:scale-95 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
              >
                {posting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Music Picker Modal ─── */}
      {showMusicPicker && (
        <MusicPickerModal
          selectedTrack={selectedTrack}
          previewingId={previewingId}
          onPreview={handlePreview}
          onSelect={handleSelectTrack}
          onClose={() => setShowMusicPicker(false)}
        />
      )}
    </div>
  );
}

/* ─── Music Picker Modal ─── */
function MusicPickerModal({ selectedTrack, previewingId, onPreview, onSelect, onClose }) {
  const [filter, setFilter] = useState('All');
  const genres = ['All', ...new Set(MUSIC_TRACKS.map(t => t.genre))];
  const filtered = filter === 'All' ? MUSIC_TRACKS : MUSIC_TRACKS.filter(t => t.genre === filter);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-dark-bg border-t border-dark-border rounded-t-2xl animate-slide-up max-h-[75vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-brand-secondary" />
            <h3 className="font-bold text-lg text-dark-text">Add Music</h3>
          </div>
          <button onClick={onClose} className="text-dark-muted text-sm font-bold hover:text-dark-text">Done</button>
        </div>

        {/* Info banner */}
        <div className="px-4 py-2 bg-brand-success/10 border-b border-brand-success/20 flex-shrink-0">
          <p className="text-xs text-brand-success">🎵 All tracks are royalty-free & safe for content creation</p>
        </div>

        {/* Genre Filter */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setFilter(genre)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                filter === genre
                  ? 'bg-brand-primary text-white'
                  : 'bg-dark-surface text-dark-muted border border-dark-border hover:bg-dark-hover'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* No Music Option */}
        <div className="px-4 flex-shrink-0">
          {selectedTrack && (
            <button
              onClick={() => { onSelect(null); onClose(); }}
              className="w-full flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-dark-hover/50 transition-colors text-dark-muted text-sm"
            >
              <X className="w-4 h-4" />
              <span>Remove music</span>
            </button>
          )}
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {filtered.map(track => {
            const isSelected = selectedTrack?.id === track.id;
            const isPreviewing = previewingId === track.id;

            return (
              <div
                key={track.id}
                className={`flex items-center gap-3 py-3 px-3 rounded-xl transition-colors cursor-pointer ${
                  isSelected ? 'bg-brand-primary/10 border border-brand-primary/30' : 'hover:bg-dark-hover/50'
                }`}
              >
                {/* Play/Preview Button */}
                <button
                  onClick={() => onPreview(track)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ backgroundColor: track.color + '20' }}
                >
                  {isPreviewing ? (
                    <Square className="w-4 h-4" style={{ color: track.color, fill: track.color }} />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" style={{ color: track.color, fill: track.color }} />
                  )}
                </button>

                {/* Track Info */}
                <div className="flex-1 min-w-0" onClick={() => onSelect(track)}>
                  <p className="text-sm font-bold text-dark-text truncate">{track.name}</p>
                  <p className="text-xs text-dark-muted">{track.artist} • {track.genre}</p>
                </div>

                {/* Waveform Animation (when previewing) */}
                {isPreviewing && (
                  <div className="flex items-end gap-0.5 h-5 mr-2">
                    {[1,2,3,4].map(i => (
                      <div
                        key={i}
                        className="w-1 rounded-full animate-waveform"
                        style={{
                          backgroundColor: track.color,
                          animationDelay: `${i * 0.15}s`,
                          height: '100%'
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Select Button */}
                <button
                  onClick={() => onSelect(track)}
                  className={`p-2 rounded-full transition-colors ${
                    isSelected
                      ? 'bg-brand-primary text-white'
                      : 'bg-dark-surface text-dark-muted hover:bg-dark-hover border border-dark-border'
                  }`}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
