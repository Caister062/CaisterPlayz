import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CategoryTabs from '../components/CategoryTabs';
import FitnessStats from '../components/FitnessStats';
import Composer from '../components/Composer';

/* =========================
   HOME / FITNESS FEED
========================= */
export default function Home({ userId, currentUserId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showComposer, setShowComposer] = useState(false);

  // Load posts (replaces real-time with a refresh event for simplicity)
  useEffect(() => {
    loadPosts();
    window.addEventListener('refreshPosts', loadPosts);
    return () => window.removeEventListener('refreshPosts', loadPosts);
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      // Fetch from PocketBase
      if (window.cplayz_posts) {
        setPosts(window.cplayz_posts);
      } else {
        // Demo posts
        const demo = [0, 1, 2, 3, 4].map(i => ({
          id: `demo-${i}`,
          userId: `user-${i % 3}`,
          displayName: ['Alex M.', 'Sarah K.', 'Mike R.'][i % 3],
          avatar: '',
          category: ['Weight', 'Cardio', 'Meal Prep', 'Challenge', 'Motivation'][i % 5],
          content: [
            "Just finished my first 5K! 🏃‍♀️ The weather was perfect and I felt unstoppable. Who's joining me next week?",
            "Chest day complete ✓ Bench 225x5, Incline DB Press 3x10, Flyes 4x12. Feeling pumped! 💪",
            "Meal prep Sunday 🥗 Grilled chicken, brown rice, roasted veggies. Fueling up for the week ahead!",
            "Day 30 of the Plank Challenge complete! Started with 30s, now holding for 3 min straight 🔥",
            "Morning run done ☀️ 6 miles at 8:30 pace. Starting the day right! What's your morning routine?",
          ][i],
          image: '',
          likesCount: Math.floor(Math.random() * 50 + 10),
          commentsCount: Math.floor(Math.random() * 20 + 3),
          timestamp: `${Math.floor(Math.random() * 12 + 1)}h`
        }));
        setPosts(demo);
      }
    } catch (e) {
      console.error('Failed to load posts:', e);
    } finally {
      setLoading(false);
    }
  }

  // Stats for this user
  const stats = [
    { label: 'Workouts', value: Math.floor(Math.random() * 50 + 10) },
    { label: 'Posts', value: Math.floor(Math.random() * 30 + 5) },
    { label: 'Streak', value: Math.floor(Math.random() * 21 + 7) },
    { label: 'Calories', value: Math.floor(Math.random() * 500 + 500) }
  ];

  return (
    <div>
      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">Playz Fitness</h1>
        <p className="app-subtitle">Your workout community — Post. Share. Motivate.</p>
      </div>

      {/* Stats */}
      <FitnessStats stats={stats} />

      {/* Category Tabs */}
      <CategoryTabs selected={selectedCategory} onChange={setSelectedCategory} />

      {/* Create Post FAB */}
      <button
        className="fab"
        onClick={() => setShowComposer(true)}
        title="Create post"
      >
        <span style={{ fontSize: 24, fontWeight: 800 }}>+</span>
      </button>

      {/* Feed */}
      <div>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={`skel-${i}`} className="skel-card">
              <div className="ske" style={{ height: 14, width: '60%', marginBottom: 8 }} />
              <div className="ske" style={{ height: 12, width: '53%' }} />
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="empty">
            <div className="hollow-text">🏋️</div>
            <h2 style={{ fontSize: 16, fontWeight: 900 }}>No posts yet</h2>
            <p style={{ color: '#4b5563' }}>Be the first to share your workout!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} onProfileClick={() => {}} />
          ))
        )}
      </div>

      {/* Bottom spacing — no bottom nav needed */}
      <div style={{ height: 100 }} />

      {/* Composer Modal */}
      {showComposer && (
        <Composer userId={userId} currentUserId={currentUserId} onClose={() => setShowComposer(false)} />
      )}
    </div>
  );
}
