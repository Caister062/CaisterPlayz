import { useState, useEffect, useRef, useCallback } from 'react';
import pb from './pocketbase';

/* ─────────────────────────────
   DEVICE AUTH
───────────────────────────── */

function getDeviceId() {
  let id = localStorage.getItem('cplayz_device_id');

  if (!id) {
    const uuid =
      typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2);

    id = 'dev_' + uuid;
    localStorage.setItem('cplayz_device_id', id);
  }

  return id;
}

/* ─────────────────────────────
   AUTH HOOK
───────────────────────────── */

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const syncUserProfile = useCallback(async (authRecord) => {
    try {
      const existing = await pb.collection('cplayz_users').getList(1, 1, {
        filter: `deviceId="pb_${authRecord.id}"`
      });

      let profile;

      if (existing.items.length > 0) {
        profile = existing.items[0];
      } else {
        profile = await pb.collection('cplayz_users').create({
          displayName:
            authRecord.name ||
            authRecord.username ||
            `User_${authRecord.id.slice(0, 6)}`,
          bio: '',
          website: '',
          avatarUrl: authRecord.avatar
            ? pb.files.getURL(authRecord, authRecord.avatar)
            : '',
          deviceId: `pb_${authRecord.id}`,
        });
      }

      localStorage.setItem('cplayz_user_id', profile.id);
      setUser(profile);
      return profile;
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    }
  }, []);

  const loginAsGuest = useCallback(async () => {
    try {
      setLoading(true);
      const deviceId = getDeviceId();

      const list = await pb.collection('cplayz_users').getList(1, 1, {
        filter: `deviceId="${deviceId}"`
      });

      let user;

      if (list.items.length > 0) {
        user = list.items[0];
      } else {
        user = await pb.collection('cplayz_users').create({
          displayName: `Guest_${deviceId.slice(4, 10)}`,
          deviceId
        });
      }

      localStorage.setItem('cplayz_user_id', user.id);
      setUser(user);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const authData = await pb
        .collection('users')
        .authWithOAuth2({ provider: 'google' });

      return syncUserProfile(authData.record);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    pb.authStore.clear();
    localStorage.removeItem('cplayz_user_id');
    setUser(null);
  }, []);

  const init = useCallback(async () => {
    try {
      setLoading(true);

      if (pb.authStore.isValid && pb.authStore.model) {
        await syncUserProfile(pb.authStore.model);
      } else if (localStorage.getItem('cplayz_is_guest') === 'true') {
        await loginAsGuest();
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [syncUserProfile, loginAsGuest]);

  useEffect(() => {
    init();

    const unsubscribe = pb.authStore.onChange((_, model) => {
      if (model) syncUserProfile(model);
      else setUser(null);
    });

    return () => unsubscribe();
  }, [init, syncUserProfile]);

  return {
    user,
    loading,
    error,
    loginAsGuest,
    loginWithGoogle,
    logout,
    retry: init
  };
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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return profile;
}

/* ─────────────────────────────
   POSTS HOOK (FIXED EXPORT)
───────────────────────────── */

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);

      const res = await pb.collection('cplayz_posts').getList(1, 15, {
        sort: '-id'
      });

      setPosts(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    refresh: fetchPosts
  };
}

/* ─────────────────────────────
   USERS HOOK (FIXED EXPORT)
───────────────────────────── */

export function useAllUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await pb.collection('cplayz_users').getList(1, 200);
      setUsers(res.items);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return users;
}

/* ─────────────────────────────
   COMMENTS
───────────────────────────── */

export function useComments(postId) {
  const [comments, setComments] = useState([]);

  const fetchComments = useCallback(async () => {
    if (!postId) return;

    try {
      const res = await pb.collection('cplayz_comments').getList(1, 200, {
        filter: `postId="${postId}"`
      });

      setComments(res.items);
    } catch {}
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, refreshComments: fetchComments };
}

/* ─────────────────────────────
   NOTIFICATIONS (SIMPLIFIED SAFE VERSION)
───────────────────────────── */

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await pb.collection('cplayz_notifications').getList(1, 50, {
        filter: `recipientId="${userId}"`,
        sort: '-id'
      });

      setNotifications(res.items);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length
  };
}

/* ─────────────────────────────
   WRITE ACTIONS
───────────────────────────── */

export async function toggleLike(postId, userId, isLiked) {
  const post = await pb.collection('cplayz_posts').getOne(postId);
  let likedBy = post.likedBy || [];

  likedBy = isLiked
    ? likedBy.filter(id => id !== userId)
    : [...new Set([...likedBy, userId])];

  await pb.collection('cplayz_posts').update(postId, { likedBy });
}

export async function addComment(postId, userId, text) {
  await pb.collection('cplayz_comments').create({
    postId,
    userId,
    text
  });
}
