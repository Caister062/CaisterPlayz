import { useState, useEffect } from 'react';
import { X, List, Plus, Trash2, UserPlus, UserMinus, Eye, FileText, Users, ArrowLeft } from 'lucide-react';
import PostCard from './PostCard';

export default function ListsModal({ isOpen, onClose, user, allUsers, posts, onProfileClick }) {
  const [lists, setLists] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [listName, setListName] = useState('');
  const [listDesc, setListDesc] = useState('');
  const [activeList, setActiveList] = useState(null); // When viewing a list timeline or managing it
  const [searchQuery, setSearchQuery] = useState('');

  // Load lists from local storage
  useEffect(() => {
    if (!user?.id) return;
    const stored = localStorage.getItem(`cplayz_lists_${user.id}`);
    if (stored) {
      try {
        setLists(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse lists:', e);
      }
    }
  }, [user?.id]);

  const saveLists = (newLists) => {
    setLists(newLists);
    localStorage.setItem(`cplayz_lists_${user.id}`, JSON.stringify(newLists));
    if (activeList) {
      const updatedActive = newLists.find(l => l.id === activeList.id);
      setActiveList(updatedActive || null);
    }
  };

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!listName.trim()) return;

    const newList = {
      id: 'list_' + Date.now(),
      name: listName,
      description: listDesc,
      userIds: [],
      created: new Date().toISOString()
    };

    saveLists([...lists, newList]);
    setListName('');
    setListDesc('');
    setShowCreate(false);
  };

  const handleDeleteList = (listId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this list?')) {
      const filtered = lists.filter(l => l.id !== listId);
      saveLists(filtered);
      if (activeList?.id === listId) {
        setActiveList(null);
      }
    }
  };

  const toggleUserInList = (userId) => {
    if (!activeList) return;

    const isMember = activeList.userIds.includes(userId);
    const updatedUserIds = isMember 
      ? activeList.userIds.filter(id => id !== userId)
      : [...activeList.userIds, userId];

    const updatedLists = lists.map(l => {
      if (l.id === activeList.id) {
        return { ...l, userIds: updatedUserIds };
      }
      return l;
    });

    saveLists(updatedLists);
  };

  // Filter posts to show only those written by users in the list
  const getListPosts = () => {
    if (!activeList) return [];
    return posts.filter(p => activeList.userIds.includes(p.userId));
  };

  // Filter users to search and add to list
  const getFilteredUsers = () => {
    if (!searchQuery.trim()) return allUsers.filter(u => u.id !== user?.id);
    return allUsers.filter(u => 
      u.id !== user?.id && 
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
            {activeList ? (
              <button 
                onClick={() => { setActiveList(null); setSearchQuery(''); }}
                className="mr-2 p-1 rounded-full text-dark-muted hover:text-dark-text hover:bg-dark-hover transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <List className="w-5 h-5 text-brand-primary" />
            )}
            <h3 className="font-bold text-lg text-dark-text">
              {activeList ? activeList.name : 'Custom Lists'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-dark-muted hover:text-dark-text hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-[400px] flex flex-col">
          {activeList ? (
            /* LIST DETAILS & VIEW TIMELINE / MANAGE USERS */
            <div className="flex-1 flex flex-col">
              {/* Tab selector within list: Feed vs. Members */}
              <div className="bg-dark-surface/30 p-4 border-b border-dark-border/40">
                <p className="text-xs text-dark-muted mb-2 font-medium">{activeList.description || 'No description'}</p>
                <div className="text-xs font-semibold text-dark-text bg-dark-border/50 rounded-xl p-2 flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-brand-primary" /> {activeList.userIds.length} members</span>
                  <span className="text-dark-muted">Timeline feed loads posts from list members</span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dark-border overflow-hidden h-full">
                {/* Left Panel: Manage Members */}
                <div className="p-4 flex flex-col h-[50vh] md:h-auto overflow-y-auto">
                  <h4 className="text-xs font-bold text-dark-muted uppercase tracking-wider mb-3">Add / Remove Users</h4>
                  <input 
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-1.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary mb-3"
                  />
                  <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                    {getFilteredUsers().map(u => {
                      const isAdded = activeList.userIds.includes(u.id);
                      return (
                        <div key={u.id} className="flex items-center justify-between p-2 rounded-xl bg-dark-surface/40 border border-dark-border/30">
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { onProfileClick(u.id); onClose(); }}>
                            <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-dark-border flex items-center justify-center text-xs font-bold text-brand-primary overflow-hidden">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt={u.displayName} className="w-full h-full object-cover" />
                              ) : (
                                u.displayName.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <span className="text-xs font-bold text-dark-text max-w-[120px] truncate">{u.displayName}</span>
                          </div>
                          <button
                            onClick={() => toggleUserInList(u.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isAdded 
                                ? 'text-brand-danger bg-brand-danger/10 hover:bg-brand-danger/25' 
                                : 'text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/25'
                            }`}
                          >
                            {isAdded ? <UserMinus className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Panel: Feed Preview */}
                <div className="p-4 flex flex-col h-[50vh] md:h-auto overflow-y-auto bg-dark-bg/40">
                  <h4 className="text-xs font-bold text-dark-muted uppercase tracking-wider mb-3">Timeline Preview</h4>
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {getListPosts().length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-dark-muted">
                        <FileText className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-xs font-medium">No posts found from members in this list.</p>
                      </div>
                    ) : (
                      getListPosts().map(post => (
                        <div key={post.id} className="pointer-events-none scale-[0.98] opacity-90">
                          <PostCard 
                            post={post}
                            currentUser={user}
                            onProfileClick={() => {}}
                            onCommentClick={() => {}}
                            // readOnly actions to simplify list view preview
                            onLike={() => {}}
                            onRepost={() => {}}
                            onQuote={() => {}}
                            onDelete={() => {}}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ALL LISTS INDEX */
            <div className="p-6 space-y-6 flex-1 flex flex-col">
              {showCreate ? (
                /* CREATE LIST FORM */
                <form onSubmit={handleCreateList} className="space-y-4 animate-fade-slide">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dark-text">List Name</label>
                    <input 
                      type="text"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      placeholder="e.g. Pro Players, Anime Fans"
                      className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dark-text">Description</label>
                    <textarea 
                      value={listDesc}
                      onChange={(e) => setListDesc(e.target.value)}
                      placeholder="What is this timeline list about?"
                      className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-primary resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-sm rounded-xl transition-all"
                    >
                      Save List
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
                /* LISTS LISTING */
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-dark-muted font-bold uppercase tracking-wider">My Timelines ({lists.length})</span>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="flex items-center gap-1 text-xs text-brand-primary font-bold hover:underline"
                    >
                      <Plus className="w-4 h-4" /> Create List
                    </button>
                  </div>

                  {lists.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-dark-border rounded-2xl text-dark-muted">
                      <List className="w-10 h-10 mb-2 text-dark-muted/40" />
                      <h4 className="text-sm font-bold text-dark-text mb-1">No lists yet</h4>
                      <p className="text-xs max-w-[200px]">Create custom timelines of specific people you want to filter and read.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[450px]">
                      {lists.map(list => (
                        <div 
                          key={list.id} 
                          onClick={() => setActiveList(list)}
                          className="flex items-center justify-between p-4 bg-dark-surface border border-dark-border rounded-2xl hover:border-brand-primary/40 hover:bg-dark-hover transition-all cursor-pointer group"
                        >
                          <div>
                            <h4 className="text-sm font-bold text-dark-text group-hover:text-brand-primary transition-colors">{list.name}</h4>
                            <p className="text-xs text-dark-muted mt-0.5 line-clamp-1">{list.description || 'No description'}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 rounded bg-dark-border text-[10px] text-dark-muted font-semibold">
                              {list.userIds.length} members
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveList(list); }}
                              className="p-2 rounded-lg text-dark-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteList(list.id, e)}
                              className="p-2 rounded-lg text-dark-muted hover:text-brand-danger hover:bg-brand-danger/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
