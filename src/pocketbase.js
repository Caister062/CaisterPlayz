import PocketBase from 'pocketbase';

// In production (App Store build), use the hosted PocketBase URL
// In development, use the Vite proxy (same origin)
const PB_URL = import.meta.env.VITE_PB_URL || window.location.origin;

const pb = new PocketBase(PB_URL);

// Disable auto-cancellation so multiple concurrent requests don't cancel each other
pb.autoCancellation(false);

export default pb;
