/**
 * Setup script: Creates the cplayz_blocks and cplayz_reports collections
 * on the remote PocketBase if they don't already exist.
 *
 * Usage:  node setup_collections.mjs
 *
 * You'll be prompted for superuser email/password.
 */
import PocketBase from 'pocketbase';
import { createInterface } from 'readline';

const PB_URL = process.env.VITE_PB_URL || 'https://caisterplayz-caisterplayz-backend.hf.space';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

async function main() {
  const email = await ask('Superuser email: ');
  const password = await ask('Superuser password: ');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log(`\nConnecting to ${PB_URL}...`);
  await pb.collection('_superusers').authWithPassword(email, password);
  console.log('✓ Authenticated as superuser\n');

  // ── cplayz_blocks ──
  try {
    const existing = await pb.collections.getOne('cplayz_blocks');
    console.log('✓ cplayz_blocks already exists (id:', existing.id, ')');
  } catch {
    console.log('Creating cplayz_blocks...');
    await pb.collections.create({
      name: 'cplayz_blocks',
      type: 'base',
      fields: [
        { name: 'blockerId', type: 'text', required: true },
        { name: 'blockedId', type: 'text', required: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_blocks_unique` ON `cplayz_blocks` (`blockerId`, `blockedId`)'
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: null,
      deleteRule: '',
    });
    console.log('✓ cplayz_blocks created');
  }

  // ── cplayz_reports ──
  try {
    const existing = await pb.collections.getOne('cplayz_reports');
    console.log('✓ cplayz_reports already exists (id:', existing.id, ')');
  } catch {
    console.log('Creating cplayz_reports...');
    await pb.collections.create({
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
    console.log('✓ cplayz_reports created');
  }

  // ── tracks ──
  try {
    const existing = await pb.collections.getOne('tracks');
    console.log('✓ tracks already exists (id:', existing.id, ')');
  } catch {
    console.log('Creating tracks...');
    await pb.collections.create({
      name: 'tracks',
      type: 'base',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text', required: false },
        { name: 'artistId', type: 'relation', required: false, options: { collectionId: '_pb_users_auth_', cascadeDelete: false, minSelect: null, maxSelect: 1, displayFields: [] } },
        { name: 'artistName', type: 'text', required: true },
        { name: 'audioFile', type: 'file', required: true, options: { maxSelect: 1, maxSize: 52428800, mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/flac'] } },
        { name: 'coverFile', type: 'file', required: false, options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ['image/jpeg', 'image/png'] } },
        { name: 'likedBy', type: 'relation', required: false, options: { collectionId: '_pb_users_auth_', cascadeDelete: false, minSelect: null, maxSelect: null, displayFields: [] } },
        { name: 'playCount', type: 'number', required: false, options: { min: 0 } }
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    });
    console.log('✓ tracks created');
  }

  console.log('\n🎉 Setup complete! Report & block functionality should now work.\n');
  rl.close();
}

main().catch(err => {
  console.error('Setup failed:', err.message || err);
  rl.close();
  process.exit(1);
});
