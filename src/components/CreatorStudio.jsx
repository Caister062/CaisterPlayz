import { useState, useEffect } from 'react';
import { X, Award, DollarSign, Eye, Activity, Coins, TrendingUp, ShieldCheck, Users, HelpCircle, CheckCircle } from 'lucide-react';
import { playCashOutSound } from '../sounds';

export default function CreatorStudio({ isOpen, onClose, user, profile, posts, followersCount }) {
  const [revenue, setRevenue] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalEngagements, setTotalEngagements] = useState(0);
  const [engagementRate, setEngagementRate] = useState(0);
  const [isEligible, setIsEligible] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [cashedAmount, setCashedAmount] = useState(0);
  const [coinsList, setCoinsList] = useState([]);

  // Calculate analytics based on user's posts
  useEffect(() => {
    if (!user?.id || !posts) return;

    const myPosts = posts.filter(p => p.userId === user.id);
    let views = 0;
    let likes = 0;
    let commentsCount = 0; // Mock or real comment count
    let reposts = 0;

    myPosts.forEach(p => {
      views += (p.viewedBy || []).length;
      likes += (p.likedBy || []).length;
      reposts += (p.repostedBy || []).length;
      // Since comments count needs querying or is not simple, we can mock/estimate comments
      // or if we have comment lists, but estimate is fine. Let's assume 1.5 comments per like as estimate
      commentsCount += Math.ceil(likes * 0.2);
    });

    const engagement = likes + reposts + commentsCount;
    const rate = views > 0 ? ((engagement / views) * 100) : 0;
    
    // Revenue simulation: $0.005 per view + $0.02 per engagement
    const estRevenue = (views * 0.005) + (engagement * 0.02);

    setTotalViews(views);
    setTotalEngagements(engagement);
    setEngagementRate(rate.toFixed(1));
    setRevenue(estRevenue);

    // Eligibility check: verified, 5 followers, 50 total views
    const hasVerification = profile?.verified || false;
    const meetsFollowers = followersCount >= 5;
    const meetsViews = views >= 50;
    setIsEligible(hasVerification && meetsFollowers && meetsViews);
  }, [user?.id, posts, profile, followersCount]);

  const handleCashOut = () => {
    if (revenue <= 0) return;
    
    // Play cash-out coin sound
    playCashOutSound();
    
    setCashedAmount(revenue);
    setShowSuccessOverlay(true);

    // Generate falling coins for visual overlay
    const newCoins = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage
      delay: Math.random() * 1.5, // seconds delay
      duration: 1.5 + Math.random() * 2, // fall duration
      scale: 0.5 + Math.random() * 1,
      spinSpeed: 1 + Math.random() * 3
    }));
    setCoinsList(newCoins);
  };

  const handleCloseOverlay = () => {
    setShowSuccessOverlay(false);
    setRevenue(0); // Reset revenue on successful cashout simulator
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-overlay" onClick={onClose}>
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
              <h3 className="font-bold text-lg text-dark-text leading-tight">Creator Studio</h3>
              <p className="text-xs text-dark-muted">Monetize your content & track performance</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-dark-muted hover:text-dark-text hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Revenue Card (Large & Premium) */}
          <div className="relative overflow-hidden rounded-2xl border border-brand-secondary/30 bg-gradient-to-br from-brand-secondary/15 via-dark-surface to-dark-surface p-6 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Estimated Revenue</p>
                <h1 className="text-4xl font-extrabold text-white mt-1.5 flex items-center">
                  <span className="text-brand-secondary mr-0.5">$</span>
                  {revenue.toFixed(2)}
                </h1>
              </div>
              <div className="p-3 bg-brand-secondary/10 text-brand-secondary rounded-2xl">
                <DollarSign className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <p className="text-xs text-dark-muted mt-4">
              Revenue is calculated based on impressions and user engagement on your posts.
            </p>

            <button
              onClick={handleCashOut}
              disabled={revenue <= 0}
              className={`w-full mt-5 py-3 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                revenue > 0
                  ? 'bg-gradient-to-r from-brand-secondary to-brand-primary text-white hover:opacity-95 shadow-md active:scale-[0.98]'
                  : 'bg-dark-border text-dark-muted cursor-not-allowed'
              }`}
            >
              <Coins className="w-4 h-4" />
              Cash Out to Bank
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-surface border border-dark-border rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-dark-muted mb-2">
                <span className="text-xs font-semibold">Post Views</span>
                <Eye className="w-4 h-4 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark-text">{totalViews}</h3>
                <span className="text-[10px] text-brand-success font-medium flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> Impressive
                </span>
              </div>
            </div>

            <div className="bg-dark-surface border border-dark-border rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-dark-muted mb-2">
                <span className="text-xs font-semibold">Engagements</span>
                <Activity className="w-4 h-4 text-brand-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark-text">{totalEngagements}</h3>
                <span className="text-[10px] text-dark-muted">Likes & comments</span>
              </div>
            </div>

            <div className="bg-dark-surface border border-dark-border rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-dark-muted mb-2">
                <span className="text-xs font-semibold">Eng. Rate</span>
                <TrendingUp className="w-4 h-4 text-brand-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark-text">{engagementRate}%</h3>
                <span className="text-[10px] text-dark-muted">Ratio per view</span>
              </div>
            </div>
          </div>

          {/* Monetization Status Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-dark-muted uppercase tracking-wider px-1">Eligibility Criteria</h4>
            
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 space-y-4">
              
              {/* Requirement 1: Creator Verification */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${profile?.verified ? 'bg-brand-success/15 text-brand-success' : 'bg-dark-border text-dark-muted'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-dark-text">Verified Badge</h5>
                    <p className="text-[10px] text-dark-muted">Toggle requests inside Settings modal</p>
                  </div>
                </div>
                {profile?.verified ? (
                  <CheckCircle className="w-5 h-5 text-brand-success" />
                ) : (
                  <div className="text-[10px] bg-dark-border border border-dark-border px-2.5 py-1 rounded-full text-dark-muted font-bold">
                    Incomplete
                  </div>
                )}
              </div>

              {/* Requirement 2: Followers count */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${followersCount >= 5 ? 'bg-brand-success/15 text-brand-success' : 'bg-dark-border text-dark-muted'}`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-dark-text">Social Network size</h5>
                      <p className="text-[10px] text-dark-muted">Need 5 or more subscribers</p>
                    </div>
                  </div>
                  <span className="font-bold text-dark-text">{followersCount} / 5</span>
                </div>
                <div className="w-full bg-dark-bg h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-secondary rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (followersCount / 5) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Requirement 3: Total Impressions views */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${totalViews >= 50 ? 'bg-brand-success/15 text-brand-success' : 'bg-dark-border text-dark-muted'}`}>
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-dark-text">Content Reach</h5>
                      <p className="text-[10px] text-dark-muted">Need 50 or more post impressions</p>
                    </div>
                  </div>
                  <span className="font-bold text-dark-text">{totalViews} / 50</span>
                </div>
                <div className="w-full bg-dark-bg h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-secondary rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (totalViews / 50) * 100)}%` }} 
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Success Coin Rain Overlay */}
      {showSuccessOverlay && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg animate-fade-in cursor-pointer select-none"
          onClick={handleCloseOverlay}
        >
          {/* Falling Coins Container */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {coinsList.map(coin => (
              <div
                key={coin.id}
                className="absolute text-brand-warning text-3xl select-none"
                style={{
                  left: `${coin.left}%`,
                  top: `-40px`,
                  transform: `scale(${coin.scale})`,
                  animation: `fall-${coin.id} ${coin.duration}s linear ${coin.delay}s forwards`,
                }}
              >
                🪙
                <style>{`
                  @keyframes fall-${coin.id} {
                    0% {
                      transform: translateY(0) rotate(0deg) scale(${coin.scale});
                      opacity: 1;
                    }
                    90% {
                      opacity: 1;
                    }
                    100% {
                      transform: translateY(110vh) rotate(${coin.spinSpeed * 360}deg) scale(${coin.scale});
                      opacity: 0;
                    }
                  }
                `}</style>
              </div>
            ))}
          </div>

          {/* Success Card */}
          <div className="relative p-8 bg-dark-surface border border-brand-success/30 rounded-3xl max-w-sm w-full mx-4 text-center shadow-2xl animate-pop">
            <div className="w-20 h-20 bg-brand-success/15 border border-brand-success/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Coins className="w-10 h-10 text-brand-success animate-bounce" />
            </div>

            <h2 className="text-2xl font-black text-white mb-2">Simulated Bank Transfer!</h2>
            <p className="text-sm text-dark-muted mb-6">
              A total of <span className="text-brand-success font-bold text-lg">${cashedAmount.toFixed(2)}</span> has been transferred to your demo wallet.
            </p>

            <div className="inline-block px-4 py-2 rounded-xl bg-brand-success/15 text-brand-success font-bold text-xs">
              Transferred Successfully ✓
            </div>

            <p className="text-[10px] text-dark-muted mt-8">
              Click anywhere to continue
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
