/**
 * Creates cplayz_blocks and cplayz_reports collections on your PocketBase.
 * Run with: node create_collections.mjs
 * Enter your PocketBase admin password when prompted.
 */
import PocketBase from 'pocketbase';

const PB_URL = 'https://caisterplayz-caisterplayz-backend.hf.space';
const ADMIN_EMAIL = 'caismoretton@gmail.com';

// ── Get password from command-line argument or prompt ──
let password = process.argv[2];

if (!password) {
  // Read from stdin without external modules
  const { createInterface } = await import('readline');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await new Promise(resolve => {
    rl.question(`PocketBase admin password for ${ADMIN_EMAIL}: `, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

if (!password) {
  console.error('No password provided. Usage: node create_collections.mjs <password>');
  process.exit(1);
}

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

console.log(`\nConnecting to ${PB_URL}...`);

// Try both old and new admin auth APIs
try {
  // PocketBase v0.22+ uses _superusers
  await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, password);
  console.log('✓ Authenticated (superuser)');
} catch (e1) {
  try {
    // Older PocketBase uses admins
    await pb.admins.authWithPassword(ADMIN_EMAIL, password);
    console.log('✓ Authenticated (admin)');
  } catch (e2) {
    console.error('✗ Authentication failed. Please check your password.');
    console.error('  Error:', e2.message || e2);
    process.exit(1);
  }
}

// Helper to check if collection exists
async function collectionExists(name) {
  try {
    const res = await fetch(`${PB_URL}/api/collections/${name}`, {
      headers: { Authorization: pb.authStore.token }
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Helper to create a collection via API
async function createCollection(schema) {
  const res = await fetch(`${PB_URL}/api/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: pb.authStore.token,
    },
    body: JSON.stringify(schema),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json();
}

// ── cplayz_blocks ──
console.log('\nChecking cplayz_blocks...');
if (await collectionExists('cplayz_blocks')) {
  console.log('✓ cplayz_blocks already exists');
} else {
  console.log('  Creating cplayz_blocks...');
  await createCollection({
    name: 'cplayz_blocks',
    type: 'base',
    fields: [
      { name: 'blockerId', type: 'text', required: true },
      { name: 'blockedId', type: 'text', required: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_blocks_unique` ON `cplayz_blocks` (`blockerId`, `blockedId`)"
    ],
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: null,
    deleteRule: '',
  });
  console.log('✓ cplayz_blocks created!');
}

// ── cplayz_reports ──
console.log('\nChecking cplayz_reports...');
if (await collectionExists('cplayz_reports')) {
  console.log('✓ cplayz_reports already exists');
} else {
  console.log('  Creating cplayz_reports...');
  await createCollection({
    name: 'cplayz_reports',
    type: 'base',
    fields: [
      { name: 'reporterId', type: 'text', required: true },
      { name: 'reportedUserId', type: 'text', required: false },
      { name: 'postId', type: 'text', required: false },
      { name: 'reason', type: 'text', required: true },
      { name: 'details', type: 'text', required: false },
      { name: 'type', type: 'text', required: false },
      { name: 'status', type: 'text', required: false },
    ],
    listRule: null,
    viewRule: null,
    createRule: '',
    updateRule: null,
    deleteRule: null,
  });
  console.log('✓ cplayz_reports created!');
}

console.log('\n🎉 Done! Report & Block functionality should now work.\n');
