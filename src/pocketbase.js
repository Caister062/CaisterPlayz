import PocketBase from 'pocketbase';

// In production (App Store build), use the hosted PocketBase URL
// In development, use the Vite proxy (same origin)
const PB_URL = import.meta.env.VITE_PB_URL || window.location.origin;

const pb = new PocketBase(PB_URL);

// Disable auto-cancellation so multiple concurrent requests don't cancel each other
pb.autoCancellation(false);

// Automatically append X-User-Id header to all requests for user authorization
pb.beforeSend = function (url, options) {
  const userId = localStorage.getItem('cplayz_user_id');
  if (userId) {
    options.headers = Object.assign({}, options.headers, {
      'X-User-Id': userId,
    });
  }
  return { url, options };
};

export default pb;
