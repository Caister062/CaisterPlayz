import { useState } from 'react';
import { AlertTriangle, Flag, Loader, ShieldOff, X as XIcon, MoreHorizontal, Share2, Trash2 } from 'lucide-react';
import { blockUser, reportPost, deletePost, editPost } from '../hooks';
import { GridCard, DeckCard } from './PostCard';

const REPORT_REASONS = [
  'Inappropriate content',
  'Harassment or bullying',
  'Spam or misleading',
  'Hate speech',
  'Other',
];

function SafetyButtons({ post, author, currentUserId, onBlocked }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const isOwnPost = currentUserId && post.userId === currentUserId;

  const stop = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  const submitReport = async reason => {
    setReporting(true);
    try {
      await reportPost(currentUserId, post.id, reason);
      setShowReportModal(false);
      if (navigator.vibrate) navigator.vibrate(15);
      alert(`Report submitted: "${reason}". Thank you for keeping the community safe.`);
    } catch (err) {
      console.error('Report failed:', err);
      alert('Error submitting report. Please try again.');
    } finally {
      setReporting(false);
    }
  };

  const submitBlock = async e => {
    stop(e);
    if (!confirm(`Block ${author?.displayName || 'this user'}? Their posts will be hidden from your feed.`)) return;

    setBlocking(true);
    try {
      await blockUser(currentUserId, post.userId);
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
      window.dispatchEvent(new Event('refreshPosts'));
      onBlocked?.(post.userId);
      alert('User blocked. Their content will be hidden from your feed.');
    } catch (err) {
      console.error('Block failed:', err);
      alert('Could not block user. Please try again.');
    } finally {
      setBlocking(false);
    }
  };

  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <div
        className="post-safety-actions"
        onClick={stop}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 25,
        }}
      >
        <button
          className="hud-btn"
          title="More options"
          aria-label="More options"
          onClick={e => {
            stop(e);
            setShowMenu(v => !v);
          }}
          style={{
            width: 28,
            height: 28,
            color: 'var(--text3)',
            background: 'rgba(0,0,0,0.4)',
            border: 'none',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <MoreHorizontal size={14} />
        </button>

        {showMenu && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 90 }}
              onClick={e => { stop(e); setShowMenu(false); }}
            />
            <div
              style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 6,
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 6, zIndex: 100, minWidth: 160,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column', gap: 4
              }}
              onClick={stop}
            >
              {!isOwnPost && (
                <>
                  <button
                    className="menu-item"
                    style={{ color: 'var(--hot)', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}
                    onClick={e => {
                      stop(e);
                      setShowMenu(false);
                      setShowReportModal(true);
                    }}
                    disabled={reporting}
                  >
                    {reporting ? <Loader size={12} className="spin" /> : <Flag size={12} />} Report Post
                  </button>
                  
                  <button
                    className="menu-item"
                    style={{ color: 'var(--hot)', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}
                    onClick={e => {
                      stop(e);
                      setShowMenu(false);
                      submitBlock(e);
                    }}
                    disabled={blocking}
                  >
                    {blocking ? <Loader size={12} className="spin" /> : <ShieldOff size={12} />} Block User
                  </button>
                </>
              )}

              <button
                className="menu-item"
                style={{ color: 'var(--text)', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}
                onClick={e => {
                  stop(e);
                  setShowMenu(false);
                  navigator.share?.({ text: post.text }) || navigator.clipboard?.writeText(location.href);
                }}
              >
                <Share2 size={12} /> Transmit Signal
              </button>

              {isOwnPost && (
                <>
                  <button
                    className="menu-item"
                    style={{ color: 'var(--text)', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}
                    onClick={async e => {
                      stop(e);
                      setShowMenu(false);
                      const newText = prompt('Edit your signal:', post.text);
                      if (newText !== null && newText.trim() && newText !== post.text) {
                        try {
                          await editPost(post.id, newText.trim());
                        } catch (err) {
                          alert('Could not edit signal.');
                        }
                      }
                    }}
                  >
                    <MoreHorizontal size={12} /> Edit Signal
                  </button>

                  <button
                    className="menu-item"
                    style={{ color: 'var(--hot)', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}
                    onClick={async e => {
                      stop(e);
                      setShowMenu(false);
                      if (!confirm('Purge this signal?')) return;
                      setDeleting(true);
                      try {
                        await deletePost(post.id);
                        window.dispatchEvent(new Event('refreshPosts'));
                      } catch {
                        alert('Could not purge signal.');
                      }
                      setDeleting(false);
                    }}
                    disabled={deleting}
                  >
                    {deleting ? <Loader size={12} className="spin" /> : <Trash2 size={12} />} Purge Signal
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {showReportModal && (
        <div
          onClick={e => {
            stop(e);
            setShowReportModal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={stop}
            style={{
              background: 'var(--card)',
              borderRadius: '16px 16px 0 0',
              padding: '20px 16px 32px',
              width: '100%',
              maxWidth: 480,
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AlertTriangle size={18} color="var(--hot)" />
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>Report Post</span>
              <button
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}
                onClick={() => setShowReportModal(false)}
              >
                <XIcon size={16} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
              Why are you reporting this post? We review all reports within 24 hours.
            </p>

            {REPORT_REASONS.map(reason => (
              <button
                key={reason}
                disabled={reporting}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '11px 14px',
                  marginBottom: 6,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  color: 'var(--text)',
                  fontSize: 13,
                  cursor: reporting ? 'wait' : 'pointer',
                }}
                onClick={() => submitReport(reason)}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function SafetyWrapper({ children, post, users, currentUserId, onBlocked }) {
  const author = users.find(u => u.id === post.userId) || post.expand?.userId || {
    id: post.userId,
    displayName: post.authorName || 'Operator',
  };

  return (
    <div style={{ position: 'relative' }}>
      {children}
      <SafetyButtons post={post} author={author} currentUserId={currentUserId} onBlocked={onBlocked} />
    </div>
  );
}

export function SafeGridCard({ post, users, currentUserId, onBlocked, ...props }) {
  return (
    <SafetyWrapper post={post} users={users} currentUserId={currentUserId} onBlocked={onBlocked}>
      <GridCard post={post} users={users} {...props} />
    </SafetyWrapper>
  );
}

export function SafeDeckCard({ post, users, currentUserId, onBlocked, ...props }) {
  return (
    <SafetyWrapper post={post} users={users} currentUserId={currentUserId} onBlocked={onBlocked}>
      <DeckCard post={post} users={users} {...props} />
    </SafetyWrapper>
  );
}
