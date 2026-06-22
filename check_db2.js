require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: actions } = await supabase.from('agent_actions').select('id, user_id, command').limit(5);
  console.log("Sample Actions:");
  console.dir(actions, { depth: null });
}

main();
