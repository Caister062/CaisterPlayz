import { useState, useEffect } from 'react';
import { X, Bell, Shield, Mail, Check, MessageSquare, AlertCircle, ShieldBan, Loader } from 'lucide-react';
import { updateProfile, useBlocks, unblockUser } from '../hooks';
import { THEMES, applyTheme } from '../utils';

export default function SettingsModal({ isOpen, onClose, user, profile, onProfileUpdate, users }) {
  const [notifPrefs, setNotifPrefs] = useState({
    likes: true,
    comments: true,
    reposts: true,
    follows: true,
    mentions: true,
    newPosts: true
  });
  
  const [isVerified, setIsVerified] = useState(profile?.verified || false);
  const [updatingVerify, setUpdatingVerify] = useState(false);
  const [supportName, setSupportName] = useState(profile?.displayName || '');
  const [supportEmail, setSupportEmail] = useState(user?.email || '');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);
  const [sendingSupport, setSendingSupport] = useState(false);

  const [activeTheme, setActiveTheme] = useState(localStorage.getItem('cplayz_theme') || 'cyberpunk');

  // Blocked accounts
  const { blocks, refresh: refreshBlocks } = useBlocks(profile?.id);
  const [unblockingId, setUnblockingId] = useState(null);

  // Load preferences
  useEffect(() => {
    if (!user?.id) return;
    const stored = localStorage.getItem(`cplayz_notif_prefs_${user.id}`);
    if (stored) {
      try {
        setNotifPrefs(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user?.id]);

  // Sync verification status
  useEffect(() => {
    if (profile) {
      setIsVerified(profile.verified || false);
    }
  }, [profile]);

  const togglePref = (key) => {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    localStorage.setItem(`cplayz_notif_prefs_${user.id}`, JSON.stringify(next));
  };

  const handleThemeChange = (themeName) => {
    setActiveTheme(themeName);
    localStorage.setItem('cplayz_theme', themeName);
    applyTheme(themeName);
  };

  const handleVerifyToggle = async () => {
    if (updatingVerify) return;
    setUpdatingVerify(true);
    const nextState = !isVerified;
    try {
      await updateProfile(profile.id, { verified: nextState });
      setIsVerified(nextState);
      if (onProfileUpdate) onProfileUpdate();
    } catch (e) {
      console.error('Failed to update verification status:', e);
      alert('Verification update failed. Please try again.');
    } finally {
      setUpdatingVerify(false);
    }
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMessage.trim() || sendingSupport) return;
    setSendingSupport(true);
    
    setTimeout(() => {
      setSendingSupport(false);
      setSupportSent(true);
      setSupportMessage('');
      setTimeout(() => setSupportSent(false), 5000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-overlay select-none" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div 
        className="relative w-full max-w-md bg-dark-bg border border-dark-border rounded-3xl overflow-hidden shadow-2xl animate-modal-enter max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-primary" />
            <h3 className="font-bold text-lg text-dark-text">Preferences & Settings</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-dark-muted hover:text-dark-text hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Verification */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-dark-text">Creator Verification</h4>
                  <p className="text-[11px] text-dark-muted">Get your verified blue checkmark badge</p>
                </div>
              </div>
              <button
                onClick={handleVerifyToggle}
                disabled={updatingVerify}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isVerified 
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/25'
                    : 'bg-brand-primary text-white hover:bg-brand-primary/90'
                }`}
              >
                {updatingVerify ? '...' : isVerified ? 'Verified ✓' : 'Verify Me'}
              </button>
            </div>
          </div>

          {/* Section 2: Notification Filters */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-dark-muted uppercase tracking-wider px-1">Notification Filters</h4>
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 divide-y divide-dark-border/40">
              
              {/* Likes */}
              <div className="flex items-center justify-between py-2.5 first:pt-0">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark-text">Likes Alerts</p>
                  <p className="text-xs text-dark-muted">Receive alerts when someone likes your posts</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifPrefs.likes}
                  onChange={() => togglePref('likes')}
                  className="w-4 h-4 rounded text-brand-primary border-dark-border bg-dark-bg focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Comments */}
              <div className="flex items-center justify-between py-2.5">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark-text">Comments Alerts</p>
                  <p className="text-xs text-dark-muted">Receive alerts on comments to your uploads</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifPrefs.comments}
                  onChange={() => togglePref('comments')}
                  className="w-4 h-4 rounded text-brand-primary border-dark-border bg-dark-bg focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Reposts */}
              <div className="flex items-center justify-between py-2.5">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark-text">Reposts Alerts</p>
                  <p className="text-xs text-dark-muted">Receive alerts when your posts are shared</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifPrefs.reposts}
                  onChange={() => togglePref('reposts')}
                  className="w-4 h-4 rounded text-brand-primary border-dark-border bg-dark-bg focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Follows */}
              <div className="flex items-center justify-between py-2.5">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark-text">New Followers Alerts</p>
                  <p className="text-xs text-dark-muted">Receive alerts when someone follows your channel</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifPrefs.follows}
                  onChange={() => togglePref('follows')}
                  className="w-4 h-4 rounded text-brand-primary border-dark-border bg-dark-bg focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Mentions */}
              <div className="flex items-center justify-between py-2.5">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark-text">Mentions & Tags</p>
                  <p className="text-xs text-dark-muted">Receive alerts when mentioned in chats or posts</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifPrefs.mentions}
                  onChange={() => togglePref('mentions')}
                  className="w-4 h-4 rounded text-brand-primary border-dark-border bg-dark-bg focus:ring-0 cursor-pointer"
                />
              </div>

              {/* New Posts */}
              <div className="flex items-center justify-between py-2.5 last:pb-0">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark-text">Upload Notifications</p>
                  <p className="text-xs text-dark-muted">Receive alerts when users you follow publish posts</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifPrefs.newPosts}
                  onChange={() => togglePref('newPosts')}
                  className="w-4 h-4 rounded text-brand-primary border-dark-border bg-dark-bg focus:ring-0 cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* Section 2b: Blocked Accounts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-dark-muted uppercase tracking-wider px-1">Blocked Accounts</h4>
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-4">
              {blocks.length === 0 ? (
                <div className="text-center py-4">
                  <ShieldBan className="w-8 h-8 text-dark-muted mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-dark-muted">No blocked accounts</p>
                  <p className="text-xs text-dark-muted mt-1">Users you block won't be able to message you or appear in your feed.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-dark-muted mb-3">{blocks.length} blocked account{blocks.length !== 1 ? 's' : ''}</p>
                  {blocks.map((block) => {
                    const blockedUser = (users || []).find(u => u.id === block.blockedId);
                    const name = blockedUser?.displayName || `User_${block.blockedId.slice(0, 5)}`;
                    const avatar = blockedUser?.avatarUrl;
                    return (
                      <div key={block.id} className="flex items-center justify-between py-2 border-b border-dark-border/30 last:border-0">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              background: avatar ? `url(${avatar}) center/cover` : 'var(--cyan)',
                              color: avatar ? 'transparent' : '#000',
                            }}
                          >
                            {!avatar && name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-dark-text">@{name}</span>
                        </div>
                        <button
                          onClick={async () => {
                            setUnblockingId(block.id);
                            try {
                              await unblockUser(profile.id, block.blockedId);
                              await refreshBlocks();
                            } catch (err) {
                              console.error('Unblock failed:', err);
                            } finally {
                              setUnblockingId(null);
                            }
                          }}
                          disabled={unblockingId === block.id}
                          className="px-3 py-1 rounded-full text-xs font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          {unblockingId === block.id ? <Loader className="w-3 h-3 animate-spin" /> : 'Unblock'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Contact support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-dark-muted uppercase tracking-wider px-1">Contact Support</h4>
            <form onSubmit={handleSupportSubmit} className="bg-dark-surface border border-dark-border rounded-2xl p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-dark-text">Name</label>
                <input 
                  type="text" 
                  value={supportName}
                  onChange={(e) => setSupportName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-dark-text">Email Address</label>
                <input 
                  type="email" 
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-dark-text">Message</label>
                <textarea 
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-primary resize-none"
                  placeholder="How can we help you today?"
                  required
                />
              </div>

              {supportSent && (
                <div className="flex items-center gap-2 text-xs text-brand-success font-semibold bg-brand-success/10 border border-brand-success/20 rounded-xl p-2.5 animate-fade-in">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>Support request submitted! We will respond shortly.</span>
                </div>
              )}
                <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!supportMessage.trim() || sendingSupport || supportSent}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {supportSent ? <><Check className="w-4 h-4"/> Sent!</> : 'Send Message'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 4: Personalization */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-dark-muted uppercase tracking-wider px-1">Personalization</h4>
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-4">
              <p className="text-sm font-semibold text-dark-text mb-3">HUD Color Theme</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(THEMES).map((t) => (
                  <button
                    key={t}
                    onClick={() => { applyTheme(t); handleThemeChange(t); }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      activeTheme === t 
                        ? 'border-brand-primary bg-brand-primary/10' 
                        : 'border-dark-border bg-dark-bg hover:border-dark-muted'
                    }`}
                  >
                    <span className="text-sm font-semibold capitalize text-dark-text">{t.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div 
                      className="w-5 h-5 rounded-full shadow-md"
                      style={{ background: THEMES[t].grad }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          
        </div>

        {/* Footer */}
      </div>
    </div>
  );
}
