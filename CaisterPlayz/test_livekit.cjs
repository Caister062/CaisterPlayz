const pb = require('pocketbase/cjs');
const client = new pb('https://caisterplayz-caisterplayz-backend.hf.space');

async function test() {
    await client.admins.authWithPassword('caismoretton@gmail.com', 'NewStrongPassword123');
    
    // We need a user token to pass 'authRecord', admins are 'admin'
    // Let's create a test user or auth as a test user
    let userToken;
    try {
        const authData = await client.collection('users').authWithPassword('caismoretton@gmail.com', 'NewStrongPassword123');
        userToken = authData.token;
    } catch(e) {
        // Create user
        try {
            await client.collection('users').create({
                email: 'test@test.com',
                password: 'password123',
                passwordConfirm: 'password123'
            });
            const authData = await client.collection('users').authWithPassword('test@test.com', 'password123');
            userToken = authData.token;
        } catch(e2) {
            const authData = await client.collection('users').authWithPassword('test@test.com', 'password123');
            userToken = authData.token;
        }
    }

    console.log("Token:", userToken);
    
    const res = await fetch('https://caisterplayz-caisterplayz-backend.hf.space/api/livekit-token?room=test', {
        headers: {
            'Authorization': userToken
        }
    });
    
    const text = await res.text();
    console.log("Response:", res.status, text);
}
test();
