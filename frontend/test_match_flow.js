import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manual .env parsing
const envPath = path.join(__dirname, '.env');
let env = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.trim().replace(/^"|"$/g, '');
        }
    });
} catch (error) {
    console.log("❌ Could not read .env file");
    process.exit(1);
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMatchFlow() {
    console.log("=== TESTING MATCH FLOW ===");

    // We need 2 users. Let's try to fetch random 2 users or use dummy UUIDs
    // CAUTION: Inserting with dummy UUIDs might fail due to FK constraints on profiles.id
    // We MUST fetch real user IDs.

    const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .limit(2);

    if (userError || !users || users.length < 2) {
        console.log("❌ Need at least 2 users in 'profiles' table to test flow.");
        console.log("Found: " + (users ? users.length : 0));
        return;
    }

    const userA = users[0].id;
    const userB = users[1].id;
    const sport = 'tennis';

    console.log(`User A: ${userA}`);
    console.log(`User B: ${userB}`);

    // 1. CLEANUP existing requests between them
    await supabase.from('match_requests').delete().or(`user_id.eq.${userA},opponent_id.eq.${userA},user_id.eq.${userB},opponent_id.eq.${userB}`);

    // 2. CHALLENGE (User A -> User B)
    console.log("\n1. Sending Challenge (A -> B)...");
    const { data: challenge, error: challengeError } = await supabase
        .from('match_requests')
        .insert({
            user_id: userA,
            opponent_id: userB,
            sport: sport,
            status: 'pending'
        })
        .select()
        .single();

    if (challengeError) {
        console.log("❌ Challenge Failed: " + challengeError.message);
        return;
    }
    console.log("✅ Challenge Created ID:", challenge.id);

    // 3. ACCEPT (User B accepts)
    console.log("\n2. Accepting Challenge (B)...");
    const { error: acceptError } = await supabase
        .from('match_requests')
        .update({
            status: 'accepted',
            accepted_by: userB,
            // In Radar.tsx logic: opponent_id: userB is set during accept? 
            // Actually Radar.tsx line 276 sets opponent_id when accepting.
            opponent_id: userB
        })
        .eq('id', challenge.id);

    if (acceptError) {
        console.log("❌ Accept Failed: " + acceptError.message);
        return;
    }
    console.log("✅ Challenge Accepted!");

    // 4. VERIFY STATUS
    const { data: verifyData } = await supabase
        .from('match_requests')
        .select('*')
        .eq('id', challenge.id)
        .single();

    if (verifyData.status !== 'accepted') {
        console.log("❌ Status verification failed. Got: " + verifyData.status);
    } else {
        console.log("✅ Status is 'accepted'. Flow complete.");
    }

    // Cleanup
    console.log("\nCleaning up test match...");
    await supabase.from('match_requests').delete().eq('id', challenge.id);
    console.log("Done.");
}

testMatchFlow().catch(console.error);
