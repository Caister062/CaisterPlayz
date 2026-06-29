import PocketBase from 'pocketbase';

const pb = new PocketBase('https://caisterplayz-caisterplayz-backend.hf.space');

async function createCollections() {
  await pb.admins.authWithPassword('caismoretton@gmail.com', 'NewStrongPassword123');

  try {
    const usersCollection = await pb.collections.getOne('users');
    const usersCollectionId = usersCollection.id;
    
    const streamsCollection = await pb.collections.getOne('cplayz_streams');
    const streamsCollectionId = streamsCollection.id;

    // 2. Stream Chats Collection
    try {
      await pb.collections.create({
        name: 'cplayz_stream_chats',
        type: 'base',
        system: false,
        fields: [
          { name: 'streamId', type: 'relation', required: true, maxSelect: 1, collectionId: streamsCollectionId },
          { name: 'userId', type: 'relation', required: true, maxSelect: 1, collectionId: usersCollectionId },
          { name: 'message', type: 'text', required: true }
        ],
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: null,
        deleteRule: null
      });
      console.log('cplayz_stream_chats created');
    } catch (e) {
      console.log('cplayz_stream_chats error:', JSON.stringify(e.data, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createCollections();
