import PocketBase from 'pocketbase';
const pb = new PocketBase('https://caisterplayz.pockethost.io');
async function main() {
  try {
    console.log('Authenticating...');
    const authData = await pb.admins.authWithPassword('fortnitecaisterplayz@gmail.com', 'ZzQ7TettH268K@p');
    console.log('Auth success:', authData.token.substring(0, 10) + '...');
    
    // Create cplayz_blocks
    try {
      await pb.collections.getOne('cplayz_blocks');
      console.log('cplayz_blocks exists');
    } catch {
      await pb.collections.create({
        name: 'cplayz_blocks',
        type: 'base',
        fields: [
          { name: 'blockerId', type: 'text', required: true },
          { name: 'blockedId', type: 'text', required: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX `idx_blocks_unique` ON `cplayz_blocks` (`blockerId`, `blockedId`)'
        ]
      });
      console.log('cplayz_blocks created');
    }

    // Create cplayz_reports
    try {
      await pb.collections.getOne('cplayz_reports');
      console.log('cplayz_reports exists');
    } catch {
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
        ]
      });
      console.log('cplayz_reports created');
    }

    // Create tracks
    try {
      await pb.collections.getOne('tracks');
      console.log('tracks exists');
    } catch {
      await pb.collections.create({
        name: 'tracks',
        type: 'base',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text', required: false },
          { name: 'artistId', type: 'relation', required: false, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
          { name: 'artistName', type: 'text', required: true },
          { name: 'audioFile', type: 'file', required: true, options: { maxSelect: 1, maxSize: 52428800, mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/flac'] } },
          { name: 'coverFile', type: 'file', required: false, options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ['image/jpeg', 'image/png'] } },
          { name: 'likedBy', type: 'relation', required: false, options: { collectionId: '_pb_users_auth_', maxSelect: null } },
          { name: 'playCount', type: 'number', required: false, options: { min: 0 } }
        ]
      });
      console.log('tracks created');
    }
    console.log('All done!');
  } catch (err) {
    console.error('Error:', err.message, err.response);
  }
}
main();
