import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
const adminEmail = 'admin@caisterplayz.local';
const adminPass = 'adminpassword123';

async function run() {
  try {
    await pb.admins.authWithPassword(adminEmail, adminPass);
    const users = await pb.collection('cplayz_users').getList(1, 10, { filter: 'displayName="User_053eb2"' });
    if (users.items.length > 0) {
      const targetUserId = users.items[0].id;
      const posts = await pb.collection('cplayz_posts').getList(1, 100, { filter: `userId="${targetUserId}"` });
      console.log('Found ' + posts.items.length + ' posts to delete.');
      for (const post of posts.items) {
        await pb.collection('cplayz_posts').delete(post.id);
        console.log('Deleted post:', post.text);
      }
      console.log('Done deleting!');
    } else {
      console.log('User_053eb2 not found.');
    }
  } catch(e) {
    console.error('Error:', e);
  }
}

run();
