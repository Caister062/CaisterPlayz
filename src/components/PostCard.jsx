import { useState, useRef, useEffect, useCallback } from 'react';
import { Zap, RotateCw, MessageSquare, Pin, Eye, MoreHorizontal, Trash2, Share2, Loader } from 'lucide-react';
import { useComments, toggleLike, toggleRepost, toggleBookmark, addView, addComment, deletePost, deleteComment } from '../hooks';

export function timeAgo(ts) {
  if (!ts) return '';
  const sec = (Date.now() - new Date(ts)) / 1000;
  if (sec < 60) return 'now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d`;
  return new Date(ts).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export function Hex({ src, name, size = '', onClick }) {
  const i = (name || '?')[0].toUpperCase();
  return (
    <div className={`hex${size ? ` ${size}` : ''}`} onClick={onClick}>
      {src ? <img src={src} alt={name} loading="lazy" /> : i}
    </div>
  );
}

function RichBody({ text }) {
  if (!text) return null;
  const parts = [];
  const rx = /(#\w+|@\w+|https?:\/\/[^\s]+)/g;
  let last = 0, m;
  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: 'x', v: text.slice(last, m.index) });
    const w = m[0];
    parts.push({ t: w[0] === '#' ? 'h' : w[0] === '@' ? 'a' : 'l', v: w });
    last = m.index + w.length;
  }
  if (last < text.length) parts.push({ t: 'x', v: text.slice(last) });
  return (
    <div className="bc-text">
      {parts.map((p, i) =>
        p.t === 'h' ? <span key={i} className="tag">{p.v}</span> :
        p.t === 'a' ? <span key={i} className="at">{p.v}</span> :
        p.t === 'l' ? <a key={i} href={p.v} target="_blank" rel="noreferrer" className="lnk">{p.v.replace(/^https?:\/\/(www\.)?/, '').slice(0, 35)}</a> :
        <span key={i}>{p.v}</span>
      )}
    </div>
  );
}

export default function BroadcastCard({ post, currentUserId, users = [], onProfileClick }) {
  const [showThread, setShowThread] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showLB, setShowLB] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [oLiked, setOLiked] = useState(null);
  const [oLikeN, setOLikeN] = useState(null);
  const [oReposted, setOReposted] = useState(null);
  const [oRepostN, setORepostN] = useState(null);
  const [oPinned, setOPinned] = useState(null);
  const [boostAnim, setBoostAnim] = useState(false);

  const likeT = useRef(null);
  const repostT = useRef(null);
  const viewedR = useRef(false);
  const elRef = useRef(null);

  const { comments } = useComments(showThread ? post.id : null);
  const author = users.find(u => u.id === post.userId);

  const liked = oLiked !== null ? oLiked : (post.likedBy || []).includes(currentUserId);
  const likeN = oLikeN !== null ? oLikeN : (post.likedBy || []).length;
  const reposted = oReposted !== null ? oReposted : (post.repostedBy || []).includes(currentUserId);
  const repostN = oRepostN !== null ? oRepostN : (post.repostedBy || []).length;
  const pinned = oPinned !== null ? oPinned : (post.favoritedBy || []).includes(currentUserId);
  const viewN = (post.viewedBy || []).length;

  useEffect(() => { setOLiked(null); setOLikeN(null); setOReposted(null); setORepostN(null); setOPinned(null); },
    [(post.likedBy||[]).join(','), (post.repostedBy||[]).join(','), (post.favoritedBy||[]).join(',')]);

  useEffect(() => {
    if (!elRef.current || viewedR.current || !currentUserId) return;
    // Don't count your own views
    if (post.userId === currentUserId) { viewedR.current = true; return; }
    if ((post.viewedBy||[]).includes(currentUserId)) { viewedR.current = true; return; }
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { viewedR.current = true; addView(post.id, currentUserId).catch(()=>{}); ob.disconnect(); }
    }, { threshold: 0.6 });
    ob.observe(elRef.current);
    return () => ob.disconnect();
  }, [post.id, currentUserId]);

  const doBoost = useCallback(() => {
    const next = !liked;
    setOLiked(next); setOLikeN(Math.max(0, likeN + (next ? 1 : -1)));
    if (next) { setBoostAnim(true); setTimeout(() => setBoostAnim(false), 450); }
    if (likeT.current) clearTimeout(likeT.current);
    const sL = liked, sN = likeN;
    likeT.current = setTimeout(() => { toggleLike(post.id, currentUserId, !next).catch(() => { setOLiked(sL); setOLikeN(sN); }); }, 500);
  }, [liked, likeN, post.id, currentUserId]);

  const doEcho = useCallback(() => {
    const next = !reposted;
    setOReposted(next); setORepostN(Math.max(0, repostN + (next ? 1 : -1)));
    if (repostT.current) clearTimeout(repostT.current);
    const sR = reposted, sN = repostN;
    repostT.current = setTimeout(() => { toggleRepost(post.id, currentUserId, !next).catch(() => { setOReposted(sR); setORepostN(sN); }); }, 500);
  }, [reposted, repostN, post.id, currentUserId]);

  const doPin = useCallback(() => {
    const next = !pinned;
    setOPinned(next);
    toggleBookmark(post.id, currentUserId, !next).catch(() => setOPinned(pinned));
  }, [pinned, post.id, currentUserId]);

  const doReply = useCallback(async (e) => {
    e.preventDefault();
    if (!replyText.trim() || sending) return;
    setSending(true);
    try { await addComment(post.id, currentUserId, replyText.trim()); setReplyText(''); }
    catch (err) { console.error(err); }
    finally { setSending(false); }
  }, [replyText, sending, post.id, currentUserId]);

  const doDel = useCallback(async () => {
    if (!confirm('Delete this broadcast?')) return;
    setDeleting(true);
    try { await deletePost(post.id); } catch (err) { console.error(err); setDeleting(false); }
  }, [post.id]);

  if (!author) return null;

  return (
    <>
      <div ref={elRef} className="bc">
        {/* Head */}
        <div className="bc-head">
          <Hex src={author.avatarUrl} name={author.displayName} onClick={() => onProfileClick?.(author.id)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="bc-who" onClick={() => onProfileClick?.(author.id)}>{author.displayName}</span>
            {author.verified && <span className="bc-verified"> ✓</span>}
            <span className="bc-when">· {timeAgo(post.created)}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <button className="hud-btn" onClick={() => setShowMenu(v => !v)} style={{ width: 28, height: 28 }}>
              <MoreHorizontal size={14} />
            </button>
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 80, background: 'var(--surface)', border: '1px solid var(--border-b)', borderRadius: 12, padding: '4px 0', minWidth: 140, boxShadow: '0 10px 40px rgba(0,0,0,0.7)' }}>
                <button onClick={() => { setShowMenu(false); navigator.share?.({ text: post.text, url: location.href }) || navigator.clipboard?.writeText(location.href); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', width: '100%', fontSize: 11, fontWeight: 700 }}><Share2 size={12} /> Share</button>
                {post.userId === currentUserId && (
                  <button onClick={() => { setShowMenu(false); doDel(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', width: '100%', fontSize: 11, fontWeight: 700, color: 'var(--hot)' }}>
                    {deleting ? <Loader size={12} className="spin" /> : <Trash2 size={12} />} Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <RichBody text={post.text} />

        {post.imageUrl && (
          <div className="bc-media" onClick={() => setShowLB(true)}>
            <img src={post.imageUrl} alt="" loading="lazy" />
          </div>
        )}

        {/* Reaction Bar */}
        <div className="rx-bar">
          <button className={`rx do-reply${showThread ? ' echoed' : ''}`} onClick={() => setShowThread(v => !v)}>
            <MessageSquare size={16} />
            {comments.length > 0 && <span>{comments.length}</span>}
          </button>
          <button className={`rx do-echo${reposted ? ' echoed' : ''}`} onClick={doEcho}>
            <RotateCw size={16} />
            {repostN > 0 && <span>{repostN}</span>}
          </button>
          <button className={`rx do-boost${liked ? ' boosted' : ''}${boostAnim ? ' boost-pop' : ''}`} onClick={doBoost}>
            <Zap size={16} />
            {likeN > 0 && <span>{likeN}</span>}
          </button>
          <div className="rx-spacer" />
          {viewN > 0 && <span className="rx views"><Eye size={13} /> {viewN}</span>}
          <button className={`rx do-pin${pinned ? ' pinned' : ''}`} onClick={doPin}>
            <Pin size={16} />
          </button>
        </div>

        {/* Thread */}
        {showThread && (
          <div className="thread">
            <form className="thread-input-row" onSubmit={doReply}>
              <Hex src={users.find(u => u.id === currentUserId)?.avatarUrl} name="Me" size="sm" />
              <input className="thread-input" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Reply…" maxLength={280} />
              <button type="submit" className="thread-send" disabled={!replyText.trim() || sending}>
                {sending ? <Loader size={11} className="spin" /> : 'SEND'}
              </button>
            </form>
            {comments.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11, padding: '2px 0 6px' }}>No replies yet</p>}
            {comments.map(c => {
              const cu = users.find(u => u.id === c.userId);
              return (
                <div key={c.id} className="reply-item">
                  <Hex src={cu?.avatarUrl} name={cu?.displayName||'?'} size="sm" />
                  <div className="reply-bubble">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="reply-who">{cu?.displayName||'User'}</div>
                      {c.userId === currentUserId && (
                        <button
                          onClick={() => { if (confirm('Delete this reply?')) deleteComment(c.id).catch(console.error); }}
                          style={{ background: 'none', border: 'none', padding: '2px 4px', cursor: 'pointer', color: 'var(--text3)', transition: 'color 0.15s', borderRadius: 4 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--hot)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                          title="Delete reply"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                    <div className="reply-msg">{c.text}</div>
                    <div className="reply-ts">{timeAgo(c.created)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showLB && <div className="lb" onClick={() => setShowLB(false)}><button className="lb-x" onClick={() => setShowLB(false)}>✕</button><img src={post.imageUrl} alt="" onClick={e => e.stopPropagation()} /></div>}
      {showMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 79 }} onClick={() => setShowMenu(false)} />}
    </>
  );
}
