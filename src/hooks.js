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

function uniqueList(values) {
  return [...new Set((values || []).filter(Boolean))];
}

async function togglePostListField(postId, userId, fieldName, isActive) {
  const post = await pb.collection('cplayz_posts').getOne(postId);
  let values = post[fieldName] || [];

  values = isActive
    ? values.filter(id => id !== userId)
    : uniqueList([...values, userId]);

  await pb.collection('cplayz_posts').update(postId, { [fieldName]: values });
}

export async function createPost(
  userId,
  text,
  imageUrl = '',
  musicId = '',
  musicName = '',
  originalPostId = '',
  type = 'post',
  communityId = ''
) {
  const data = {
    userId,
    text: text || '',
    imageUrl,
    likedBy: [],
    viewedBy: [],
    repostedBy: [],
    favoritedBy: [],
    type,
    originalPostId,
    musicId,
    musicName,
  };

  if (communityId) data.communityId = communityId;

  return pb.collection('cplayz_posts').create(data);
}

export async function toggleLike(postId, userId, isLiked) {
  return togglePostListField(postId, userId, 'likedBy', isLiked);
}

export async function toggleRepost(postId, userId, isReposted) {
  return togglePostListField(postId, userId, 'repostedBy', isReposted);
}

export async function toggleBookmark(postId, userId, isBookmarked) {
  return togglePostListField(postId, userId, 'favoritedBy', isBookmarked);
}

export async function addView(postId, userId) {
  const post = await pb.collection('cplayz_posts').getOne(postId);
  const viewedBy = uniqueList([...(post.viewedBy || []), userId]);
  return pb.collection('cplayz_posts').update(postId, { viewedBy });
}

export async function deletePost(postId, userId) {
  return pb.collection('cplayz_posts').delete(postId, {
    headers: { x_user_id: userId }
  });
}

export async function addComment(postId, userId, text) {
  return pb.collection('cplayz_comments').create({
    postId,
    userId,
    text
  });
}

export async function deleteComment(commentId, userId) {
  return pb.collection('cplayz_comments').delete(commentId, {
    headers: { x_user_id: userId }
  });
}

export function useFollows(userId) {
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);

  const fetchFollows = useCallback(async () => {
    if (!userId) return;

    try {
      const [followingRes, followersRes] = await Promise.all([
        pb.collection('cplayz_follows').getList(1, 200, {
          filter: `followerId="${userId}"`
        }),
        pb.collection('cplayz_follows').getList(1, 200, {
          filter: `followingId="${userId}"`
        })
      ]);

      setFollowing(followingRes.items);
      setFollowers(followersRes.items);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    fetchFollows();
  }, [fetchFollows]);

  return { following, followers, refresh: fetchFollows };
}

export async function followUser(followerId, followingId) {
  if (!followerId || !followingId || followerId === followingId) return null;

  const existing = await pb.collection('cplayz_follows').getList(1, 1, {
    filter: `followerId="${followerId}" && followingId="${followingId}"`
  });

  if (existing.items.length) return existing.items[0];

  return pb.collection('cplayz_follows').create(
    { followerId, followingId },
    { headers: { x_user_id: followerId } }
  );
}

export async function unfollowUser(followerId, followingId) {
  const existing = await pb.collection('cplayz_follows').getList(1, 1, {
    filter: `followerId="${followerId}" && followingId="${followingId}"`
  });

  if (!existing.items.length) return;

  return pb.collection('cplayz_follows').delete(existing.items[0].id, {
    headers: { x_user_id: followerId }
  });
}

export async function updateProfile(userId, data) {
  return pb.collection('cplayz_users').update(userId, data);
}

export async function markNotificationRead(notificationId) {
  return pb.collection('cplayz_notifications').update(notificationId, {
    read: true
  });
}

export function useDirectMessages(currentUserId, recipientId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!currentUserId || !recipientId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      const res = await pb.collection('cplayz_messages').getList(1, 200, {
        filter: `(senderId="${currentUserId}" && recipientId="${recipientId}") || (senderId="${recipientId}" && recipientId="${currentUserId}")`,
        sort: 'created',
        headers: { x_user_id: currentUserId }
      });

      setMessages(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, recipientId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, refresh: fetchMessages };
}

export function useDMThreads(currentUserId) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchThreads = useCallback(async () => {
    if (!currentUserId) {
      setThreads([]);
      return;
    }

    setLoading(true);
    try {
      const res = await pb.collection('cplayz_messages').getList(1, 200, {
        filter: `senderId="${currentUserId}" || recipientId="${currentUserId}"`,
        sort: '-created',
        headers: { x_user_id: currentUserId }
      });

      const byUser = new Map();
      for (const message of res.items) {
        const otherId = message.senderId === currentUserId
          ? message.recipientId
          : message.senderId;

        if (!byUser.has(otherId)) {
          byUser.set(otherId, {
            userId: otherId,
            lastMessage: message
          });
        }
      }

      setThreads([...byUser.values()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return { threads, loading, refresh: fetchThreads };
}

export async function sendMessage(senderId, recipientId, text, imageUrl = '') {
  return pb.collection('cplayz_messages').create(
    {
      senderId,
      recipientId,
      text,
      imageUrl,
      read: false
    },
    { headers: { x_user_id: senderId } }
  );
}
