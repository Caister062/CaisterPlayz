import PocketBase from 'pocketbase';
const pb = new PocketBase('https://caisterplayz-caisterplayz-backend.hf.space');
await pb.admins.authWithPassword('caismoretton@gmail.com', 'NewStrongPassword123');
const users = await pb.collection('users').getFullList({ filter: 'displayName = ""' });
console.log('Users with empty display name:', users.length, users.map(u => u.id));
