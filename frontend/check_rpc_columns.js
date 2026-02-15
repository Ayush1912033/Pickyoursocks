import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Manual .env parsing
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^"|"$/g, '');
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRpcColumns() {
    console.log("Checking get_radar_matches columns...");
    const { data, error } = await supabase.rpc(
        'get_radar_matches',
        {
            _current_user_id: '00000000-0000-0000-0000-000000000000', // Dummy
            _selected_sport: 'tennis'
        }
    );

    if (error) {
        // Try without underscores for old signature
        console.log("Underscore signature failed, trying without underscores...");
        const { data: data2, error: error2 } = await supabase.rpc(
            'get_radar_matches',
            {
                current_user_id: '00000000-0000-0000-0000-000000000000',
                selected_sport: 'tennis'
            }
        );
        if (error2) {
            console.error("RPC Error:", error2.message);
        } else {
            if (data2 && data2.length > 0) {
                console.log("Columns:", Object.keys(data2[0]));
            } else {
                console.log("No data returned to check columns.");
            }
        }
    } else {
        if (data && data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        } else {
            console.log("No data returned to check columns.");
        }
    }
}

checkRpcColumns();
