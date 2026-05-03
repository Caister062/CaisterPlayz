/**
 * PocketBase Collection Setup Script (v0.26+)
 * Uses -id sorting (PocketBase IDs are time-ordered) instead of autodate fields.
 */

const POCKETBASE_URL = 'http://127.0.0.1:8090';

async function setup() {
  const adminEmail = process.argv[2] || 'admin@caisterplayz.local';
  const adminPass = process.argv[3] || 'adminpassword123';

  console.log('🔧 Setting up CaisterPlayz collections...');

  let token;
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: adminEmail, password: adminPass })
    });
    if (!res.ok) throw new Error(await res.text());
    token = (await res.json()).token;
    console.log('✅ Authenticated');
  } catch (err) {
    console.error('❌ Auth failed:', err.message);
    process.exit(1);
  }

  const headers = { 'Content-Type': 'application/json', 'Authorization': token };

  // Delete existing
  for (const name of ['cplayz_follows', 'cplayz_notifications', 'cplayz_comments', 'cplayz_posts', 'cplayz_users']) {
    try { await fetch(`${POCKETBASE_URL}/api/collections/${name}`, { method: 'DELETE', headers }); } catch {}
  }

  async function create(schema) {
    const res = await fetch(`${POCKETBASE_URL}/api/collections`, { method: 'POST', headers, body: JSON.stringify(schema) });
    const data = await res.json();
    console.log(res.ok ? `  ✅ ${schema.name}` : `  ❌ ${schema.name}: ${JSON.stringify(data)}`);
  }

  await create({
    name: 'cplayz_users', type: 'base',
    fields: [
      { name: 'displayName', type: 'text', required: true },
      { name: 'bio', type: 'text' },
      { name: 'website', type: 'text' },
      { name: 'avatarUrl', type: 'text' },
      { name: 'deviceId', type: 'text' },
    ],
    listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: null,
  });

  await create({
    name: 'cplayz_posts', type: 'base',
    fields: [
      { name: 'userId', type: 'text', required: true },
      { name: 'text', type: 'text' },
      { name: 'imageUrl', type: 'text' },
      { name: 'likedBy', type: 'json' },
      { name: 'viewedBy', type: 'json' },
      { name: 'repostedBy', type: 'json' },
      { name: 'favoritedBy', type: 'json' },
      { name: 'type', type: 'text' },
      { name: 'originalPostId', type: 'text' },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ],
    listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: '',
  });

  await create({
    name: 'cplayz_comments', type: 'base',
    fields: [
      { name: 'postId', type: 'text', required: true },
      { name: 'userId', type: 'text', required: true },
      { name: 'text', type: 'text', required: true },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ],
    listRule: '', viewRule: '', createRule: '', updateRule: null, deleteRule: null,
  });

  await create({
    name: 'cplayz_notifications', type: 'base',
    fields: [
      { name: 'recipientId', type: 'text', required: true },
      { name: 'senderId', type: 'text', required: true },
      { name: 'type', type: 'text', required: true },
      { name: 'postId', type: 'text' },
      { name: 'read', type: 'bool' },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ],
    listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: null,
  });

  await create({
    name: 'cplayz_follows', type: 'base',
    fields: [
      { name: 'followerId', type: 'text', required: true },
      { name: 'followingId', type: 'text', required: true },
    ],
    listRule: '', viewRule: '', createRule: '', updateRule: null, deleteRule: '',
  });

  console.log('\n🎉 Done! App: http://192.168.2.192:5173/');
}

setup();
