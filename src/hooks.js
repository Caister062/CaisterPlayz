import { useState, useEffect, useRef, useCallback } from 'react';
import pb from './pocketbase';

/* ─── Device-based Auth (no login needed) ─── */
function getDeviceId() {
  let id = localStorage.getItem('cplayz_device_id');
  if (!id) {
    const uuid = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Date.now().toString(36) + Math.random().toString(36).substring(2);
    id = 'dev_' + uuid;
    localStorage.setItem('cplayz_device_id', id);
  }
  return id;
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const init = useCallback(async () => {
    const deviceId = getDeviceId();
    try {
      setError(null);
      const existing = await pb.collection('cplayz_users').getList(1, 1, {
        filter: `deviceId="${deviceId}"`
      });
      if (existing.items.length > 0) {
        const u = existing.items[0];
        localStorage.setItem('cplayz_user_id', u.id);
        setUser(u);
      } else {
        const newUser = await pb.collection('cplayz_users').create({
          displayName: `User_${deviceId.slice(4, 10)}`,
          bio: '',
          website: '',
          avatarUrl: '',
          deviceId: deviceId,
        });
        localStorage.setItem('cplayz_user_id', newUser.id);
        setUser(newUser);
      }
    } catch (err) {
      console.error('Auth init error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return { user, loading, error, retry: init };
}

/* ─── User Profile Hook (real-time) ─── */
export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);

  const fetchProfile = useCallback(() => {
    if (!userId) return;
    pb.collection('cplayz_users').getOne(userId).then(setProfile).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    
    fetchProfile();
    
    let unsubscribeFn = null;
    pb.collection('cplayz_users').subscribe(userId, () => {
      fetchProfile();
    }).then(unsub => {
      unsubscribeFn = unsub;
    }).catch(err => {
      console.error('useUserProfile subscribe error:', err);
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [userId, fetchProfile]);

  return profile;
}

/* ─── All Posts Hook (paginated & real-time) ─── */
export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const pageSize = 15;
      const result = await pb.collection('cplayz_posts').getList(pageNum, pageSize, {
        sort: '-id',
      });

      if (append) {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = result.items.filter(p => !existingIds.has(p.id));
          return [...prev, ...newItems];
        });
      } else {
        setPosts(result.items);
      }

      setHasMore(result.items.length === pageSize);
      pageRef.current = pageNum;
    } catch (err) {
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchPosts(pageRef.current + 1, true);
  }, [fetchPosts, loading, loadingMore, hasMore]);

  useEffect(() => {
    fetchPosts(1, false);

    // Poll for new posts and prepend them to the list without resetting the scroll list
    const pollInterval = setInterval(async () => {
      try {
        const pageSize = 15;
        const result = await pb.collection('cplayz_posts').getList(1, pageSize, {
          sort: '-id',
        });
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = result.items.filter(item => !existingIds.has(item.id));
          if (newItems.length > 0) {
            return [...newItems, ...prev];
          }
          return prev;
        });
      } catch (err) {
        console.error('Polling posts error:', err);
      }
    }, 30000);

    const handleRefresh = () => fetchPosts(1, false);
    window.addEventListener('refreshPosts', handleRefresh);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('refreshPosts', handleRefresh);
    };
  }, [fetchPosts]);

  return { posts, loading, hasMore, loadingMore, loadMore, refresh: () => fetchPosts(1, false) };
}

/* ─── Comments Hook (real-time) ─── */
export function useComments(postId) {
  const [comments, setComments] = useState([]);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      const result = await pb.collection('cplayz_comments').getList(1, 200, {
        filter: `postId="${postId}"`,
        sort: 'id',
      });
      setComments(result.items);
    } catch (err) {
      console.error('Fetch comments error:', err);
    }
  }, [postId]);

  useEffect(() => {
    if (!postId) { 
      setComments([]); 
      return; 
    }
    
    fetchComments();
    const interval = setInterval(fetchComments, 30000);
    
    window.addEventListener('refreshComments', fetchComments);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshComments', fetchComments);
    };
  }, [postId, fetchComments]);

  return { comments, refreshComments: fetchComments };
}

/* ─── Notifications Hook (real-time) ─── */
export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const prevCountRef = useRef(0);
  const [newNotification, setNewNotification] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const result = await pb.collection('cplayz_notifications').getList(1, 50, {
        filter: `recipientId="${userId}"`,
        sort: '-id',
      });
      const notifs = result.items;

      // Don't filter by age — show all notifications to the user.
      // Periodic cleanup is handled elsewhere (cron / admin).
      const recentNotifs = notifs;

      if (prevCountRef.current > 0 && recentNotifs.length > prevCountRef.current) {
        const newest = recentNotifs[0];
        if (newest && !newest.read) {
          setNewNotification(newest);
          setTimeout(() => setNewNotification(null), 15000);

          // Native OS Push Notification
          if (window.Notification && Notification.permission === 'granted') {
            pb.collection('cplayz_users').getOne(newest.senderId).then(sender => {
              const text = newest.type === 'like' ? `${sender.displayName} liked your post!` :
                           newest.type === 'repost' ? `${sender.displayName} reposted your post!` :
                           newest.type === 'comment' ? `${sender.displayName} commented on your post!` :
                           newest.type === 'follow' ? `${sender.displayName} followed you!` : 'New notification!';
              try {
                navigator.serviceWorker.ready.then(reg => {
                  reg.showNotification('CaisterPlayz', {
                    body: text,
                    icon: '/favicon.svg',
                    badge: '/favicon.svg',
                    vibrate: [200, 100, 200]
                  });
                });
              } catch {
                new Notification('CaisterPlayz', { body: text });
              }
            }).catch(() => {});
          }
        }
      }
      prevCountRef.current = recentNotifs.length;
      setNotifications(recentNotifs);
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    let unsubscribeFn = null;

    pb.collection('cplayz_notifications').subscribe('*', (e) => {
      if (e.record?.recipientId === userId) {
        fetchNotifications();
      }
    }).then(unsub => { 
      unsubscribeFn = unsub; 
    }).catch(console.error);

    return () => {
      clearInterval(interval);
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [userId, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;
  return { notifications, unreadCount, newNotification };
}

/* ─── Follows Hook (real-time) ─── */
export function useFollows(userId) {
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);

  const fetchFollows = useCallback(async () => {
    if (!userId) return;
    try {
      const [fing, fers] = await Promise.all([
        pb.collection('cplayz_follows').getList(1, 500, { filter: `followerId="${userId}"` }),
        pb.collection('cplayz_follows').getList(1, 500, { filter: `followingId="${userId}"` }),
      ]);
      setFollowing(fing.items);
      setFollowers(fers.items);
    } catch (err) {
      console.error('Fetch follows error:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchFollows();

    let unsubscribeFn = null;
    pb.collection('cplayz_follows').subscribe('*', () => {
      fetchFollows();
    }).then(unsub => {
      unsubscribeFn = unsub;
    }).catch(err => {
      console.error('useFollows subscribe error:', err);
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [userId, fetchFollows]);

  return { following, followers };
}

/* ─── All Users Hook (real-time) ─── */
export function useAllUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const result = await pb.collection('cplayz_users').getList(1, 200);
      setUsers(result.items);
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    let unsubscribeFn = null;
    pb.collection('cplayz_users').subscribe('*', () => {
      fetchUsers();
    }).then(unsub => {
      unsubscribeFn = unsub;
    }).catch(err => {
      console.error('useAllUsers subscribe error:', err);
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [fetchUsers]);

  return users;
}

/* ─── New User Join Alert Hook ─── */
export function useNewUserAlert(users, currentUserId) {
  const [newUserAlert, setNewUserAlert] = useState(null);
  const prevUsersRef = useRef([]);

  useEffect(() => {
    if (!users || users.length === 0) return;

    if (prevUsersRef.current.length === 0) {
      prevUsersRef.current = users;
      return;
    }

    if (users.length > prevUsersRef.current.length) {
      // Find the user object present in current list but missing from history
      const prevIds = new Set(prevUsersRef.current.map(u => u.id));
      const newest = users.find(u => !prevIds.has(u.id));

      if (newest && newest.id !== currentUserId) {
        setNewUserAlert(newest);
        const timer = setTimeout(() => setNewUserAlert(null), 15000);
        return () => clearTimeout(timer);
      }
    }
    prevUsersRef.current = users;
  }, [users, currentUserId]);

  return newUserAlert;
}

/* ─── All Follows (for profile stats) ─── */
export function useAllFollows() {
  const [allFollows, setAllFollows] = useState([]);

  const fetchAllFollows = useCallback(async () => {
    try {
      const result = await pb.collection('cplayz_follows').getList(1, 2000);
      setAllFollows(result.items);
    } catch (err) {
      console.error('Fetch all follows error:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllFollows();

    let unsubscribeFn = null;
    pb.collection('cplayz_follows').subscribe('*', () => {
      fetchAllFollows();
    }).then(unsub => {
      unsubscribeFn = unsub;
    }).catch(err => {
      console.error('useAllFollows subscribe error:', err);
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [fetchAllFollows]);

  return allFollows;
}

/* ═══════════════════════════════════════════
    PocketBase Engine Write Actions
   ═══════════════════════════════════════════ */

export async function createPost(userId, text, imageUrl = '', musicId = '', musicName = '') {
  await pb.collection('cplayz_posts').create({
    userId,
    text,
    imageUrl,
    musicId,
    musicName,
    likedBy: [],
    viewedBy: [],
    repostedBy: [],
    favoritedBy: [],
  }, { fields: 'id' });
}

export async function deletePost(postId, userId) {
  // Verify ownership first
  const post = await pb.collection('cplayz_posts').getOne(postId, {
    fields: 'id,userId'
  });
  if (post.userId !== userId) {
    throw new Error('Not authorized to delete this post');
  }
  await pb.collection('cplayz_posts').delete(postId);
}

export async function toggleLike(postId, userId, isLiked, postOwnerId) {
  const post = await pb.collection('cplayz_posts').getOne(postId, { fields: 'id,likedBy,userId' });
  let likedBy = post.likedBy || [];
  
  if (isLiked) {
    likedBy = likedBy.filter(id => id !== userId);
  } else {
    if (!likedBy.includes(userId)) {
      likedBy = [...likedBy, userId];
      if (postOwnerId && postOwnerId !== userId) {
        await pb.collection('cplayz_notifications').create({
          recipientId: postOwnerId,
          senderId: userId,
          type: 'like',
          postId,
          read: false,
        }).catch(() => {}); // catch silent notification errors
      }
    }
  }
  const cleanArray = [...new Set(likedBy)];
  await pb.collection('cplayz_posts').update(postId, { likedBy: cleanArray }, { fields: 'id' });
}

export async function toggleRepost(postId, userId, isReposted, postOwnerId) {
  const post = await pb.collection('cplayz_posts').getOne(postId, { fields: 'id,repostedBy,userId' });
  let repostedBy = post.repostedBy || [];
  
  if (isReposted) {
    repostedBy = repostedBy.filter(id => id !== userId);
  } else {
    if (!repostedBy.includes(userId)) {
      repostedBy = [...repostedBy, userId];
      if (postOwnerId && postOwnerId !== userId) {
        await pb.collection('cplayz_notifications').create({
          recipientId: postOwnerId,
          senderId: userId,
          type: 'repost',
          postId,
          read: false,
        }).catch(() => {});
      }
    }
  }
  const cleanArray = [...new Set(repostedBy)];
  await pb.collection('cplayz_posts').update(postId, { repostedBy: cleanArray }, { fields: 'id' });
}

export async function toggleBookmark(postId, userId, isBookmarked) {
  const post = await pb.collection('cplayz_posts').getOne(postId, { fields: 'id,favoritedBy' });
  let favoritedBy = post.favoritedBy || [];
  
  if (isBookmarked) {
    favoritedBy = favoritedBy.filter(id => id !== userId);
  } else {
    if (!favoritedBy.includes(userId)) {
      favoritedBy = [...favoritedBy, userId];
    }
  }
  const cleanArray = [...new Set(favoritedBy)];
  await pb.collection('cplayz_posts').update(postId, { favoritedBy: cleanArray }, { fields: 'id' });
}

export async function addView(postId, userId) {
  const post = await pb.collection('cplayz_posts').getOne(postId, { fields: 'id,viewedBy,userId' });
  const viewedBy = post.viewedBy || [];
  if (!viewedBy.includes(userId) && post.userId !== userId) {
    const updatedViewedBy = [...new Set([...viewedBy, userId])];
    await pb.collection('cplayz_posts').update(postId, { viewedBy: updatedViewedBy }, { fields: 'id' });
  }
}

export async function addComment(postId, userId, text, postOwnerId) {
  await pb.collection('cplayz_comments').create({
    postId,
    userId,
    text,
  });
  if (postOwnerId && postOwnerId !== userId) {
    await pb.collection('cplayz_notifications').create({
      recipientId: postOwnerId,
      senderId: userId,
      type: 'comment',
      postId,
      read: false,
    }).catch(() => {});
  }
}

export async function followUser(followerId, followingId) {
  await pb.collection('cplayz_follows').create({
    followerId,
    followingId,
  });
  await pb.collection('cplayz_notifications').create({
    recipientId: followingId,
    senderId: followerId,
    type: 'follow',
    postId: '',
    read: false,
  }).catch(() => {});
}

export async function unfollowUser(followerId, followingId) {
  try {
    const result = await pb.collection('cplayz_follows').getList(1, 1, {
      filter: `followerId="${followerId}" && followingId="${followingId}"`
    });
    if (result.items.length > 0) {
      await pb.collection('cplayz_follows').delete(result.items[0].id);
    }
  } catch (err) {
    console.error('Unfollow error:', err);
  }
}

export async function updateProfile(uid, data) {
  await pb.collection('cplayz_users').update(uid, data);
}

export async function markNotificationRead(notifId) {
  await pb.collection('cplayz_notifications').update(notifId, { read: true });
}

/* ─── Comment Count Helper ─── */
export async function getCommentCounts(posts) {
  const counts = {};
  if (!posts || posts.length === 0) return counts;
  
  try {
    const result = await pb.collection('cplayz_comments').getList(1, 5000);
    const allComments = result.items;
    
    for (const post of posts) {
      const validComments = allComments.filter(c => c.postId === post.id);
      counts[post.id] = validComments.length;
    }
  } catch (err) {
    console.error('getCommentCounts error:', err);
    for (const post of posts) counts[post.id] = 0;
  }
  return counts;
}
