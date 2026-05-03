const host = 'http://127.0.0.1:8090';

async function cleanup() {
  console.log('Fetching users to find TestUser2...');
  
  try {
    // 1. Find TestUser2
    const usersRes = await fetch(`${host}/api/collections/cplayz_users/records`);
    const usersData = await usersRes.json();
    const testUser = usersData.items.find(u => u.displayName === 'TestUser2');
    
    if (!testUser) {
      console.log('TestUser2 not found.');
      return;
    }
    
    console.log(`Found TestUser2 with ID: ${testUser.id}`);
    
    // 2. Find their posts
    const postsRes = await fetch(`${host}/api/collections/cplayz_posts/records?filter=userId="${testUser.id}"`);
    const postsData = await postsRes.json();
    
    if (postsData.items && postsData.items.length > 0) {
      for (const post of postsData.items) {
        console.log(`Deleting post: ${post.id}`);
        await fetch(`${host}/api/collections/cplayz_posts/records/${post.id}`, { method: 'DELETE' });
      }
    } else {
      console.log('No posts found for TestUser2.');
    }
    
    // 3. Delete the user (optional, but keeps it clean)
    console.log(`Deleting user: ${testUser.id}`);
    await fetch(`${host}/api/collections/cplayz_users/records/${testUser.id}`, { method: 'DELETE' });
    
    console.log('Cleanup complete!');
  } catch (err) {
    console.error('Error during cleanup:', err.message);
  }
}

cleanup();
