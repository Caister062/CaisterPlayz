import { useState } from 'react';
import { ShoppingBag, Star, Heart, Share2, Sparkles, Flame, Tag, ShieldCheck } from 'lucide-react';

export default function ItemShopView({ onShareItem }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [likes, setLikes] = useState({ 1: 412, 2: 890, 3: 1540, 4: 630 });

  const shopItems = [
    {
      id: 1,
      name: 'Omni-Man',
      rarity: 'EPIC',
      price: '1,500 V-Bucks',
      category: 'OUTFITS',
      image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500&auto=format&fit=crop&q=80',
      description: 'Earth is not yours to conquer.',
      rating: 4.9
    },
    {
      id: 2,
      name: 'Raven',
      rarity: 'LEGENDARY',
      price: '2,000 V-Bucks',
      category: 'OUTFITS',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
      description: 'Brooding master of dark sky mastery.',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Star Wand Pickaxe',
      rarity: 'RARE',
      price: '800 V-Bucks',
      category: 'PICKAXES',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
      description: 'Competitive staple pickaxe with starry trails.',
      rating: 5.0
    },
    {
      id: 4,
      name: 'Guff',
      rarity: 'RARE',
      price: '1,200 V-Bucks',
      category: 'OUTFITS',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
      description: 'Don’t fluff with Guff.',
      rating: 4.6
    }
  ];

  const handleLike = (id) => {
    setLikes(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'LEGENDARY': return '#ffaa00';
      case 'EPIC': return '#a855f7';
      case 'RARE': return '#00f0ff';
      default: return '#10b981';
    }
  };

  const filteredItems = activeCategory === 'ALL' ? shopItems : shopItems.filter(i => i.category === activeCategory);

  return (
    <div style={{ padding: '16px', paddingBottom: '120px' }}>
      {/* Shop Header */}
      <div style={{
        background: 'linear-gradient(135deg, #091e3a 0%, #2f80ed 100%)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        color: '#fff',
        boxShadow: '0 8px 32px rgba(47, 128, 237, 0.3)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', color: '#ffd700' }}>
            <Sparkles size={16} /> Daily Fortnite Shop Showcase
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: '4px 0 6px 0', textTransform: 'uppercase' }}>
            Today's Item Shop Drops
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#e0f2fe' }}>
            Browse today's featured cosmetics, rate outfits, and share your favorite cosmetics with friends.
          </p>
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '8px 16px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 900,
          fontSize: 14
        }}>
          <Tag size={16} color="#ffd700" /> Resets in 05h 12m
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16 }}>
        {['ALL', 'OUTFITS', 'PICKAXES', 'EMOTES', 'BUNDLES'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              border: activeCategory === cat ? '1px solid #2f80ed' : '1px solid #334155',
              background: activeCategory === cat ? 'rgba(47, 128, 237, 0.2)' : '#0f172a',
              color: activeCategory === cat ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cosmetics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {filteredItems.map(item => {
          const rarityColor = getRarityColor(item.rarity);
          return (
            <div
              key={item.id}
              style={{
                background: '#0f172a',
                borderRadius: 16,
                border: `1px solid ${rarityColor}44`,
                overflow: 'hidden',
                boxShadow: `0 4px 20px ${rarityColor}22`,
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
            >
              <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#020617' }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: rarityColor,
                  color: '#000',
                  fontWeight: 900,
                  fontSize: 10,
                  padding: '3px 8px',
                  borderRadius: 6,
                  textTransform: 'uppercase'
                }}>
                  {item.rarity}
                </span>

                <span style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  background: 'rgba(0,0,0,0.8)',
                  color: '#ffd700',
                  fontWeight: 900,
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: '1px solid #ffd70066'
                }}>
                  🪙 {item.price}
                </span>
              </div>

              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0 }}>
                    {item.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ffd700', fontSize: 12, fontWeight: 800 }}>
                    <Star size={12} fill="#ffd700" /> {item.rating}
                  </div>
                </div>

                <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 12px 0', lineHeight: 1.3 }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleLike(item.id)}
                    style={{
                      flex: 1,
                      background: '#1e293b',
                      color: '#f43f5e',
                      border: '1px solid #334155',
                      padding: '8px',
                      borderRadius: 8,
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      gap: 4
                    }}
                  >
                    <Heart size={14} fill="#f43f5e" /> {likes[item.id]}
                  </button>

                  <button
                    onClick={() => onShareItem && onShareItem(item)}
                    style={{
                      background: '#2f80ed',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Share2 size={14} /> Post
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
