import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY devem estar definidos em .env.local",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      apikey: supabaseKey,
      eventsPerSecond: 10,
    },
  },
});
