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
        setUser(existing.items[0]);
      } else {
        const newUser = await pb.collection('cplayz_users').create({
          displayName: `User_${deviceId.slice(4, 10)}`,
          bio: '',
          website: '',
          avatarUrl: '',
          deviceId: deviceId,
        });
        setUser(newUser);
      }
    } catch (err) {
      console.error('Auth init error:', err);
      setError(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return { user, loading, error, retry: init };
}

/* ─── User Profile Hook (real-time) ─── */
export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!userId) return;
    pb.collection('cplayz_users').getOne(userId).then(setProfile).catch(() => {});
    const interval = setInterval(() => {
      pb.collection('cplayz_users').getOne(userId).then(setProfile).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return profile;
}

/* ─── All Posts Hook (real-time) ─── */
export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const result = await pb.collection('cplayz_posts').getList(1, 100, {
        sort: '-id',
      });
      setPosts(result.items);
    } catch (err) {
      console.error('Fetch posts error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => {
      fetchPosts();
    }, 30000);
    
    window.addEventListener('refreshPosts', fetchPosts);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshPosts', fetchPosts);
    };
  }, [fetchPosts]);

  return { posts, loading, refresh: fetchPosts };
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
    if (!postId) { setComments([]); return; }
    fetchComments();
    const interval = setInterval(() => {
      fetchComments();
    }, 30000);
    
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

      // Auto-hide notifications older than 15 seconds (filter client-side)
      const now = new Date();
      const recentNotifs = notifs.filter(notif => {
        const created = new Date((notif.created || '').replace(' ', 'T'));
        const ageSec = (now - created) / 1000;
        if (ageSec > 15) {
          // Try to clean up from DB silently (may fail due to permissions)
          pb.collection('cplayz_notifications').delete(notif.id).catch(() => {});
          return false;
        }
        return true;
      });

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

    // Poll as fallback
    const interval = setInterval(fetchNotifications, 30000);

    // Real-time subscription for instant notifications
    let unsubscribe = null;
    pb.collection('cplayz_notifications').subscribe('*', (e) => {
      if (e.record?.recipientId === userId) {
        fetchNotifications();
      }
    }).then(unsub => { unsubscribe = unsub; }).catch(() => {});

    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
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
    const interval = setInterval(() => {
      fetchFollows();
    }, 30000);
    return () => clearInterval(interval);
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
    const interval = setInterval(() => {
      fetchUsers();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  return users;
}

/* ─── New User Join Alert Hook ─── */
export function useNewUserAlert(users, currentUserId) {
  const [newUserAlert, setNewUserAlert] = useState(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (!users || users.length === 0) return;

    if (prevCountRef.current === 0) {
      prevCountRef.current = users.length;
      return;
    }

    if (users.length > prevCountRef.current) {
      const newest = users[0];
      if (newest && newest.id !== currentUserId) {
        setNewUserAlert(newest);
        setTimeout(() => setNewUserAlert(null), 15000);
      }
    }
    prevCountRef.current = users.length;
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
    const interval = setInterval(() => {
      fetchAllFollows();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAllFollows]);

  return allFollows;
}

/* ═══════════════════════════════════════════
   Firestore-style Actions (PocketBase)
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
  try {
    await pb.collection('cplayz_posts').delete(postId, {
      headers: { 'x-user-id': userId }
    });
  } catch (err) {
    console.error('Delete post error:', err);
    throw err;
  }
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
        });
      }
    }
  }
  likedBy = [...new Set(likedBy)];
  await pb.collection('cplayz_posts').update(postId, { likedBy }, { fields: 'id' });
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
        });
      }
    }
  }
  repostedBy = [...new Set(repostedBy)];
  await pb.collection('cplayz_posts').update(postId, { repostedBy }, { fields: 'id' });
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
  favoritedBy = [...new Set(favoritedBy)];
  await pb.collection('cplayz_posts').update(postId, { favoritedBy }, { fields: 'id' });
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
    });
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
  });
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
  try {
    const result = await pb.collection('cplayz_comments').getList(1, 5000);
    const allComments = result.items;
    
    for (const post of posts) {
      // Count ALL comments so the displayed number matches what users see in the comment list
      const validComments = allComments.filter(c => c.postId === post.id);
      counts[post.id] = validComments.length;
    }
  } catch (err) {
    console.error('getCommentCounts error:', err);
    for (const post of posts) counts[post.id] = 0;
  }
  return counts;
}
