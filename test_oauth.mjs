import PocketBase from 'pocketbase';
const pb = new PocketBase('https://caisterplayz-caisterplayz-backend.hf.space');

async function testGoogle() {
  const authMethods = await pb.collection('users').listAuthMethods();
  const google = authMethods.oauth2.providers.find(p => p.name === 'google');
  
  const redirectUrl = 'https://caisterplayz-caisterplayz-backend.hf.space/api/oauth-redirect';
  const url = google.authUrl + redirectUrl;
  console.log("Visit this URL to login with Google:");
  console.log(url);
  console.log("\nAfter redirect, it will send you to GitHub pages. Copy the state and code from the URL and paste them here:");
  console.log("codeVerifier:", google.codeVerifier);
}

testGoogle().catch(console.error);
