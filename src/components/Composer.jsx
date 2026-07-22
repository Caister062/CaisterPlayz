import { useState, useRef, useCallback } from 'react';
import { X, Image as ImageIcon, Loader, ChevronDown, Plus, Trophy, Lock } from 'lucide-react';
import { logWorkout } from '../hooks';

const MAX_CAPTION = 280;

function compress(file) {
  return new Promise((res, rej) => {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    const img = new window.Image();
    img.onload = () => {
      const mx = 1200;
      let { width: w, height: h } = img;
      if (w > mx) { h = (h * mx) / w; w = mx; }
      if (h > mx) { w = (w * mx) / h; h = mx; }
      c.width = w;
      c.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      res(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = rej;
    const r = new FileReader();
    r.onload = e => img.src = e.target.result;
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export default function Composer({ currentUserId, currentUser, onClose }) {
  const [category, setCategory] = useState('victory');
  const [mode, setMode] = useState('zerobuild');
  const [platform, setPlatform] = useState('PC');
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState('Public');

  const [imgPrev, setImgPrev] = useState('');
  const [imgData, setImgData] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [posting, setPosting] = useState(false);
  const fRef = useRef(null);

  const handleImg = useCallback(async e => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCompressing(true);
    try {
      const dataUrl = await compress(f);
      setImgPrev(dataUrl);
      setImgData(dataUrl);
    } catch (err) {
      console.error('Image processing error:', err);
    } finally {
      setCompressing(false);
    }
  }, []);

  const submitPost = async () => {
    setPosting(true);
    const postDetails = {
      category,
      mode,
      platform,
      privacy
    };

    try {
      await logWorkout(currentUserId, caption.trim(), imgData, postDetails);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Post failed.');
      setPosting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(10px)',
      padding: '16px',
      boxSizing: 'border-box'
    }} onClick={onClose}>
      <div 
        style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(0,240,255,0.15)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.25s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          background: '#020617'
        }}>
          <button 
            type="button" 
            onClick={onClose} 
            style={{
              background: '#1e293b',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            POST FORTNITE HIGHLIGHT
          </span>
          <button 
            type="button"
            onClick={submitPost}
            disabled={posting || compressing}
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #7c3aed 100%)',
              color: '#000',
              fontWeight: 900,
              fontSize: 13,
              border: 'none',
              padding: '8px 20px',
              borderRadius: 20,
              cursor: 'pointer',
              opacity: (posting || compressing) ? 0.5 : 1
            }}
          >
            {posting ? <Loader size={16} className="spin" /> : 'POST'}
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Post Category & Mode Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                Category
              </label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 12,
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="victory">🏆 Victory Royale</option>
                <option value="lfg">👥 Squad LFG</option>
                <option value="clip">🎥 Clutch Clip</option>
                <option value="loadout">🔫 Weapon Loadout</option>
                <option value="creative">🧩 Creative Code</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                Mode
              </label>
              <select 
                value={mode}
                onChange={e => setMode(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 12,
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="zerobuild">Zero Build</option>
                <option value="battleroyale">Battle Royale</option>
                <option value="reload">Reload</option>
                <option value="ranked">Ranked</option>
                <option value="creative">Creative / UEFN</option>
              </select>
            </div>
          </div>

          {/* Platform Pills */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
              Platform
            </label>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {['PlayStation', 'PC', 'Xbox', 'Switch', 'Mobile'].map(plat => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setPlatform(plat)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 800,
                    border: platform === plat ? '1px solid #00f0ff' : '1px solid #334155',
                    background: platform === plat ? 'rgba(0, 240, 255, 0.15)' : '#020617',
                    color: platform === plat ? '#00f0ff' : '#94a3b8',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          {/* Text Caption Input */}
          <div>
            <textarea
              placeholder="Share your Victory Royale, clutch play, or squad drop details..."
              value={caption}
              onChange={e => setCaption(e.target.value.slice(0, MAX_CAPTION))}
              rows={4}
              style={{
                width: '100%',
                background: '#020617',
                border: '1px solid #334155',
                borderRadius: 14,
                padding: 14,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Media Preview */}
          {imgPrev && (
            <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid #00f0ff55', background: '#000' }}>
              <img src={imgPrev} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => { setImgPrev(''); setImgData(''); }}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Media Attach & Privacy Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
            <input ref={fRef} type="file" accept="image/*,video/*" hidden onChange={handleImg} />
            <button
              type="button"
              onClick={() => fRef.current?.click()}
              disabled={compressing}
              style={{
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: '#00f0ff',
                padding: '10px 16px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {compressing ? <Loader size={16} className="spin" /> : <ImageIcon size={16} />}
              Attach Screenshot / Clip
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#020617', border: '1px solid #334155', borderRadius: 10, padding: '6px 10px' }}>
              <Lock size={12} color="#94a3b8" />
              <select 
                value={privacy} 
                onChange={e => setPrivacy(e.target.value)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 12, fontWeight: 800, outline: 'none', cursor: 'pointer' }}
              >
                <option value="Public" style={{ background: '#0f172a', color: '#fff' }}>Public</option>
                <option value="Friends" style={{ background: '#0f172a', color: '#fff' }}>Friends</option>
                <option value="Private" style={{ background: '#0f172a', color: '#fff' }}>Private</option>
              </select>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
