const POCKETBASE_URL = 'http://127.0.0.1:8090';

async function updateSchema() {
  let token;
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@caisterplayz.local', password: 'adminpassword123' })
    });
    if (!res.ok) throw new Error(await res.text());
    token = (await res.json()).token;
  } catch (err) {
    console.error('❌ Auth failed:', err.message);
    process.exit(1);
  }

  const headers = { 'Content-Type': 'application/json', 'Authorization': token };

  try {
    const getRes = await fetch(`${POCKETBASE_URL}/api/collections/cplayz_users`, { headers });
    const collection = await getRes.json();

    if (!collection.fields.find(f => f.name === 'phoneNumber')) {
      collection.fields.push({ name: 'phoneNumber', type: 'text' });
      
      const updateRes = await fetch(`${POCKETBASE_URL}/api/collections/cplayz_users`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(collection)
      });
      if (updateRes.ok) console.log('✅ Added phoneNumber field!');
      else console.error('❌ Failed to add field:', await updateRes.text());
    } else {
      console.log('✅ phoneNumber field already exists!');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

updateSchema();
