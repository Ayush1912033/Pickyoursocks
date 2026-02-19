const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://wfrxsvhwiizimcxypuli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmcnhzdmh3aWl6aW1jeHlwdWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzMyMzQsImV4cCI6MjA4MzIwOTIzNH0.uuolI0nqPziIXPFrIabbQ3M7dBYw9Xeyo-42sacpcek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findSanju() {
    console.log('Searching for Sanju...');
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', '%Sanju%');

    if (error) {
        console.error('Error fetching Sanju:', error);
        return;
    }

    fs.writeFileSync('sanju_data.json', JSON.stringify(data, null, 2));
    console.log('Written detailed data to sanju_data.json');
}

findSanju();
