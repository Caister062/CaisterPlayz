export const XP_PER_LEVEL = 500;

export const RANKS = [
  { minLevel: 1, title: 'Rookie', color: '#94a3b8', bgGrad: 'linear-gradient(135deg, #1e293b, #0f172a)', icon: '🥚', theme: 'rookie-theme' },
  { minLevel: 5, title: 'Bronze Fighter', color: '#b45309', bgGrad: 'linear-gradient(135deg, #78350f, #451a03)', icon: '🥉', theme: 'bronze-theme' },
  { minLevel: 10, title: 'Iron Vanguard', color: '#64748b', bgGrad: 'linear-gradient(135deg, #334155, #0f172a)', icon: '🛡️', theme: 'iron-theme' },
  { minLevel: 25, title: 'Titan', color: '#eab308', bgGrad: 'linear-gradient(135deg, #a16207, #422006)', icon: '⚔️', theme: 'titan-theme' },
  { minLevel: 50, title: 'Legend', color: '#f43f5e', bgGrad: 'linear-gradient(135deg, #be123c, #4c0519)', icon: '👑', theme: 'legend-theme' }
];

export const GEAR_DB = [
  { id: 'frame_basic', type: 'frame', name: 'Recruit Frame', rarity: 'Common', unlockLevel: 1, preview: 'gray' },
  { id: 'frame_bronze', type: 'frame', name: 'Bronze Plating', rarity: 'Uncommon', unlockLevel: 5, preview: '#b45309' },
  { id: 'frame_iron', type: 'frame', name: 'Iron Forged', rarity: 'Rare', unlockLevel: 10, preview: '#64748b' },
  { id: 'frame_gold', type: 'frame', name: 'Titan Gold', rarity: 'Epic', unlockLevel: 25, preview: '#eab308' },
  { id: 'frame_crimson', type: 'frame', name: 'Crimson Legend', rarity: 'Legendary', unlockLevel: 50, preview: '#f43f5e' },
  
  { id: 'aura_sweat', type: 'aura', name: 'Sweat Aura', rarity: 'Common', unlockStreak: 3, preview: '💦' },
  { id: 'aura_flame', type: 'aura', name: 'Flame Aura', rarity: 'Rare', unlockStreak: 7, preview: '🔥' },
  { id: 'aura_lightning', type: 'aura', name: 'Lightning Aura', rarity: 'Epic', unlockStreak: 14, preview: '⚡' },
  { id: 'aura_void', type: 'aura', name: 'Void Aura', rarity: 'Legendary', unlockStreak: 30, preview: '🌌' }
];

export function getRankForLevel(level) {
  let currentRank = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.minLevel) {
      currentRank = r;
    }
  }
  return currentRank;
}

export function getUnlockedGear(level, streak) {
  return GEAR_DB.filter(g => {
    if (g.unlockLevel && level >= g.unlockLevel) return true;
    if (g.unlockStreak && streak >= g.unlockStreak) return true;
    return false;
  });
}
