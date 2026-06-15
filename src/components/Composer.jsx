import { useState, useRef, useCallback } from 'react';
import { X, Image as ImageIcon, Loader } from 'lucide-react';
import { createPost } from '../hooks';

const MAX = 280;

function compress(file) {
  return new Promise((res, rej) => {
    const c = document.createElement('canvas'), ctx = c.getContext('2d'), img = new window.Image();
    img.onload = () => {
      const mx = 1200; let { width: w, height: h } = img;
      if (w > mx) { h = (h*mx)/w; w = mx; } if (h > mx) { w = (w*mx)/h; h = mx; }
      c.width = w; c.height = h; ctx.drawImage(img,0,0,w,h); res(c.toDataURL('image/jpeg',0.8));
    };
    img.onerror = rej;
    const r = new FileReader(); r.onload = e => { img.src = e.target.result; }; r.onerror = rej; r.readAsDataURL(file);
  });
}

export default function Composer({ currentUserId, currentUser, onClose }) {
  const [text, setText] = useState('');
  const [imgPrev, setImgPrev] = useState('');
  const [imgData, setImgData] = useState('');
  const [posting, setPosting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fRef = useRef(null);
  const left = MAX - text.length;
  const ok = (text.trim() || imgData) && !posting && !compressing;

  const handleImg = useCallback(async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 10*1024*1024) { alert('Max 10MB'); return; }
    setCompressing(true);
    try { const d = await compress(f); setImgPrev(d); setImgData(d); }
    catch { alert('Failed'); }
    finally { setCompressing(false); if (fRef.current) fRef.current.value = ''; }
  }, []);

  const go = useCallback(async () => {
    if (!ok) return; setPosting(true);
    try { await createPost(currentUserId, text.trim(), imgData); onClose(); }
    catch (err) { console.error(err); alert('Failed.'); }
    finally { setPosting(false); }
  }, [ok, currentUserId, text, imgData, onClose]);

  const init = (currentUser?.displayName || 'M')[0].toUpperCase();

  return (
    <div className="overlay" onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-bar" />
        <div className="sheet-head">
          <button className="sheet-x" onClick={onClose}><X size={12} /></button>
          <span className="sheet-title">New Broadcast</span>
          <button className="go-btn" onClick={go} disabled={!ok}>
            {posting ? <Loader size={12} className="spin" style={{ display:'block' }} /> : 'SEND'}
          </button>
        </div>
        <div className="sheet-body">
          <div className="hex" style={{ flexShrink:0, marginTop:2 }}>
            {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="" /> : init}
          </div>
          <textarea className="sheet-ta" placeholder="Broadcast to the arena…" value={text} onChange={e => setText(e.target.value.slice(0,MAX))} rows={4} autoFocus />
        </div>
        {imgPrev && (
          <div className="sheet-preview">
            <img src={imgPrev} alt="" />
            <button className="sheet-rm" onClick={() => { setImgPrev(''); setImgData(''); }}><X size={10} /></button>
          </div>
        )}
        <div className="sheet-foot">
          <div className="sheet-tools">
            <input ref={fRef} type="file" accept="image/*" hidden onChange={handleImg} />
            <button className="sheet-tool" onClick={() => fRef.current?.click()} disabled={compressing}>
              {compressing ? <Loader size={17} className="spin" /> : <ImageIcon size={17} />}
            </button>
          </div>
          <span className={`cc${left < 20 ? ' over' : left < 60 ? ' warn' : ''}`}>{left}</span>
        </div>
      </div>
    </div>
  );
}
