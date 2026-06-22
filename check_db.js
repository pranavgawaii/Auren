require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: actions, error: actErr } = await supabase.from('agent_actions').select('*');
  console.log("Actions count:", actions?.length);
  console.log("Actions error:", actErr);
  
  const { data: limits, error: limErr } = await supabase.from('user_rate_limits').select('*');
  console.log("Rate limits:", limits);
}

main();
