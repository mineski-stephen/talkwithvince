// ============================================================================
//  Talk With Vince — configuration
//  This is the ONLY file you normally need to edit.
// ============================================================================

// Your Supabase project URL (no trailing slash).
const SUPABASE_URL = "https://ehwrcrxvvwqecwokhasr.supabase.co";

// The "anon public" API key from: Supabase -> Project Settings -> API.
// NOTE: this is NOT the database password. The database password cannot be
// used from a browser. The anon key is safe to ship in a browser file — it
// only grants what your Row Level Security (RLS) policies allow.
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVod3Jjcnh2dndxZWN3b2toYXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNTM0MTksImV4cCI6MjA5NjYyOTQxOX0.F-25eDngXzanvMnpuki_nUTnvRELPqb_sBG59KbMm-o";

// The table that holds the queue. Columns: id, name, serving.
// serving is a BOOLEAN: false = in queue, true = now serving.
const TABLE = "talkwithvince";

// How often the pages re-read from Supabase, in milliseconds.
const POLL_INTERVAL_MS = 2500;
