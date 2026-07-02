import { Flame, Trophy, Target, TrendingUp } from 'lucide-react';

/* =========================
   PLAYER STATS BAR
========================= */
export default function PlayerStats({ stats }) {
  return (
    <div className="player-stats" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
      {stats.map((s, i) => (
        <div key={i} className="stat-card" style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: '12px', minWidth: '100px', border: '1px solid var(--border)' }}>
          <div className="stat-value" style={{ fontSize: '20px', fontWeight: 900, color: 'var(--cyan)' }}>{s.value}</div>
          <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
