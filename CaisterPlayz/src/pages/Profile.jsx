import { useState } from 'react';
import PostCard from '../components/PostCard';

/* =========================
   PROFILE PAGE
========================= */
export default function Profile({ user }) {
  const [activeTab, setActiveTab] = useState('posts');
  
  // Demo stats
  const userProfile = user || {
    id: 'demo-user',
    username: 'FitnessWarrior23',
    avatarUrl: '',
    bio: '💪 Fitness enthusiast | 🏋️ Strength training | 🥗 Meal prep lover\n🎯 Goal: Deadlift 405lbs | Running my first marathon in 2025'
  };

  const stats = [
    { label: 'Posts', value: Math.floor(Math.random() * 100 + 20) },
    { label: 'Followers', value: Math.floor(Math.random() * 500 + 100) },
    { label: 'Following', value: Math.floor(Math.random() * 300 + 50) },
    { label: 'Streak', value: `${Math.floor(Math.random() * 60 + 14)}d` }
  ];

  // Demo user posts
  const demoPosts = Array.from({ length: 6 }, (_, i) => ({
    id: `user-post-${i}`,
    userId: userProfile.id,
    displayName: userProfile.username || 'You',
    avatar: '',
    category: ['Weight', 'Cardio', 'Meal Prep', 'Challenge', 'Motivation', 'Yoga'][i % 6],
    content: [
      "Morning chest session done! 4x10 bench press at 225lbs. Feeling stronger! 💪",
      "30-minute HIIT session complete 🔥 Burned 450 calories in one workout!",
      "Healthy dinner prep 🍗 Grilled salmon, quinoa, and steamed broccoli. Clean eating!",
      "Day 45 of my fitness challenge! The transformation is incredible 📸",
      "Rest days are just as important as training days. Recovery = results ✨",
      "Leg day was brutal but worth it 🦵 Squats to failure, then some.",
    ][i],
    image: '',
    likesCount: Math.floor(Math.random() * 80 + 10),
    commentsCount: Math.floor(Math.random() * 30 + 5),
    timestamp: `${Math.floor(Math.random() * 24)}h`
  }));

  return (
    <div className="page-container">
      {/* Profile Header */}
      <div className="profile-header" style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.1), transparent)', padding: '24px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div className="avatar-large">
            {user?.email?.[0]?.toUpperCase() || '⚡'}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{userProfile.username || 'You'}</h2>
            <p style={{ fontSize: 13, color: 'var(--text3)', margin: '2px 0 0' }}>@{userProfile.id || 'fitness_warrior'}</p>
          </div>
        </div>

        {/* Bio */}
        {userProfile.bio && (
          <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, margin: '0 0 16px', whiteSpace: 'pre-line' }}>
            {userProfile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          {stats.map(stat => (
            <div key={stat.label} className="stat-card">
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--green)' }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Edit Profile Button */}
        <button className="btn-secondary" style={{ width: '100%', marginTop: 12 }}>
          ✏️ Edit Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        {['posts', 'workouts', 'liked'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>
        {activeTab === 'posts' ? (
          demoPosts.map(post => (
            <PostCard key={post.id} post={post} onProfileClick={() => {}} />
          ))
        ) : activeTab === 'workouts' ? (
          demoPosts.filter(p => ['Weight', 'Cardio'].includes(p.category)).map(post => (
            <PostCard key={post.id} post={post} onProfileClick={() => {}} />
          ))
        ) : (
          demoPosts.slice(0, 3).map(post => (
            <PostCard key={post.id} post={post} onProfileClick={() => {}} />
          ))
        )}
      </div>

      {/* Bottom Nav placeholder */}
      <div style={{ height: 100 }} />
    </div>
  );
}
