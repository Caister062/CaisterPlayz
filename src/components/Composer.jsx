import { useState, useRef, useCallback } from 'react';
import { X, Image as ImageIcon, Loader } from 'lucide-react';
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
      canvas.width = width; canvas.height = height;
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

export default function Composer({ currentUserId, currentUser, onClose }) {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageData, setImageData] = useState('');
  const [posting, setPosting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef(null);

  const charsLeft = MAX_CHARS - text.length;
  const canPost = (text.trim() || imageData) && !posting && !compressing;

  const handleImage = useCallback(async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return; }
    setCompressing(true);
    try {
      const c = await compressImage(file);
      setImagePreview(c); setImageData(c);
    } catch { alert('Failed to process image'); }
    finally { setCompressing(false); if (fileRef.current) fileRef.current.value = ''; }
  }, []);

  const handlePost = useCallback(async () => {
    if (!canPost) return;
    setPosting(true);
    try {
      await createPost(currentUserId, text.trim(), imageData);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to post.');
    } finally { setPosting(false); }
  }, [canPost, currentUserId, text, imageData, onClose]);

  const initial = (currentUser?.displayName || 'M')[0].toUpperCase();

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />

        {/* Header */}
        <div className="sheet-header">
          <button className="sheet-close" onClick={onClose}>
            <X size={14} />
          </button>
          <span className="sheet-title">New Post</span>
          <button className="post-btn" onClick={handlePost} disabled={!canPost}>
            {posting ? <Loader size={14} className="spin" style={{ display: 'block' }} /> : 'Post'}
          </button>
        </div>

        {/* Body */}
        <div className="sheet-body">
          <div className="av" style={{ flexShrink: 0, marginTop: 2 }}>
            {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="" /> : initial}
          </div>
          <textarea
            className="sheet-textarea"
            placeholder="What's happening in your game?"
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
            rows={4}
            autoFocus
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="sheet-img-preview">
            <img src={imagePreview} alt="preview" />
            <button className="sheet-img-remove" onClick={() => { setImagePreview(''); setImageData(''); }}>
              <X size={12} />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="sheet-footer">
          <div className="sheet-tools">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage} />
            <button className="sheet-tool" onClick={() => fileRef.current?.click()} disabled={compressing}>
              {compressing ? <Loader size={19} className="spin" /> : <ImageIcon size={19} />}
            </button>
          </div>
          <span className={`char-count${charsLeft < 20 ? ' over' : charsLeft < 60 ? ' warn' : ''}`}>
            {charsLeft}
          </span>
        </div>
      </div>
    </div>
  );
}
