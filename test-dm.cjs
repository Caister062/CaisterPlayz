const PocketBase = require('pocketbase/cjs');

(async () => {
  const pb = new PocketBase('https://caisterplayz-caisterplayz-backend.hf.space');
  try {
    const username = 'testuser_' + Date.now();
    const email = username + '@example.com';
    
    // Create user 1
    console.log("Creating user 1...");
    const user1 = await pb.collection('users').create({
      username: username,
      email: email,
      password: 'password123',
      passwordConfirm: 'password123',
      displayName: username,
      handle: username,
      isOnline: true
    });
    
    // Create user 2
    console.log("Creating user 2...");
    const username2 = 'testuser2_' + Date.now();
    const user2 = await pb.collection('users').create({
      username: username2,
      email: username2 + '@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      displayName: username2,
      handle: username2,
      isOnline: true
    });
    
    // Auth as user 1
    console.log("Authenticating as user 1...");
    await pb.collection('users').authWithPassword(email, 'password123');
    
    // Send DM
    console.log("Sending DM...");
    const msg = await pb.collection('cplayz_messages').create({
      senderId: user1.id,
      recipientId: user2.id,
      text: 'hi',
      imageUrl: '',
      read: false,
      squadId: ''
    }, {
      headers: { 'X-User-Id': user1.id }
    });
    
    console.log("DM sent successfully:", msg.id);
  } catch (err) {
    console.error("Error:", err.status, err.message, err.response);
  }
})();
