import { useState, useEffect, useCallback, useRef } from 'react';
import pb from './pocketbase';

/* ─────────────────────────────
   DEVICE / GUEST AUTH
───────────────────────────── */
function getDeviceId() {
  let id = localStorage.getItem('cplayz_device_id');
  if (!id) {
    const uuid = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2);
    id = 'dev_' + uuid;
    localStorage.setItem('cplayz_device_id', id);
  }
  return id;
}

export async function ensureGuestUser() {
  const existing = localStorage.getItem('cplayz_user_id');
  if (existing) {
    try {
      const profile = await pb.collection('cplayz_users').getOne(existing);
      return profile;
    } catch {
      localStorage.removeItem('cplayz_user_id');
    }
  }
  const deviceId = getDeviceId();
  const list = await pb.collection('cplayz_users').getList(1, 1, {
    filter: `deviceId="${deviceId}"`
  });
  let user;
  if (list.items.length > 0) {
    user = list.items[0];
  } else {
    user = await pb.collection('cplayz_users').create({
      displayName: `Player_${deviceId.slice(4, 10)}`,
      bio: '',
      deviceId,
    });
  }
  localStorage.setItem('cplayz_user_id', user.id);
  return user;
}

/* ─────────────────────────────
   REALTIME POSTS
───────────────────────────── */
export function useRealtimePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const subRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const res = await pb.collection('cplayz_posts').getList(1, 50, {
        sort: '-created',
        filter: 'type != "system_config"'
      });
      setPosts(res.items);
    } catch (err) {
      console.error('fetchPosts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    let unsub;
    (async () => {
      try {
        unsub = await pb.collection('cplayz_posts').subscribe('*', (e) => {
          if (e.record.type === 'system_config') return;
          if (e.action === 'create') {
            setPosts(prev => [e.record, ...prev]);
          } else if (e.action === 'update') {
            setPosts(prev => prev.map(p => p.id === e.record.id ? e.record : p));
          } else if (e.action === 'delete') {
            setPosts(prev => prev.filter(p => p.id !== e.record.id));
          }
        });
        subRef.current = unsub;
      } catch (err) {
        console.warn('Realtime subscription failed, falling back to polling', err);
        // Fallback: poll every 15s
        const interval = setInterval(fetchAll, 15000);
        subRef.current = () => clearInterval(interval);
      }
    })();

    const refreshHandler = () => fetchAll();
    window.addEventListener('refreshPosts', refreshHandler);

    return () => {
      window.removeEventListener('refreshPosts', refreshHandler);
      if (subRef.current) {
        try { subRef.current(); } catch {}
      }
    };
  }, [fetchAll]);

  return { posts, loading, refresh: fetchAll };
}

/* ─────────────────────────────
   SYSTEM CONFIG
───────────────────────────── */
export function useSystemConfig() {
  const [config, setConfig] = useState({ bannedWords: [], verifiedUsers: [], featuredPosts: [], lockdown: false });
  const [configId, setConfigId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await pb.collection('cplayz_posts').getList(1, 1, { filter: 'type="system_config"' });
        if (res.items.length > 0) {
          const rec = res.items[0];
          setConfigId(rec.id);
          try {
            const parsed = JSON.parse(rec.text);
            setConfig(parsed);
          } catch(e) {}
        } else {
          // Create the config record if it doesn't exist. Admin only feature but we just create it as a global post.
          const userId = localStorage.getItem('cplayz_user_id');
          if (userId) {
            const newConf = await pb.collection('cplayz_posts').create({
              userId,
              type: 'system_config',
              text: JSON.stringify({ bannedWords: [], verifiedUsers: [], featuredPosts: [], lockdown: false })
            });
            setConfigId(newConf.id);
          }
        }
      } catch(e) {
        console.error('Config fetch failed:', e);
      }
    })();
  }, []);

  return { config, configId };
}

export async function updateSystemConfig(configId, newConfigObj) {
  if (!configId) return;
  await pb.collection('cplayz_posts').update(configId, { text: JSON.stringify(newConfigObj) });
}

/* ─────────────────────────────
   USERS
───────────────────────────── */
export function useAllUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await pb.collection('cplayz_users').getList(1, 200);
      setUsers(res.items);
    } catch (err) {
      console.error('fetchUsers:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    let unsub;
    (async () => {
      try {
        unsub = await pb.collection('cplayz_users').subscribe('*', (e) => {
          if (e.action === 'create') setUsers(prev => [...prev, e.record]);
          else if (e.action === 'update') setUsers(prev => prev.map(u => u.id === e.record.id ? e.record : u));
          else if (e.action === 'delete') setUsers(prev => prev.filter(u => u.id !== e.record.id));
        });
      } catch {}
    })();
    return () => { if (unsub) try { unsub(); } catch {} };
  }, [fetchUsers]);

  return users;
}

/* ─────────────────────────────
   USER PROFILE
───────────────────────────── */
export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await pb.collection('cplayz_users').getOne(userId);
      setProfile(res);
    } catch {}
  }, [userId]);
  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  return { profile, refresh: fetchProfile };
}

/* ─────────────────────────────
   COMMENTS (realtime)
───────────────────────────── */
export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      const res = await pb.collection('cplayz_comments').getList(1, 100, {
        filter: `postId="${postId}"`,
        sort: 'created'
      });
      setComments(res.items);
    } catch {}
  }, [postId]);

  useEffect(() => {
    if (!postId) return;
    fetchComments();
    let unsub;
    (async () => {
      try {
        unsub = await pb.collection('cplayz_comments').subscribe('*', (e) => {
          if (e.record.postId !== postId) return;
          if (e.action === 'create') setComments(prev => [...prev, e.record]);
          else if (e.action === 'delete') setComments(prev => prev.filter(c => c.id !== e.record.id));
        });
      } catch {}
    })();
    return () => { if (unsub) try { unsub(); } catch {} };
  }, [postId, fetchComments]);

  return { comments, refreshComments: fetchComments };
}

/* ─────────────────────────────
   NOTIFICATIONS (realtime)
───────────────────────────── */
export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await pb.collection('cplayz_notifications').getList(1, 50, {
        filter: `recipientId="${userId}"`,
        sort: '-created'
      });
      setNotifications(res.items);
    } catch {}
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    let unsub;
    (async () => {
      try {
        unsub = await pb.collection('cplayz_notifications').subscribe('*', (e) => {
          if (e.record.recipientId !== userId) return;
          if (e.action === 'create') setNotifications(prev => [e.record, ...prev]);
          else if (e.action === 'update') setNotifications(prev => prev.map(n => n.id === e.record.id ? e.record : n));
          else if (e.action === 'delete') setNotifications(prev => prev.filter(n => n.id !== e.record.id));
        });
      } catch {}
    })();
    return () => { if (unsub) try { unsub(); } catch {} };
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    refresh: fetchNotifications
  };
}

/* ─────────────────────────────
   FOLLOWS
───────────────────────────── */
export function useFollows(userId) {
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);

  const fetchFollows = useCallback(async () => {
    if (!userId) return;
    try {
      const [fr, fo] = await Promise.all([
        pb.collection('cplayz_follows').getList(1, 200, { filter: `followerId="${userId}"` }),
        pb.collection('cplayz_follows').getList(1, 200, { filter: `followingId="${userId}"` }),
      ]);
      setFollowing(fr.items);
      setFollowers(fo.items);
    } catch {}
  }, [userId]);

  useEffect(() => { fetchFollows(); }, [fetchFollows]);
  return { following, followers, refresh: fetchFollows };
}

/* ─────────────────────────────
   WRITE ACTIONS
───────────────────────────── */
function uniqueList(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

// Debounce helper to prevent spam
const pendingToggles = new Map();

async function debouncedToggle(key, fn, delay = 500) {
  if (pendingToggles.has(key)) return;
  pendingToggles.set(key, true);
  try {
    await fn();
  } finally {
    setTimeout(() => pendingToggles.delete(key), delay);
  }
}

export async function toggleLike(postId, userId, isLiked) {
  return debouncedToggle(`like:${postId}:${userId}`, async () => {
    const post = await pb.collection('cplayz_posts').getOne(postId);
    if (post.userId === userId) return; // Author can't zap their own post
    const likedBy = isLiked
      ? (post.likedBy || []).filter(id => id !== userId)
      : uniqueList([...(post.likedBy || []), userId]);
    await pb.collection('cplayz_posts').update(postId, { likedBy });
    if (!isLiked) sendNotification(post.userId, userId, 'like', postId);
  });
}

export async function toggleRepost(postId, userId, isReposted) {
  return debouncedToggle(`repost:${postId}:${userId}`, async () => {
    const post = await pb.collection('cplayz_posts').getOne(postId);
    if (post.userId === userId) return; // Author can't echo their own post
    const repostedBy = isReposted
      ? (post.repostedBy || []).filter(id => id !== userId)
      : uniqueList([...(post.repostedBy || []), userId]);
    await pb.collection('cplayz_posts').update(postId, { repostedBy });
    if (!isReposted) sendNotification(post.userId, userId, 'repost', postId);
  });
}

export async function toggleBookmark(postId, userId, isBookmarked) {
  return debouncedToggle(`bookmark:${postId}:${userId}`, async () => {
    const post = await pb.collection('cplayz_posts').getOne(postId);
    const favoritedBy = isBookmarked
      ? (post.favoritedBy || []).filter(id => id !== userId)
      : uniqueList([...(post.favoritedBy || []), userId]);
    await pb.collection('cplayz_posts').update(postId, { favoritedBy });
  });
}

export async function addView(postId, userId) {
  try {
    const post = await pb.collection('cplayz_posts').getOne(postId);
    if (post.userId === userId) return; // Author's actions (view, like, etc.) do not count as views
    if ((post.viewedBy || []).includes(userId)) return;
    const viewedBy = uniqueList([...(post.viewedBy || []), userId]);
    await pb.collection('cplayz_posts').update(postId, { viewedBy });
  } catch {}
}

export async function createPost(userId, text, imageUrl = '', communityId = '') {
  const data = {
    userId,
    text: text || '',
    imageUrl,
    likedBy: [],
    viewedBy: [],
    repostedBy: [],
    favoritedBy: [],
    type: 'post',
  };
  if (communityId) data.communityId = communityId;
  return pb.collection('cplayz_posts').create(data);
}

export async function deletePost(postId, userId) {
  const res = await fetch(`${pb.baseURL}/api/collections/cplayz_posts/records/${postId}`, {
    method: 'DELETE',
    headers: { 'X-User-Id': userId },
  });
  if (!res.ok && res.status !== 204) throw new Error('Delete failed: ' + res.status);
}

export async function addComment(postId, userId, text) {
  const c = await pb.collection('cplayz_comments').create({ postId, userId, text });
  pb.collection('cplayz_posts').getOne(postId).then(post => {
    if (post.userId !== userId) sendNotification(post.userId, userId, 'comment', postId);
  }).catch(()=>{});
  return c;
}

export async function deleteComment(commentId, userId) {
  const res = await fetch(`${pb.baseURL}/api/collections/cplayz_comments/records/${commentId}`, {
    method: 'DELETE',
    headers: { 'X-User-Id': userId },
  });
  if (!res.ok && res.status !== 204) throw new Error('Delete failed: ' + res.status);
}

export async function followUser(followerId, followingId) {
  if (!followerId || !followingId || followerId === followingId) return null;
  const existing = await pb.collection('cplayz_follows').getList(1, 1, {
    filter: `followerId="${followerId}" && followingId="${followingId}"`
  });
  if (existing.items.length) return existing.items[0];
  const f = await pb.collection('cplayz_follows').create({ followerId, followingId });
  sendNotification(followingId, followerId, 'follow', '');
  return f;
}

export async function unfollowUser(followerId, followingId) {
  const existing = await pb.collection('cplayz_follows').getList(1, 1, {
    filter: `followerId="${followerId}" && followingId="${followingId}"`
  });
  if (!existing.items.length) return;
  return pb.collection('cplayz_follows').delete(existing.items[0].id);
}

export async function updateProfile(userId, data) {
  return pb.collection('cplayz_users').update(userId, data);
}

export async function markNotificationRead(notificationId) {
  return pb.collection('cplayz_notifications').update(notificationId, { read: true });
}

export async function markAllNotificationsRead(userId) {
  try {
    const res = await pb.collection('cplayz_notifications').getList(1, 100, {
      filter: `recipientId="${userId}" && read=false`
    });
    await Promise.all(res.items.map(n =>
      pb.collection('cplayz_notifications').update(n.id, { read: true })
    ));
  } catch {}
}

export async function sendNotification(recipientId, senderId, type, targetId) {
  if (!recipientId || !senderId || recipientId === senderId) return;
  try {
    // Basic debounce check
    const recent = await pb.collection('cplayz_notifications').getList(1, 1, {
      filter: `recipientId="${recipientId}" && senderId="${senderId}" && type="${type}" && created >= @now-1h`
    });
    if (recent.items.length > 0) return;
    await pb.collection('cplayz_notifications').create({
      recipientId,
      senderId,
      type,
      targetId,
      read: false
    });
  } catch(e) {
    console.error('Notification failed:', e);
  }
}
