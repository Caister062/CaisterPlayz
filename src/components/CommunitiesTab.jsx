import { useState, useEffect } from 'react';
import { X, Users, Plus, Image as ImageIcon, MessageSquare, ArrowLeft, PlusCircle, Check } from 'lucide-react';
import { useCommunities, createCommunity, joinCommunity, createPost } from '../hooks';
import PostCard from './PostCard';

export default function CommunitiesTab({ isOpen, onClose, user, allUsers, posts, onProfileClick, refreshAllPosts }) {
  const { communities, loading, refreshCommunities } = useCommunities();
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  
  // Create form states
  const [commName, setCommName] = useState('');
  const [commDesc, setCommDesc] = useState('');
  const [commAvatar, setCommAvatar] = useState('');
  const [creating, setCreating] = useState(false);

  // Community post composer state
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState('');
  const [publishing, setPublishing] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!commName.trim() || creating) return;
    setCreating(true);
    try {
      // If no avatar is provided, use a placeholder avatar generator
      const avatar = commAvatar.trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(commName)}`;
      await createCommunity(commName, commDesc, avatar, user.id);
      setCommName('');
      setCommDesc('');
      setCommAvatar('');
      setShowCreate(false);
      refreshCommunities();
    } catch (err) {
      console.error('Failed to create community:', err);
      alert('Error creating community. Please check permission.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinToggle = async (communityId, e) => {
    if (e) e.stopPropagation();
  
    if (!user?.id) {
      alert("No user loaded.");
      return;
    }
  
    try {
      console.log("Joining community:", communityId);
      console.log("Current user:", user.id);
      console.log("communityId =", communityId);
  
      await joinCommunity(communityId, user.id);
  
      await refreshCommunities();
  
      if (activeCommunity?.id === communityId) {
       const updated = (communities || []).find(
          c => c.id === communityId
        );
      }
    } catch (err) {
      console.error("Failed to join community:", err);
      console.error("Response:", err?.response);
  
      alert(
        JSON.stringify(
          err?.response || err?.data || err,
          null,
          2
        )
      );
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim() || publishing || !activeCommunity) return;
    setPublishing(true);
    try {
      await createPost(
        user.id, 
        postText, 
        postImage, 
        '', // musicId
        '', // musicName
        '', // originalPostId
        'post', // type
        activeCommunity.id // communityId
      );
      setPostText('');
      setPostImage('');
      // Trigger full refresh
      if (refreshAllPosts) refreshAllPosts();
    } catch (err) {
      console.error('Post failed:', err);
    } finally {
      setPublishing(false);
    }
  };

  // Filter global posts by this community
  const getCommunityPosts = () => {
    if (!activeCommunity) return [];
    return posts.filter(p => p.communityId === activeCommunity.id);
  };

  const getMemberCount = (comm) => {
    return (comm?.members || []).length;
  };

  const isUserMember = (comm) => {
    if (!user?.id) return false;
  
    const members = Array.isArray(comm?.members)
      ? comm.members
      : [];
  
    return members.includes(user.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-overlay select-none" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div 
        className="relative w-full max-w-lg bg-dark-bg border border-dark-border rounded-3xl overflow-hidden shadow-2xl animate-modal-enter max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border flex-shrink-0">
          <div className="flex items-center gap-2">
            {activeCommunity ? (
              <button 
                onClick={() => setActiveCommunity(null)}
                className="mr-2 p-1 rounded-full text-dark-muted hover:text-dark-text hover:bg-dark-hover transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <Users className="w-5 h-5 text-brand-primary" />
            )}
            <h3 className="font-bold text-lg text-dark-text">
              {activeCommunity ? activeCommunity.name : 'Gaming Communities'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-dark-muted hover:text-dark-text hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-[400px] flex flex-col">
          {activeCommunity ? (
            /* COMMUNITY ROOM VIEW */
            <div className="flex-1 flex flex-col">
              {/* Community Banner details */}
              <div className="bg-dark-surface/40 p-4 border-b border-dark-border/40 flex items-start gap-4">
                <img 
                  src={activeCommunity.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${activeCommunity.name}`} 
                  alt={activeCommunity.name} 
                  className="w-12 h-12 rounded-xl object-cover border border-dark-border"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-dark-text">{activeCommunity.name}</h4>
                  <p className="text-xs text-dark-muted mt-0.5">{activeCommunity.description || 'No description provided.'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-dark-muted bg-dark-border px-2 py-0.5 rounded font-bold">
                      {getMemberCount(activeCommunity)} Members
                    </span>
                    <span className="text-[10px] text-dark-muted bg-dark-border px-2 py-0.5 rounded font-bold">
                      Created by: {(allUsers || []).find(
                        u => u.id === activeCommunity.createdBy
                      )?.displayName || 'Unknown'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleJoinToggle(activeCommunity.id, e)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isUserMember(activeCommunity)
                      ? 'bg-dark-border text-dark-text border border-dark-border hover:bg-brand-danger/10 hover:text-brand-danger hover:border-brand-danger/20'
                      : 'bg-brand-primary text-white hover:bg-brand-primary/90'
                  }`}
                >
                  {isUserMember(activeCommunity) ? 'Joined ✓' : 'Join'}
                </button>
              </div>

              {/* Feed Panel split (Composer on top, posts below) */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[50vh] md:max-h-none">
                {/* Micro-Composer for community posts */}
                {isUserMember(activeCommunity) ? (
                  <form onSubmit={handlePostSubmit} className="bg-dark-surface/50 border border-dark-border rounded-2xl p-3.5 space-y-3">
                    <textarea
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      placeholder={`Share something in ${activeCommunity.name}...`}
                      rows={2}
                      className="w-full bg-transparent border-0 resize-none text-xs text-dark-text focus:ring-0 focus:outline-none placeholder-dark-muted"
                      required
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-dark-border/40">
                      <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          placeholder="Add image URL..."
                          value={postImage}
                          onChange={(e) => setPostImage(e.target.value)}
                          className="bg-dark-surface border border-dark-border rounded-lg px-2 py-1 text-[10px] text-dark-text focus:outline-none focus:border-brand-primary w-32"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={publishing || !postText.trim()}
                        className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                      >
                        {publishing ? 'Posting...' : 'Post Room'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-dark-surface/30 border border-dark-border/40 rounded-xl p-3.5 text-center text-xs text-dark-muted font-medium">
                    You must join this community to post here.
                  </div>
                )}

                {/* Posts Feed */}
                <div className="space-y-3 pr-1">
                  {getCommunityPosts().length === 0 ? (
                    <div className="py-8 text-center text-dark-muted text-xs">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-35" />
                      No posts here yet. Be the first to share!
                    </div>
                  ) : (
                    getCommunityPosts().map(post => (
                      <PostCard 
                        key={post.id}
                        post={post}
                        currentUser={user}
                        onProfileClick={(uid) => { onProfileClick(uid); onClose(); }}
                        onCommentClick={() => {}}
                        onLike={() => {}}
                        onRepost={() => {}}
                        onQuote={() => {}}
                        onDelete={() => {}}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* COMMUNITIES LIST INDEX */
            <div className="p-6 space-y-6 flex-1 flex flex-col">
              {showCreate ? (
                /* CREATE COMMUNITY FORM */
                <form onSubmit={handleCreate} className="space-y-4 animate-fade-slide">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dark-text">Community Name</label>
                    <input 
                      type="text"
                      value={commName}
                      onChange={(e) => setCommName(e.target.value)}
                      placeholder="e.g. Minecraft Modding, League Esports"
                      className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dark-text">Description</label>
                    <textarea 
                      value={commDesc}
                      onChange={(e) => setCommDesc(e.target.value)}
                      placeholder="What is this community's theme or rule?"
                      className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-primary resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dark-text">Avatar Icon URL (Optional)</label>
                    <input 
                      type="text"
                      value={commAvatar}
                      onChange={(e) => setCommAvatar(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={creating || !commName.trim()}
                      className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50"
                    >
                      {creating ? 'Creating...' : 'Create Community'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="flex-1 py-2.5 bg-dark-surface border border-dark-border hover:bg-dark-hover text-dark-text font-bold text-sm rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* ALL LISTINGS */
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-dark-muted font-bold uppercase tracking-wider">
                      Active Rooms ({(communities || []).length})
                    </span>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="flex items-center gap-1 text-xs text-brand-primary font-bold hover:underline"
                    >
                      <Plus className="w-4 h-4" /> Start Room
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex justify-center items-center py-10">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : communities.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-dark-border rounded-2xl text-dark-muted">
                      <Users className="w-10 h-10 mb-2 text-dark-muted/40" />
                      <h4 className="text-sm font-bold text-dark-text mb-1">No rooms formed</h4>
                      <p className="text-xs max-w-[200px]">Be the first to build a gaming hub community room on CaisterPlayz!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[450px]">
                      {communities.map(comm => (
                        <div 
                          key={comm.id} 
                          onClick={() => setActiveCommunity(comm)}
                          className="flex items-center justify-between p-3.5 bg-dark-surface border border-dark-border rounded-2xl hover:border-brand-primary/40 hover:bg-dark-hover transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={comm.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${comm.name}`} 
                              alt={comm.name} 
                              className="w-10 h-10 rounded-xl object-cover border border-dark-border bg-dark-bg"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-dark-text group-hover:text-brand-primary transition-colors">{comm.name}</h4>
                              <p className="text-[10px] text-dark-muted mt-0.5 line-clamp-1 max-w-[220px]">{comm.description || 'No description'}</p>
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-dark-border text-[9px] text-dark-muted font-bold">
                                {getMemberCount(comm)} members
                              </span>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => handleJoinToggle(comm.id, e)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-colors ${
                              isUserMember(comm)
                                ? 'text-dark-text bg-dark-border hover:bg-brand-danger/10 hover:text-brand-danger'
                                : 'text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20'
                            }`}
                          >
                            {isUserMember(comm) ? 'Joined ✓' : 'Join'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
