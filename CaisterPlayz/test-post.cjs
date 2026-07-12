const PocketBase = require('pocketbase/cjs');

(async () => {
  const pb = new PocketBase('https://caisterplayz-caisterplayz-backend.hf.space');
  try {
    const authData = await pb.admins.authWithPassword('caister062@gmail.com', 'Caister2025!');
    
    // Attempt to create a post to see the error
    const post = await pb.collection('cplayz_posts').create({
      userId: "000000000000001",
      text: "Test post from script",
      type: "post",
      likedBy: [],
      viewedBy: [],
      repostedBy: [],
      favoritedBy: []
    });
    console.log("Success:", post);
  } catch (err) {
    console.error("Error creating post:", err.status, err.response);
  }
})();
