import PocketBase from 'pocketbase';

const pb = new PocketBase('https://caisterplayz-caisterplayz-backend.hf.space');

async function createCollections() {
  await pb.admins.authWithPassword('caismoretton@gmail.com', 'NewStrongPassword123');

  try {
    const usersCollection = await pb.collections.getOne('users');
    const usersCollectionId = usersCollection.id;

    try {
      await pb.collections.create({
        name: 'cplayz_webrtc_signals',
        type: 'base',
        system: false,
        fields: [
          { name: 'streamId', type: 'text', required: true }, // Not a strict relation to avoid lookup costs
          { name: 'senderId', type: 'text', required: true },
          { name: 'receiverId', type: 'text', required: true },
          { name: 'signalType', type: 'text', required: true }, // 'offer', 'answer', 'ice'
          { name: 'payload', type: 'json', required: true }
        ],
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: null,
        deleteRule: null // Let older signals pile up, or we can use a cron to clean them
      });
      console.log('cplayz_webrtc_signals created');
    } catch (e) {
      console.log('Error creating cplayz_webrtc_signals:', JSON.stringify(e.data, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createCollections();
