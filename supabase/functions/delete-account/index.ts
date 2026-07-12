// Supabase Edge Function: delete-account
// Deletes a user profile, data, media, and deletes user from Supabase auth.users using service-role client.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Validate Deno JWT session
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Delete associated usernames registry to free up name
    await supabaseAdmin.from('usernames').delete().eq('user_id', user.id);

    // 2. Cascade delete will trigger cascading deletions for profiles, follows, blocks, mutes, beacons, and notifications
    // But let's verify profile files cleanup:
    const { error: profileErr } = await supabaseAdmin.from('profiles').delete().eq('id', user.id);
    if (profileErr) throw profileErr;

    // 3. Delete user account from auth.users (requires Admin privileges)
    const { error: deleteUserErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteUserErr) throw deleteUserErr;

    return new Response(JSON.stringify({ message: 'Account deleted successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
