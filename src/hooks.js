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

  const syncUserProfile = useCallback(async (authRecord) => {
    let profileRecord = null;
  
    try {
      const existing = await pb.collection('cplayz_users').getList(1, 1, {
        filter: `deviceId="pb_${authRecord.id}"`
      });
  
      if (existing.items.length > 0) {
        profileRecord = existing.items[0];
      } else {
        profileRecord = await pb.collection('cplayz_users').create({
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
    } catch (err) {
      console.error('Failed to sync user profile:', err);
      console.error('Error data:', err?.data);
      alert(JSON.stringify(err?.data, null, 2));
      throw err;
    }

  localStorage.setItem('cplayz_user_id', profileRecord.id);
  setUser(profileRecord);
  return profileRecord;
}, []);

  const loginAsGuest = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      localStorage.setItem('cplayz_is_guest', 'true');
      const deviceId = getDeviceId();
      let existing = null;
      try {
        const list = await pb.collection('cplayz_users').getList(1, 1, {
          filter: `deviceId="${deviceId}"`
        });
        if (list.items.length > 0) {
          existing = list.items[0];
        }
      } catch (err) {
        console.error('Guest query error:', err);
      }

      if (existing) {
        localStorage.setItem('cplayz_user_id', existing.id);
        setUser(existing);
      } else {
        const newUser = await pb.collection('cplayz_users').create({
          displayName: `Guest_${deviceId.slice(4, 10)}`,
          bio: '',
          website: '',
          avatarUrl: '',
          deviceId: deviceId,
        });
        localStorage.setItem('cplayz_user_id', newUser.id);
        setUser(newUser);
      }
    } catch (err) {
      setError(err.message || 'Guest login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      localStorage.removeItem('cplayz_is_guest');
      const authData = await pb.collection('users').authWithPassword(email, password);
      return await syncUserProfile(authData.record);
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email, password, username) => {
    try {
      setError(null);
      setLoading(true);
      localStorage.removeItem('cplayz_is_guest');
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name: username,
      });
      const authData = await pb.collection('users').authWithPassword(email, password);
      return await syncUserProfile(authData.record);
    } catch (err) {
      console.error("SIGNUP ERROR:", err);
      console.error("SIGNUP RESPONSE:", err.response);
    
      alert(JSON.stringify(err.response, null, 2));
    
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      localStorage.removeItem('cplayz_is_guest');
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
      return await syncUserProfile(authData.record);
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      console.error("LOGIN RESPONSE:", err.response);
    
      alert(JSON.stringify(err.response, null, 2));
    
      throw err;
    }
  };

  const logout = useCallback(async () => {
    try {
      await pb.realtime.unsubscribe();
    } catch (e) {
      console.log(e);
    }
  
    pb.authStore.clear();
    localStorage.removeItem('cplayz_is_guest');
    localStorage.removeItem('cplayz_user_id');
    setUser(null);
  }, []);

  const init = useCallback(async () => {
    try {
      setError(null);
      if (pb.authStore.isValid && pb.authStore.model) {
        await syncUserProfile(pb.authStore.model);
      } else if (localStorage.getItem('cplayz_is_guest') === 'true') {
        await loginAsGuest();
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth init error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [syncUserProfile, loginAsGuest]);

  useEffect(() => {
    init();
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (model) {
        syncUserProfile(model);
      } else if (localStorage.getItem('cplayz_is_guest') !== 'true') {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [init, syncUserProfile]);

  return {
    user,
    loading,
    error,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    loginAsGuest,
    logout,
    retry: init
  };
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

/* ─── Direct Messages Hooks ─── */
export function useDirectMessages(currentUserId, recipientId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!currentUserId || !recipientId) return;
    setLoading(true);
    try {
      const result = await pb.collection('cplayz_messages').getList(1, 200, {
        filter: `(senderId="${currentUserId}" && recipientId="${recipientId}") || (senderId="${recipientId}" && recipientId="${currentUserId}")`,
        sort: 'created',
      });
      setMessages(result.items);
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, recipientId]);

  useEffect(() => {
    if (!currentUserId || !recipientId) {
      setMessages([]);
      return;
    }

    fetchMessages();

    let unsubscribeFn = null;
    pb.collection('cplayz_messages').subscribe('*', (e) => {
      const msg = e.record;
      if (
        (msg.senderId === currentUserId && msg.recipientId === recipientId) ||
        (msg.senderId === recipientId && msg.recipientId === currentUserId)
      ) {
        if (e.action === 'create') {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        } else if (e.action === 'delete') {
          setMessages(prev => prev.filter(m => m.id !== msg.id));
        } else if (e.action === 'update') {
          setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
        }
      }
    }).then(unsub => {
      unsubscribeFn = unsub;
    }).catch(err => {
      console.error('useDirectMessages subscribe error:', err);
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [currentUserId, recipientId, fetchMessages]);

  return { messages, loading, refreshMessages: fetchMessages };
}

export async function sendMessage(senderId, recipientId, text, imageUrl = '') {
  return await pb.collection('cplayz_messages').create({
    senderId,
    recipientId,
    text,
    imageUrl,
    read: false,
  });
}

export function useDMThreads(currentUserId) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchThreads = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const result = await pb.collection('cplayz_messages').getList(1, 500, {
        filter: `senderId="${currentUserId}" || recipientId="${currentUserId}"`,
        sort: '-created',
      });
      
      const userMap = {};
      result.items.forEach(msg => {
        const otherId = msg.senderId === currentUserId ? msg.recipientId : msg.senderId;
        if (!userMap[otherId] || new Date(msg.created) > new Date(userMap[otherId].lastMessage.created)) {
          userMap[otherId] = {
            userId: otherId,
            lastMessage: msg,
          };
        }
      });
      
      setThreads(Object.values(userMap).sort((a, b) => new Date(b.lastMessage.created) - new Date(a.lastMessage.created)));
    } catch (err) {
      console.error('Fetch threads error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      setThreads([]);
      return;
    }

    fetchThreads();

    let unsubscribeFn = null;
    pb.collection('cplayz_messages').subscribe('*', (e) => {
      const msg = e.record;
      if (msg.senderId === currentUserId || msg.recipientId === currentUserId) {
        fetchThreads();
      }
    }).then(unsub => {
      unsubscribeFn = unsub;
    }).catch(err => {
      console.error('useDMThreads subscribe error:', err);
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [currentUserId, fetchThreads]);

  return { threads, loading, refreshThreads: fetchThreads };
}

/* ═══════════════════════════════════════════
    PocketBase Engine Write Actions
   ═══════════════════════════════════════════ */

export async function createPost(userId, text, imageUrl = '', musicId = '', musicName = '', originalPostId = '', type = '', communityId = '') {
  const post = await pb.collection('cplayz_posts').create({
    userId,
    text,
    imageUrl,
    musicId,
    musicName,
    originalPostId,
    type,
    communityId,
    likedBy: [],
    viewedBy: [],
    repostedBy: [],
    favoritedBy: [],
  }, { fields: 'id' });

  // 1. Mentions detection: Scan text for @username pattern
  const mentions = text.match(/@([a-zA-Z0-9_]+)/g);
  if (mentions) {
    const uniqueMentions = [...new Set(mentions.map(m => m.slice(1).toLowerCase()))];
    for (const username of uniqueMentions) {
      try {
        // Find user by displayName
        const usersList = await pb.collection('cplayz_users').getList(1, 1, {
          filter: `displayName.toLowerCase()="${username}"`
        });
        if (usersList.items.length > 0) {
          const mentionedUser = usersList.items[0];
          if (mentionedUser.userId !== userId) {
            await pb.collection('cplayz_notifications').create({
              recipientId: mentionedUser.userId,
              senderId: userId,
              type: 'mention',
              postId: post.id,
              read: false,
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Mention processing error:', err);
      }
    }
  }

  // 2. Post Alerts: Find followers and create 'post' notifications
  try {
    const followsResult = await pb.collection('cplayz_follows').getList(1, 1000, {
      filter: `followingId="${userId}"`
    });
    for (const follow of followsResult.items) {
      await pb.collection('cplayz_notifications').create({
        recipientId: follow.followerId,
        senderId: userId,
        type: 'post',
        postId: post.id,
        read: false,
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Post alert notifications error:', err);
  }
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

export async function deleteComment(commentId, userId) {
  // Verify ownership first
  const comment = await pb.collection('cplayz_comments').getOne(commentId, {
    fields: 'id,userId'
  });
  if (comment.userId !== userId) {
    throw new Error('Not authorized to delete this comment');
  }
  await pb.collection('cplayz_comments').delete(commentId);
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

/* ─── Communities Hooks ─── */
export function useCommunities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const result = await pb.collection('cplayz_communities').getList(1, 100, {
        sort: '-created',
      });
      setCommunities(result.items);
    } catch (err) {
      console.error('useCommunities error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
    
    // Subscribe to communities changes
    let unsubscribeFn = null;
    pb.collection('cplayz_communities').subscribe('*', () => {
      fetchCommunities();
    }).then(unsub => {
      unsubscribeFn = unsub;
    }).catch(err => console.error('useCommunities subscribe error:', err));

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [fetchCommunities]);

  return { communities, loading, refreshCommunities: fetchCommunities };
}

export async function createCommunity(name, description, avatarUrl, userId) {
  return await pb.collection('cplayz_communities').create({
    name,
    description,
    avatarUrl,
    createdBy: userId,
    members: [userId],
  });
}

export async function joinCommunity(communityId, userId) {
  console.log("communityId =", communityId);

  const comm = await pb.collection('cplayz_communities').getOne(communityId);
  console.log("Found community:", comm);

  let members = Array.isArray(comm.members) ? [...comm.members] : [];

  if (members.includes(userId)) {
    members = members.filter(id => id !== userId);
  } else {
    members.push(userId);
  }

  console.log("Updating members:", members);

  try {
    const result = await pb.collection('cplayz_communities').update(
      communityId,
      { members }
    );

    console.log("Update success:", result);
    return result;
  } catch (err) {
    console.error("UPDATE FAILED");
    console.error(err);
    console.error(err?.response);

    alert(JSON.stringify(err?.response, null, 2));

    throw err;
  }
}
