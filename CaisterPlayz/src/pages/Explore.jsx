import { useState } from 'react';
import PostCard from '../components/PostCard';

/* =========================
   EXPLORE / SEARCH PAGE
========================= */
export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Weight', 'Cardio', 'Yoga', 'Meal Prep', 'Challenge', 'Motivation'];

  // Searchable demo posts filtered by category and query
  const demoPosts = [0,1,2,3,4,5,6].map(i => ({
    id: `explore-${i}`,
    userId: `user-${i % 3}`,
    displayName: ['Alex M.', 'Sarah K.', 'Mike R.'][i % 3],
    avatar: '',
    category: ['Weight', 'Cardio', 'Yoga', 'Meal Prep', 'Challenge', 'Motivation', 'Weight'][i % 7],
    content: [
      "Deadlift PR! 💪 Just hit 315x5. Years of consistent training finally paying off.",
      "Morning yoga flow 🧘‍♀️ 45 minutes of sun salutations and hip openers. Pure bliss.",
      "Meal prep with a twist 🍳 Overnight oats: chia seeds, peanut butter, banana, honey. Perfect post-workout breakfast!",
      "30-day plank challenge - week 2! Day 14 complete. Feeling stronger every day 🔥",
      "Cycling through the trail today 🚴‍♂️ 25 miles with 2000ft elevation gain. Leg day on wheels!",
      "Recovery day stretches ✨ Taking care of my body after a tough training week.",
      "Form check: Squat stance and depth. Always learning, always improving! 📐",
    ][i],
    image: '',
    likesCount: Math.floor(Math.random() * 60 + 5),
    commentsCount: Math.floor(Math.random() * 25 + 2),
    timestamp: `${Math.floor(Math.random() * 12 + 1)}h`
  }));

  const filteredPosts = demoPosts.filter(post => {
    // Apply category filter
    if (selectedCategory !== 'All' && post.category !== selectedCategory) {
      return false;
    }
    // Apply search query filter
    if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !post.displayName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="page-container">
      {/* Search Header */}
      <div style={{ padding: '16px 14px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
        <input
          type="text"
          placeholder="🔍 Search workouts, users, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ marginBottom: 12 }}
        />
        
        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'flex', gap: 12, padding: '14px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        {[
          { label: 'Workouts', value: '2.4k', icon: '🏋️' },
          { label: 'Athletes', value: '892', icon: '👥' },
          { label: 'Challenges', value: '34', icon: '🎯' }
        ].map(stat => (
          <div key={stat.label} style={{ flex: 1, textAlign: 'center', background: 'var(--bg3)', borderRadius: 10, padding: '10px 8px' }}>
            <div style={{ fontSize: 20 }}>{stat.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--green)' }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Results Count */}
      <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text3)', backgroundColor: '#0d1512' }}>
        {filteredPosts.length} workout{filteredPosts.length !== 1 ? 's' : ''} found{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}{searchQuery ? ` for "${searchQuery}"` : ''}
      </div>

      {/* Results List */}
      <div style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 16, fontWeight: 900 }}>No results found</h3>
            <p style={{ color: 'var(--text3)', textAlign: 'center' }}>Try a different search term or category</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} onProfileClick={() => {}} />
          ))
        )}
      </div>

      {/* Bottom Nav placeholder */}
      <div style={{ height: 100 }} />
    </div>
  );
}
