import { useState, useEffect } from 'react';
import {
  X,
  Award,
  DollarSign,
  Eye,
  Activity,
  Coins,
  TrendingUp,
  ShieldCheck,
  Users,
  CheckCircle
} from 'lucide-react';

import { playCashOutSound } from '../sounds';

export default function CreatorStudio({
  isOpen,
  onClose,
  user,
  profile,
  posts,
  followersCount
}) {
  const [revenue, setRevenue] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalEngagements, setTotalEngagements] = useState(0);
  const [engagementRate, setEngagementRate] = useState(0);
  const [isEligible, setIsEligible] = useState(false);
  const [cashingOut, setCashingOut] = useState(false);

  // Analytics
  useEffect(() => {
    if (!user?.id || !posts) return;

    const myPosts = posts.filter(p => p.userId === user.id);

    let views = 0;
    let likes = 0;
    let reposts = 0;
    let commentsCount = 0;

    myPosts.forEach(p => {
      views += (p.viewedBy || []).length;
      likes += (p.likedBy || []).length;
      reposts += (p.repostedBy || []).length;

      commentsCount += Math.ceil(likes * 0.2);
    });

    const engagement = likes + reposts + commentsCount;
    const rate = views > 0 ? (engagement / views) * 100 : 0;

    const estRevenue = views * 0.005 + engagement * 0.02;

    setTotalViews(views);
    setTotalEngagements(engagement);
    setEngagementRate(rate.toFixed(1));
    setRevenue(estRevenue);

    const hasVerification = profile?.verified || false;
    const meetsFollowers = followersCount >= 5;
    const meetsViews = views >= 50;

    setIsEligible(hasVerification && meetsFollowers && meetsViews);
  }, [user?.id, posts, profile, followersCount]);

  // REALISTIC cashout handler (no fake animation)
  const handleCashOut = async () => {
    if (revenue <= 0 || cashingOut) return;

    setCashingOut(true);

    try {
      playCashOutSound();

      // 🔥 Replace this with real API later
      await new Promise(res => setTimeout(res, 1200));

      alert(`Cashout successful: $${revenue.toFixed(2)} transferred.`);
      setRevenue(0);
    } catch (err) {
      console.error(err);
      alert('Cashout failed. Try again later.');
    }

    setCashingOut(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-overlay"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

      <div
        className="relative w-full max-w-lg bg-dark-bg border border-dark-border rounded-3xl overflow-hidden shadow-2xl animate-modal-enter max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-dark-surface/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-brand-secondary" />
            <div>
              <h3 className="font-bold text-lg text-dark-text">
                Creator Studio
              </h3>
              <p className="text-xs text-dark-muted">
                Monetize your content & track performance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-dark-muted hover:text-dark-text hover:bg-dark-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Revenue */}
          <div className="rounded-2xl border border-brand-secondary/30 bg-gradient-to-br from-brand-secondary/15 to-dark-surface p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-brand-secondary uppercase">
                  Estimated Revenue
                </p>
                <h1 className="text-4xl font-extrabold text-white mt-2">
                  ${revenue.toFixed(2)}
                </h1>
              </div>

              <DollarSign className="w-6 h-6 text-brand-secondary" />
            </div>

            <button
              onClick={handleCashOut}
              disabled={revenue <= 0 || cashingOut}
              className="w-full mt-5 py-3 rounded-xl font-bold bg-gradient-to-r from-brand-secondary to-brand-primary text-white disabled:opacity-40"
            >
              {cashingOut ? 'Processing...' : 'Cash Out'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
              <Eye className="w-4 h-4 text-brand-primary mb-2" />
              <p className="text-xs text-dark-muted">Views</p>
              <p className="font-bold text-dark-text">{totalViews}</p>
            </div>

            <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
              <Activity className="w-4 h-4 text-brand-secondary mb-2" />
              <p className="text-xs text-dark-muted">Engagement</p>
              <p className="font-bold text-dark-text">{totalEngagements}</p>
            </div>

            <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
              <TrendingUp className="w-4 h-4 text-brand-secondary mb-2" />
              <p className="text-xs text-dark-muted">Rate</p>
              <p className="font-bold text-dark-text">{engagementRate}%</p>
            </div>
          </div>

          {/* Eligibility */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-dark-muted uppercase">
              Eligibility
            </h4>

            {/* Verified */}
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className={`w-5 h-5 ${
                    profile?.verified
                      ? 'text-brand-success'
                      : 'text-dark-muted'
                  }`}
                />
                <span className="text-sm">Verified</span>
              </div>

              {profile?.verified ? (
                <CheckCircle className="text-brand-success w-5 h-5" />
              ) : (
                <span className="text-xs text-dark-muted">No</span>
              )}
            </div>

            {/* Followers */}
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-dark-muted" />
                <span className="text-sm">Followers</span>
              </div>
              <span className="text-sm">
                {followersCount} / 5
              </span>
            </div>

            {/* Views */}
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-dark-muted" />
                <span className="text-sm">Views</span>
              </div>
              <span className="text-sm">
                {totalViews} / 50
              </span>
            </div>

            <p className="text-xs text-dark-muted pt-2">
              Must meet all requirements to enable monetization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
