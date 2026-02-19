const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfrxsvhwiizimcxypuli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmcnhzdmh3aWl6aW1jeHlwdWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzMyMzQsImV4cCI6MjA4MzIwOTIzNH0.uuolI0nqPziIXPFrIabbQ3M7dBYw9Xeyo-42sacpcek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSanju() {
    console.log('Fetching Sanju...');
    const { data: users, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', 'sanju b');

    if (fetchError || !users || users.length === 0) {
        console.error('User not found or fetch error:', fetchError);
        return;
    }

    const sanju = users[0];
    console.log('Found Sanju:', sanju.id);

    // 2. Prepare updates
    let newSports = sanju.sports || [];
    if (!Array.isArray(newSports)) newSports = [];

    if (!newSports.some(s => s.toLowerCase() === 'tennis')) {
        newSports.push('Tennis');
    }

    const newRatings = sanju.elo_ratings || {};
    if (!newRatings.tennis && !newRatings.Tennis) {
        newRatings.tennis = 1200;
    }

    console.log('Attempting update with:', { sports: newSports, elo_ratings: newRatings });

    // 3. Update and SELECT
    const { data: updatedData, error: updateError } = await supabase
        .from('profiles')
        .update({ sports: newSports, elo_ratings: newRatings })
        .eq('id', sanju.id)
        .select();

    if (updateError) {
        console.error('Update failed with error:', updateError);
    } else if (!updatedData || updatedData.length === 0) {
        console.error('Update returned no data. Likely permission denied by RLS (silent failure).');
    } else {
        console.log('Update successful! New data:', JSON.stringify(updatedData[0], null, 2));
    }
}

fixSanju();
