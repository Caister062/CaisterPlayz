async function test() {
  // Simulate what the app does
  const host = 'localhost';
  const url = `http://${host}:8090`;
  
  console.log('Testing PocketBase at:', url);
  
  // Test 1: List users
  try {
    const res = await fetch(`${url}/api/collections/cplayz_users/records`);
    const data = await res.json();
    console.log('GET cplayz_users:', res.status, data.items?.length || 0, 'items');
  } catch(e) { console.error('GET users:', e.message); }
  
  // Test 2: Create user
  try {
    const res = await fetch(`${url}/api/collections/cplayz_users/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: 'TestUser2', bio: '', website: '', avatarUrl: '', deviceId: 'test_xyz' })
    });
    const data = await res.json();
    console.log('CREATE user:', res.status, data.id || JSON.stringify(data));
    
    // Test 3: Create post with that user
    if (data.id) {
      const postRes = await fetch(`${url}/api/collections/cplayz_posts/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.id, text: 'Hello from test script!', imageUrl: '', likedBy: [], viewedBy: [], repostedBy: [], favoritedBy: [] })
      });
      const postData = await postRes.json();
      console.log('CREATE post:', postRes.status, postData.id || JSON.stringify(postData));
    }
  } catch(e) { console.error('CREATE:', e.message); }
  
  // Test 4: List posts with sort
  try {
    const res = await fetch(`${url}/api/collections/cplayz_posts/records?sort=-id&perPage=10`);
    const data = await res.json();
    console.log('GET posts (sort -id):', res.status, data.items?.length || 0, 'items');
    if (data.items?.[0]) console.log('First post:', JSON.stringify(data.items[0], null, 2));
  } catch(e) { console.error('GET posts:', e.message); }
}
test();
