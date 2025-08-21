// supabase-client.js

// Make sure to import the Supabase library in your HTML files before this script
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://ycfiitdetwwcuysgveur.supabase.co'; // Replace with your Supabase Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZmlpdGRldHd3Y3V5c2d2ZXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NTIzMzAsImV4cCI6MjA3MTMyODMzMH0.hok6waB3OeBkkx7WztmTCvkxlTNrADJPtkReiCG3IY0'; // Replace with your Supabase public anon key

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Supabase URL and Anon Key are required. Please check your supabase-client.js file.");
}

// Initialize the Supabase client
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export the client to be used in other scripts
window.supabase = supabase;
