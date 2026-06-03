const SUPABASE_URL = "https://mwqnngezcpwsenkqnmeu.supabase.co ";
const SUPABASE_ANON_KEY = "sb_publishable_GEf7rFhtLe9Xn2Lsfld_kw_RsMHzCoQ";

// Create the Supabase client so other scripts (like script.js) can talk to your database.
const supabaseClient = supabase.createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY);
