// src/actions.js
import pb from './pocketbase';

/* ─────────────────────────────
   POSTS ACTIONS
───────────────────────────── */

export async function toggleLike(postId, userId, isLiked) {
  const post = await pb.collection('cplayz_posts').getOne(postId);

  let likedBy = post.likedBy || [];

  likedBy = isLiked
    ? likedBy.filter(id => id !== userId)
    : [...new Set([...likedBy, userId])];

  await pb.collection('cplayz_posts').update(postId, {
    likedBy
  });
}

export async function toggleRepost(postId, userId, isReposted) {
  const post = await pb.collection('cplayz_posts').getOne(postId);

  let repostedBy = post.repostedBy || [];

  repostedBy = isReposted
    ? repostedBy.filter(id => id !== userId)
    : [...new Set([...repostedBy, userId])];

  await pb.collection('cplayz_posts').update(postId, {
    repostedBy
  });
}

export async function toggleBookmark(postId, userId, isBookmarked) {
  const post = await pb.collection('cplayz_posts').getOne(postId);

  let favoritedBy = post.favoritedBy || [];

  favoritedBy = isBookmarked
    ? favoritedBy.filter(id => id !== userId)
    : [...new Set([...favoritedBy, userId])];

  await pb.collection('cplayz_posts').update(postId, {
    favoritedBy
  });
}

export async function addView(postId, userId) {
  const post = await pb.collection('cplayz_posts').getOne(postId);

  let viewedBy = post.viewedBy || [];

  if (!viewedBy.includes(userId) && post.userId !== userId) {
    viewedBy = [...new Set([...viewedBy, userId])];

    await pb.collection('cplayz_posts').update(postId, {
      viewedBy
    });
  }
}

export async function deletePost(postId, userId) {
  const post = await pb.collection('cplayz_posts').getOne(postId);

  if (post.userId !== userId) {
    throw new Error('Not authorized');
  }

  await pb.collection('cplayz_posts').delete(postId);
}

export async function deleteComment(commentId, userId) {
  const comment = await pb.collection('cplayz_comments').getOne(commentId);

  if (comment.userId !== userId) {
    throw new Error('Not authorized');
  }

  await pb.collection('cplayz_comments').delete(commentId);
}

export async function addComment(postId, userId, text) {
  await pb.collection('cplayz_comments').create({
    postId,
    userId,
    text
  });
}
