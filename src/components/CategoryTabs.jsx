import { Dumbbell, Heart, Utensils, Target, Flame, Users, Gamepad2, Trophy, Lightbulb, MessageCircle, TrendingUp } from 'lucide-react';

const FITNESS_CATEGORIES = [
  { id: 'All',        label: 'All',       icon: null },
  { id: 'Workout',    label: 'Workout',   icon: Dumbbell },
  { id: 'Progress',   label: 'Progress',  icon: TrendingUp },
  { id: 'Meal',       label: 'Meal Prep', icon: Utensils },
  { id: 'Challenge',  label: 'Challenge', icon: Target },
  { id: 'Motivation', label: 'Motivation',icon: Flame },
  { id: 'Question',   label: 'Questions', icon: MessageCircle },
];

const FITNESS_GAMES = [
  { id: 'All Games',     label: 'All',       icon: null },
  { id: 'Fortnite',      label: 'Fortnite',  icon: Gamepad2 },
  { id: 'Roblox',        label: 'Roblox',    icon: Trophy },
  { id: 'Minecraft',     label: 'Minecraft', icon: Target },
];

const TIER_COLORS = {
  fitness: ['#10b981','#059669'],
  gaming:  ['#7c3aed','#a78bfa'],
};

export default function CategoryTabs({ selectedCategory, onSelectCategory, activeTab }) {
  const items = activeTab === 'fitness' ? FITNESS_CATEGORIES : FITNESS_GAMES;
  
  return (
    <div className="category-tabs">
      {/* Tab toggle */}
      <div className="tab-toggle-bar">
        <button className={`toggle-tab${activeTab==='fitness'?' lit':''}`} onClick={() => onSelectCategory(null,activeTab===activeTab?'fitness':'fitness')}>
          Fitness
        </button>
        <button className={`toggle-tab${activeTab==='gaming'?' lit':''}`} onClick={() => onSelectCategory(null,'gaming')}>
          Gaming
        </button>
      </div>
      
      {/* Items */}
      <div className="tabs-row">
        {items.map(cat => (
          <button
            key={cat.id}
            className={`tab-chip${selectedCategory===cat.id?' selected':''}`}
            onClick={() => onSelectCategory(cat.id,activeTab)}
          >
            {cat.icon && <span className="tab-icon"><cat.icon size={14} /></span>}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}