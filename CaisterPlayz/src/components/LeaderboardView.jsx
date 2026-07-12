import { useState, useMemo } from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import { Avatar } from './Shared';

export default function LeaderboardView({ users, onProfileClick }) {
  // Rank users by followers count
  const rankedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aFollowers = Array.isArray(a.followers) ? a.followers.length : 0;
      const bFollowers = Array.isArray(b.followers) ? b.followers.length : 0;
      return bFollowers - aFollowers;
    });
  }, [users]);

  const top3 = rankedUsers.slice(0, 3);
  const rest = rankedUsers.slice(3, 100);

  return (
    <div className="flex-1 overflow-y-auto pb-24 fade-in">
      {/* Header */}
      <div className="p-6 text-center border-b border-dark-border bg-dark-bg/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-2xl font-black text-brand-primary flex items-center justify-center gap-2 uppercase tracking-wider">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Global Rankings
        </h2>
        <p className="text-sm text-dark-muted mt-2">Top users by Follower Count</p>
      </div>

      {/* Podium for Top 3 */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-4 p-8 border-b border-dark-border">
          {/* Rank 2 */}
          {top3[1] && (
            <div 
              className="flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-2"
              onClick={() => onProfileClick(top3[1].id)}
            >
              <Avatar src={top3[1].avatarUrl} name={top3[1].displayName} size="md" />
              <div className="mt-2 text-sm font-bold truncate max-w-[80px] text-gray-400">{top3[1].displayName}</div>
              <div className="w-20 h-24 bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-lg mt-2 flex items-center justify-center font-black text-2xl text-white shadow-lg">2</div>
            </div>
          )}

          {/* Rank 1 */}
          {top3[0] && (
            <div 
              className="flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-2 z-10"
              onClick={() => onProfileClick(top3[0].id)}
            >
              <Avatar src={top3[0].avatarUrl} name={top3[0].displayName} size="lg" />
              <div className="mt-2 text-sm font-bold truncate max-w-[100px] text-yellow-400">{top3[0].displayName}</div>
              <div className="w-24 h-32 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg mt-2 flex items-center justify-center font-black text-3xl text-white shadow-[0_0_20px_rgba(250,204,21,0.4)]">1</div>
            </div>
          )}

          {/* Rank 3 */}
          {top3[2] && (
            <div 
              className="flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-2"
              onClick={() => onProfileClick(top3[2].id)}
            >
              <Avatar src={top3[2].avatarUrl} name={top3[2].displayName} size="md" />
              <div className="mt-2 text-sm font-bold truncate max-w-[80px] text-amber-700">{top3[2].displayName}</div>
              <div className="w-20 h-20 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-lg mt-2 flex items-center justify-center font-black text-2xl text-white shadow-lg">3</div>
            </div>
          )}
        </div>
      )}

      {/* Rest of the Leaderboard */}
      <div className="p-4 space-y-2">
        {rest.map((user, index) => {
          const rank = index + 4;
          const followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
          return (
            <div 
              key={user.id} 
              className="flex items-center gap-4 p-4 bg-dark-surface rounded-xl hover:bg-dark-hover transition-colors cursor-pointer border border-transparent hover:border-brand-primary"
              onClick={() => onProfileClick(user.id)}
            >
              <div className="font-black text-xl text-dark-muted w-8 text-center">{rank}</div>
              <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base truncate">{user.displayName}</p>
                <p className="text-xs text-dark-muted truncate">{user.bio || 'Rising Star'}</p>
              </div>
              <div className="flex items-center gap-1 text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full text-xs font-bold">
                <Star className="w-3 h-3" />
                {followersCount}
              </div>
            </div>
          );
        })}
        {rankedUsers.length === 0 && (
          <div className="text-center p-8 text-dark-muted">No users found to rank yet.</div>
        )}
      </div>
    </div>
  );
}
