const PocketBase = require('pocketbase/cjs');

(async () => {
  const pb = new PocketBase('https://caisterplayz-caisterplayz-backend.hf.space');
  try {
    const username = 'testuser_' + Date.now();
    const email = username + '@example.com';
    
    // Create user
    console.log("Creating user...");
    const user = await pb.collection('users').create({
      username: username,
      email: email,
      password: 'password123',
      passwordConfirm: 'password123',
      displayName: username,
      handle: username,
      isOnline: true
    });
    
    // Auth
    console.log("Authenticating...");
    await pb.collection('users').authWithPassword(email, 'password123');
    
    // Post
    console.log("Creating post...");
    const post = await pb.collection('cplayz_posts').create({
      userId: user.id,
      text: 'Test post from script!',
      imageUrl: '',
      type: 'post',
      likedBy: [],
      viewedBy: [],
      repostedBy: [],
      favoritedBy: []
    });
    
    console.log("Post created successfully:", post.id);
  } catch (err) {
    console.error("Error:", err.status, err.message, err.response);
  }
})();
