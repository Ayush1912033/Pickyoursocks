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
    console.log("❌ Could not read .env file: " + error.message);
    process.exit(1);
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.log("❌ Missing Supabase variables in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectRadar() {
    console.log("=== INSPECTING RADAR DATA ===");

    // Use a real user ID if possible, otherwise use a placeholder that might return empty but valid structure
    // If we have a known user ID in the env or valid users in DB, we could fetch one.
    // Let's try to fetch one user first to be the "caller"

    const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

    if (userError || !users?.length) {
        console.log("⚠️ Could not fetch a real user profile to test with. Using dummy UUID.");
    }

    const testUserId = users?.[0]?.id || '00000000-0000-0000-0000-000000000000';
    console.log(`Testing with User ID: ${testUserId}`);

    const { data, error } = await supabase.rpc(
        'get_radar_matches',
        {
            _current_user_id: testUserId,
            _selected_sport: 'tennis' // Assuming tennis data exists
        }
    );

    if (error) {
        console.log("❌ RPC Error:");
        console.log(error);
        return;
    }

    console.log(`✅ RPC Success. Returned ${data?.length} records.`);

    if (data && data.length > 0) {
        console.log("First record structure:");
        console.log(JSON.stringify(data[0], null, 2));

        // Check for required fields
        const requiredFields = ['id', 'match_quality', 'name', 'elo', 'reliability_score'];
        const missing = requiredFields.filter(f => !(f in data[0]));

        if (missing.length > 0) {
            console.log("❌ MISSING FIELDS expected by frontend:", missing);
        } else {
            console.log("✅ All core fields present.");
        }
    } else {
        console.log("⚠️ No matches returned. Hard to verify structure without data.");
        console.log("Try adding some dummy profiles/data if needed.");
    }
}

inspectRadar().catch(err => console.log("❌ Script Error: " + err.message));
