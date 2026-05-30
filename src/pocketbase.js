import PocketBase from 'pocketbase';

const PB_URL =
  import.meta.env.VITE_PB_URL ||
  'https://caisterplayz-caisterplayz-backend.hf.space';

console.log('PocketBase URL:', PB_URL);

const pb = new PocketBase(PB_URL);

pb.autoCancellation(false);

pb.beforeSend = function (url, options) {
  const userId = localStorage.getItem('cplayz_user_id');

  if (userId) {
    options.headers = {
      ...options.headers,
      'X-User-Id': userId,
    };
  }

  return { url, options };
};

export default pb;
