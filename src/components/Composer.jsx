import { useState, useRef, useCallback } from 'react';
import { X, Image, Loader } from 'lucide-react';
import { createPost } from '../hooks';

const MAX_CHARS = 280;

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.onload = () => {
      const max = 1200;
      let { width, height } = img;
      if (width > max) { height = (height * max) / width; width = max; }
      if (height > max) { width = (width * max) / height; height = max; }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Composer({ currentUserId, currentUser, onClose, onPosted }) {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageData, setImageData] = useState('');
  const [posting, setPosting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef(null);
  const textRef = useRef(null);

  const charsLeft = MAX_CHARS - text.length;
  const canPost = (text.trim() || imageData) && !posting && !compressing;

  const handleImagePick = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return; }
    setCompressing(true);
    try {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = ev => { setImagePreview(ev.target.result); setImageData(ev.target.result); setCompressing(false); };
        reader.readAsDataURL(file);
      } else {
        const compressed = await compressImage(file);
        setImagePreview(compressed);
        setImageData(compressed);
        setCompressing(false);
      }
    } catch {
      alert('Failed to process image');
      setCompressing(false);
    }
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  const handlePost = useCallback(async () => {
    if (!canPost) return;
    setPosting(true);
    try {
      await createPost(currentUserId, text.trim(), imageData);
      onPosted?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to post. Please try again.');
    } finally {
      setPosting(false);
    }
  }, [canPost, currentUserId, text, imageData, onPosted, onClose]);

  const avatar = currentUser;
  const initial = (avatar?.displayName || 'M')[0].toUpperCase();

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="composer-sheet" onClick={e => e.stopPropagation()}>
        {/* Handle bar */}
        <div style={{ width: 36, height: 4, background: 'var(--border-light)', borderRadius: 2, margin: '0 auto 14px' }} />

        {/* Header */}
        <div className="composer-header">
          <button className="composer-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
          <h2>New Post</h2>
          <button className="post-btn" onClick={handlePost} disabled={!canPost}>
            {posting ? <Loader size={14} className="spin" style={{ display: 'block' }} /> : 'Post'}
          </button>
        </div>

        {/* Body */}
        <div className="composer-body">
          <div className="avatar" style={{ flexShrink: 0, marginTop: 2 }}>
            {avatar?.avatarUrl ? <img src={avatar.avatarUrl} alt="" /> : initial}
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              ref={textRef}
              className="composer-textarea"
              placeholder="What's happening in your game?"
              value={text}
              onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
              rows={4}
              autoFocus
            />
          </div>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="composer-image-preview">
            {imagePreview.startsWith('data:video') ? (
              <video src={imagePreview} controls style={{ width: '100%', borderRadius: 12, maxHeight: 220 }} />
            ) : (
              <img src={imagePreview} alt="preview" />
            )}
            <button className="composer-image-remove" onClick={() => { setImagePreview(''); setImageData(''); }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="composer-footer">
          <div className="composer-tools">
            <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={handleImagePick} />
            <button
              className="composer-tool-btn"
              onClick={() => fileRef.current?.click()}
              disabled={compressing}
              title="Add image"
            >
              {compressing ? <Loader size={20} className="spin" /> : <Image size={20} />}
            </button>
          </div>

          <span className={`char-counter ${charsLeft < 20 ? 'danger' : charsLeft < 60 ? 'warn' : ''}`}>
            {charsLeft}
          </span>
        </div>
      </div>
    </div>
  );
}
