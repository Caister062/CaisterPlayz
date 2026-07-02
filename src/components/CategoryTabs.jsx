import { Dumbbell, Target, Flame, Trophy, TrendingUp } from 'lucide-react';

const CATEGORIES = [
  { id: 'All',        label: 'All Activity', icon: null },
  { id: 'Raid',       label: 'Raids',        icon: Target },
  { id: 'Workout',    label: 'Grind',        icon: Dumbbell },
  { id: 'Progress',   label: 'Level Up',     icon: TrendingUp },
  { id: 'Achievement',label: 'Achievements', icon: Trophy },
  { id: 'Motivation', label: 'Boosts',       icon: Flame },
];

export default function CategoryTabs({ selectedCategory, onSelectCategory }) {
  return (
    <div className="category-tabs" style={{ marginBottom: 16 }}>
      {/* Items */}
      <div className="tabs-row" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`tab-chip${selectedCategory===cat.id?' selected':''}`}
            onClick={() => onSelectCategory(cat.id)}
            style={{ 
              background: selectedCategory === cat.id ? 'var(--cyan)' : 'var(--surface)',
              color: selectedCategory === cat.id ? '#000' : 'var(--text1)',
              border: '1px solid var(--border)',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat.icon && <span className="tab-icon"><cat.icon size={14} /></span>}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}