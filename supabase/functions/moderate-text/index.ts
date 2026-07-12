// Supabase Edge Function: moderate-text
// Normalizes and filters input text for offensive, toxic, or banned words.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const BANNED_WORDS = ['hate', 'spam', 'hack', 'cheat', 'scam', 'toxicity'];

serve(async (req) => {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ flagged: false, text }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const normalizedText = text.toLowerCase().trim();
    const containsBanned = BANNED_WORDS.some(word => normalizedText.includes(word));

    return new Response(
      JSON.stringify({
        flagged: containsBanned,
        suggestion: containsBanned ? text.replace(/hate|spam|hack|cheat|scam/gi, '***') : text,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
