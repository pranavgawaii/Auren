import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function test() {
  const dummyUserId = "11111111-1111-1111-1111-111111111111";
  console.log("Creating user in Supabase Auth with ID:", dummyUserId);
  
  try {
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      id: dummyUserId,
      email: "test-user-dummy@example.com",
      email_confirm: true,
      user_metadata: { source: "clerk_sync" }
    });

    if (userError) {
      console.log("Auth User creation failed/existed:", userError.message);
    } else {
      console.log("Auth User created successfully:", user);
    }

    console.log("Now testing insert into emails table...");
    const { data, error } = await supabase
      .from("emails")
      .insert({
        user_id: dummyUserId,
        gmail_id: "test-gmail-id-" + Math.random(),
        thread_id: "thread-123",
        from_email: "test@example.com",
        from_name: "Test Sender",
        subject: "Test Subject",
        snippet: "Test snippet",
        body: "Test body",
        priority: "nrm",
        is_read: false,
        received_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error("Insert failed:", error);
    } else {
      console.log("Insert succeeded! Data:", data);
    }
  } catch (err) {
    console.error("Error running test:", err);
  }
}

test();
