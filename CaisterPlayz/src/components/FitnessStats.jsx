import { Flame, Trophy, Target, TrendingUp } from 'lucide-react';

/* =========================
   FITNESS STATS BAR
========================= */
export default function FitnessStats({ stats }) {
  return (
    <div className="fitness-stats">
      {stats.map((s, i) => (
        <div key={i} className="stat-card">
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
