import { useState, useMemo, useEffect } from 'react';
import {
  Trash2,
  Users,
  Radio,
  Zap,
  AlertTriangle,
  Shield,
  Mic,
  Activity,
  Download,
  Settings,
  Skull,
  Pin,
  CheckCircle
} from 'lucide-react';

import { Hex, timeAgo } from './PostCard';
import {
  deletePost,
  updateProfile,

  useSystemConfig,
  updateSystemConfig
} from '../hooks';
import pb from '../pocketbase';

export default function AdminView({ posts, users, currentUserId }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(null);
  const [radarEvents, setRadarEvents] = useState([]);
  const [bannedWordInput, setBannedWordInput] = useState('');

  const { config, configId } = useSystemConfig();

  const totalUsers = users.length;
  const totalSignals = posts.length;

  const totalEnergy = useMemo(() => {
    return posts.reduce(
      (sum, p) =>
        sum +
        (p.likedBy?.length || 0) +
        (p.repostedBy?.length || 0) +
        (p.viewedBy?.length || 0),
      0
    );
  }, [posts]);

  const recentSignals = useMemo(
    () => [...posts].sort((a, b) => new Date(b.created) - new Date(a.created)),
    [posts]
  );

  useEffect(() => {
    if (activeTab !== 'radar') return;

    let unsub;

    pb.collection('cplayz_posts')
      .subscribe('*', e => {
        if (e.record.type === 'system_config') return;

        const u = users.find(x => x.id === e.record.userId);

        setRadarEvents(prev =>
          [
            {
              id: Date.now(),
              text: `[${e.action.toUpperCase()}] Signal by ${
                u?.displayName || 'Unknown Operator'
              }`
            },
            ...prev
          ].slice(0, 50)
        );
      })
      .then(u => {
        unsub = u;
      });

    return () => unsub && unsub();
  }, [activeTab, users]);

  const handleDeleteSignal = async signal => {
    const author = users.find(u => u.id === signal.userId);

    if (
      !window.confirm(
        `Purge signal by ${author?.displayName || 'Unknown Operator'}?`
      )
    ) {
      return;
    }

    setDeleting(signal.id);

    try {
      await deletePost(signal.id, signal.userId);
    } catch (e) {
      alert('Signal purge failed: ' + e.message);
    }

    setDeleting(null);
  };

  const handleGlobalAnnounce = () => {
    const msg = prompt('Enter Core broadcast alert:');
    if (!msg || !msg.trim()) return;
    const nonAdmins = users.filter(u => u.id !== currentUserId);
    if (!window.confirm(`[SIMULATED] Broadcast "${msg}" to ${nonAdmins.length} operators?`)) return;
    // Simulation only — no real notifications are sent
    console.log(`[ADMIN SIM] Broadcast "${msg.trim()}" would reach ${nonAdmins.length} operators.`);
    alert(`[SIMULATED] Core broadcast dispatched to ${nonAdmins.length} operators.\n\nNo real notifications were sent.`);
  };

  const handleSweep = async () => {
    if (!config.bannedWords || config.bannedWords.length === 0) {
      alert('No restricted signal patterns configured.');
      return;
    }

    const regex = new RegExp(config.bannedWords.join('|'), 'i');
    const flaggedSignals = posts.filter(p => regex.test(p.text));

    if (flaggedSignals.length === 0) {
      alert('Signal stream is clean. No violations detected.');
      return;
    }

    if (
      !window.confirm(
        `Found ${flaggedSignals.length} restricted signal(s). Purge them all?`
      )
    ) {
      return;
    }

    for (const p of flaggedSignals) {
      try {
        await deletePost(p.id, p.userId);
      } catch (e) {}
    }

    alert(`Signal sweep complete. Purged ${flaggedSignals.length} signal(s).`);
  };

  const toggleVerify = async userId => {
    const verified = config.verifiedUsers || [];
    const next = verified.includes(userId)
      ? verified.filter(id => id !== userId)
      : [...verified, userId];

    await updateSystemConfig(configId, {
      ...config,
      verifiedUsers: next
    });
  };

  const handleImpersonate = user => {
    if (!window.confirm(`Assume core as ${user.displayName}?`)) return;

    localStorage.setItem('cplayz_user_id', user.id);
    window.location.reload();
  };

  const handlePurgeOperatorSignals = async userId => {
    const userSignals = posts.filter(p => p.userId === userId);

    if (
      !window.confirm(
        `PURGE: Delete all ${userSignals.length} signal(s) from this operator? This cannot be undone.`
      )
    ) {
      return;
    }

    for (const p of userSignals) {
      try {
        await deletePost(p.id, p.userId);
      } catch (e) {}
    }

    alert('Operator signals purged.');
  };

  const handleDisableCore = async user => {
    if (
      !window.confirm(
        `DISABLE CORE: ${user.displayName}? This will alter their core profile and purge their signals.`
      )
    ) {
      return;
    }

    await updateProfile(user.id, {
      displayName: '[CORE DISABLED]',
      bio: 'Core disabled for violating Signal Terms.',
      avatarUrl: ''
    });

    await handlePurgeOperatorSignals(user.id);
  };

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      stats: {
        operators: totalUsers,
        signals: totalSignals,
        coreEnergy: totalEnergy
      },
      operators: users.map(u => ({
        id: u.id,
        name: u.displayName,
        created: u.created
      })),
      signals: posts.map(p => ({
        id: p.id,
        operator: p.userId,
        text: p.text,
        boosts: p.likedBy?.length || 0
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `caisterplayz-core-export-${Date.now()}.json`;
    a.click();
  };

  const togglePrimeSignal = async signalId => {
    const featured = config.featuredPosts || [];
    const next = featured.includes(signalId)
      ? featured.filter(id => id !== signalId)
      : [...featured, signalId];

    await updateSystemConfig(configId, {
      ...config,
      featuredPosts: next
    });
  };

  const toggleLockdown = async () => {
    if (
      !window.confirm(
        config.lockdown
          ? 'Lift Core Lockdown?'
          : 'INITIATE TOTAL CORE LOCKDOWN?'
      )
    ) {
      return;
    }

    await updateSystemConfig(configId, {
      ...config,
      lockdown: !config.lockdown
    });
  };

  return (
    <div className="admin-view">
      <div className="admin-hero">
        <div className="admin-title">
          <AlertTriangle size={24} /> Control Core
        </div>

        <div className="admin-subtitle">
          Signal moderation, operator systems, and live core analytics.
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-box">
          <Users size={20} className="stat-icon" />
          <div className="stat-val">{totalUsers}</div>
          <div className="stat-lbl">Operators</div>
        </div>

        <div className="stat-box">
          <Radio size={20} className="stat-icon" />
          <div className="stat-val">{totalSignals}</div>
          <div className="stat-lbl">Signals</div>
        </div>

        <div className="stat-box">
          <Zap size={20} className="stat-icon" />
          <div className="stat-val">{totalEnergy}</div>
          <div className="stat-lbl">Core Energy</div>
        </div>
      </div>

      <div
        className="admin-actions-grid"
        style={{
          padding: '0 14px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10
        }}
      >
        <button className="admin-action-btn" onClick={handleGlobalAnnounce}>
          <Mic size={16} /> Broadcast Alert
        </button>

        <button className="admin-action-btn" onClick={handleExport}>
          <Download size={16} /> Export Core
        </button>

        <button className="admin-action-btn" onClick={handleSweep}>
          <Shield size={16} /> Signal Sweep
        </button>

        <button
          className={`admin-action-btn ${
            config.lockdown ? 'danger-on' : 'danger'
          }`}
          onClick={toggleLockdown}
        >
          <Skull size={16} />{' '}
          {config.lockdown ? 'LIFT LOCKDOWN' : 'CORE LOCKDOWN'}
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab${activeTab === 'overview' ? ' on' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Signals
        </button>

        <button
          className={`admin-tab${activeTab === 'users' ? ' on' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Operators
        </button>

        <button
          className={`admin-tab${activeTab === 'radar' ? ' on' : ''}`}
          onClick={() => setActiveTab('radar')}
        >
          Live Radar
        </button>

        <button
          className={`admin-tab${activeTab === 'config' ? ' on' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Core Systems
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="admin-list">
          {recentSignals.map(signal => {
            const author = users.find(u => u.id === signal.userId);
            const isPrime = (config.featuredPosts || []).includes(signal.id);

            return (
              <div key={signal.id} className="admin-item">
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start'
                  }}
                >
                  <Hex
                    src={author?.avatarUrl}
                    name={author?.displayName || '?'}
                    size="sm"
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="admin-item-meta">
                      <strong>{author?.displayName || 'Unknown Operator'}</strong>{' '}
                      • {timeAgo(signal.created)}
                    </div>

                    <div className="admin-item-text">{signal.text}</div>

                    {signal.imageUrl && (
                      <div className="admin-item-media">Visual Signal Attached</div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button
                        className={`admin-micro-btn ${isPrime ? 'on' : ''}`}
                        onClick={() => togglePrimeSignal(signal.id)}
                      >
                        <Pin size={12} />{' '}
                        {isPrime ? 'Remove Prime' : 'Prime Signal'}
                      </button>
                    </div>
                  </div>

                  <button
                    className="admin-del-btn"
                    disabled={deleting === signal.id}
                    onClick={() => handleDeleteSignal(signal)}
                  >
                    {deleting === signal.id ? '...' : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-list">
          {users.map(u => {
            const isVerified = (config.verifiedUsers || []).includes(u.id);

            return (
              <div
                key={u.id}
                className="admin-item"
                style={{
                  alignItems: 'flex-start',
                  display: 'flex',
                  gap: 12
                }}
              >
                <Hex src={u.avatarUrl} name={u.displayName || '?'} size="md" />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: 'var(--text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {u.displayName}
                    {isVerified && <CheckCircle size={14} color="#00e5ff" />}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text3)',
                      marginBottom: 8
                    }}
                  >
                    Core ID: {u.id}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <button
                      className="admin-micro-btn"
                      onClick={() => handleImpersonate(u)}
                    >
                      Assume Core
                    </button>

                    <button
                      className={`admin-micro-btn ${isVerified ? 'on' : ''}`}
                      onClick={() => toggleVerify(u.id)}
                    >
                      Authenticate
                    </button>

                    <button
                      className="admin-micro-btn danger"
                      onClick={() => handlePurgeOperatorSignals(u.id)}
                    >
                      Purge Signals
                    </button>

                    <button
                      className="admin-micro-btn danger"
                      onClick={() => handleDisableCore(u)}
                    >
                      Disable Core
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'radar' && (
        <div
          className="admin-list"
          style={{
            background: '#000',
            padding: 14,
            borderRadius: 12,
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#00e5ff',
            minHeight: 300
          }}
        >
          <div
            style={{
              marginBottom: 10,
              color: '#f43f5e',
              fontWeight: 'bold'
            }}
          >
            <Activity
              size={14}
              style={{ display: 'inline', verticalAlign: 'middle' }}
            />{' '}
            Live Signal Intercept Active...
          </div>

          {radarEvents.length === 0 && (
            <div style={{ opacity: 0.5 }}>Waiting for signal movement...</div>
          )}

          {radarEvents.map(e => (
            <div key={e.id} style={{ marginBottom: 4 }}>
              &gt; {e.text}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="admin-list">
          <div className="admin-item">
            <h4
              style={{
                color: 'var(--text)',
                fontSize: 13,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Settings size={14} /> Signal Filter Engine
            </h4>

            <p
              style={{
                fontSize: 11,
                color: 'var(--text3)',
                marginBottom: 8
              }}
            >
              Configure restricted signal patterns. The sweep tool will purge
              matching signals from the stream.
            </p>

            <textarea
              style={{
                width: '100%',
                background: 'var(--bg3)',
                border: '1px solid var(--border-b)',
                color: 'var(--text)',
                padding: 10,
                borderRadius: 8,
                fontSize: 12
              }}
              rows={3}
              value={bannedWordInput || (config.bannedWords || []).join(', ')}
              onChange={e => setBannedWordInput(e.target.value)}
            />

            <button
              className="admin-action-btn"
              style={{
                marginTop: 10,
                width: 'auto',
                padding: '6px 12px'
              }}
              onClick={async () => {
                const words = bannedWordInput
                  .split(',')
                  .map(w => w.trim())
                  .filter(Boolean);

                await updateSystemConfig(configId, {
                  ...config,
                  bannedWords: words
                });

                alert('Signal filter updated.');
              }}
            >
              Save Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
