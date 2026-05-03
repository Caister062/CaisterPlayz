const POCKETBASE_URL = 'http://127.0.0.1:8090';

async function addMusicField() {
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
    const getRes = await fetch(`${POCKETBASE_URL}/api/collections/cplayz_posts`, { headers });
    const collection = await getRes.json();

    let changed = false;

    if (!collection.fields.find(f => f.name === 'musicId')) {
      collection.fields.push({ name: 'musicId', type: 'text' });
      changed = true;
    }

    if (!collection.fields.find(f => f.name === 'musicName')) {
      collection.fields.push({ name: 'musicName', type: 'text' });
      changed = true;
    }

    if (changed) {
      const updateRes = await fetch(`${POCKETBASE_URL}/api/collections/cplayz_posts`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(collection)
      });
      if (updateRes.ok) console.log('✅ Added musicId and musicName fields to cplayz_posts!');
      else console.error('❌ Failed:', await updateRes.text());
    } else {
      console.log('✅ Music fields already exist!');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

addMusicField();
