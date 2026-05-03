const POCKETBASE_URL = 'http://127.0.0.1:8090';

async function inspect() {
  // Auth
  const authRes = await fetch(`${POCKETBASE_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@caisterplayz.local', password: 'adminpassword123' })
  });
  const authData = await authRes.json();
  const token = authData.token;
  const headers = { Authorization: token };

  // Get collection details
  const res = await fetch(`${POCKETBASE_URL}/api/collections/cplayz_posts`, { headers });
  const data = await res.json();
  console.log('=== cplayz_posts collection ===');
  console.log('Fields:', JSON.stringify(data.fields?.map(f => f.name) || data.schema?.map(s => s.name) || 'none', null, 2));
  console.log('listRule:', JSON.stringify(data.listRule));
  console.log('viewRule:', JSON.stringify(data.viewRule));
  console.log('createRule:', JSON.stringify(data.createRule));
  console.log('updateRule:', JSON.stringify(data.updateRule));
  
  // Also try creating a test record to see if it works
  console.log('\n=== Testing create on cplayz_users ===');
  try {
    const createRes = await fetch(`${POCKETBASE_URL}/api/collections/cplayz_users/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // NO auth header - test public access
      body: JSON.stringify({ displayName: 'TestUser', bio: '', website: '', avatarUrl: '', deviceId: 'test_123' })
    });
    const createData = await createRes.json();
    console.log('Status:', createRes.status);
    console.log('Response:', JSON.stringify(createData, null, 2));
    
    // Cleanup
    if (createRes.ok) {
      await fetch(`${POCKETBASE_URL}/api/collections/cplayz_users/records/${createData.id}`, { 
        method: 'DELETE', headers 
      });
      console.log('Cleaned up test record');
    }
  } catch(e) {
    console.error('Create failed:', e.message);
  }
}

inspect();
