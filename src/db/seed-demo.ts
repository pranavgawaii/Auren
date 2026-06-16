import { createServerSupabaseClient } from "../lib/supabase";

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

async function seed() {
  const supabase = createServerSupabaseClient();
  
  // Create demo user in auth.users if it doesn't exist to satisfy foreign key constraints
  const { data: existingUser } = await supabase.auth.admin.getUserById(DEMO_USER_ID);
  
  if (!existingUser.user) {
    console.log("Creating demo user...");
    const { error: userError } = await supabase.auth.admin.createUser({
      id: DEMO_USER_ID,
      email: "demo@auren.ai",
      password: "password123",
      email_confirm: true
    });
    
    if (userError && !userError.message.includes("already exists")) {
      console.error("Error creating demo user:", userError);
      process.exit(1);
    }
  }

  const now = new Date();
  const minusHours = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  const minusDays = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  const demoEmails = [
    {
      user_id: DEMO_USER_ID,
      gmail_id: 'demo_001',
      thread_id: 'thread_001',
      from_email: 'rahul.sharma@acmecorp.in',
      from_name: 'Rahul Sharma',
      subject: 'Re: Project deadline — need your answer today',
      snippet: 'Hi, following up on the proposal. We need to know by EOD if you can take on the project. Budget is confirmed at ₹2.4L. Please confirm.',
      body: 'Hi, following up on the proposal. We need to know by EOD if you can take on the project. Budget is confirmed at ₹2.4L. Please confirm.',
      priority: 'urg',
      is_read: false,
      received_at: minusHours(2),
    },
    {
      user_id: DEMO_USER_ID,
      gmail_id: 'demo_002',
      thread_id: 'demo_002',
      from_email: 'priya.verma@bluewave.co',
      from_name: 'Priya Verma',
      subject: 'Invoice #0042 overdue — please confirm receipt',
      snippet: 'The invoice for the brand identity project is now 14 days overdue. Could you confirm you received it and let us know the payment timeline?',
      body: 'The invoice for the brand identity project is now 14 days overdue. Could you confirm you received it and let us know the payment timeline?',
      priority: 'urg',
      is_read: false,
      received_at: minusHours(4),
    },
    {
      user_id: DEMO_USER_ID,
      gmail_id: 'demo_003',
      thread_id: 'demo_003',
      from_email: 'dev@corsair.dev',
      from_name: 'Dev · Corsair',
      subject: 'New webhooks endpoint ready for testing',
      snippet: 'We shipped a new webhooks endpoint with improved reliability. Check the docs at docs.corsair.dev for the updated configuration.',
      body: 'We shipped a new webhooks endpoint with improved reliability. Check the docs at docs.corsair.dev for the updated configuration.',
      priority: 'nrm',
      is_read: false,
      received_at: minusHours(6),
    },
    {
      user_id: DEMO_USER_ID,
      gmail_id: 'demo_004',
      thread_id: 'demo_004',
      from_email: 'hitesh@chaicode.com',
      from_name: 'Hitesh Choudhary',
      subject: 'Hackathon update — judges confirmed',
      snippet: 'Quick update on the hackathon. All judges are confirmed. Make sure your demo video is under 3 minutes and shows real integrations.',
      body: 'Quick update on the hackathon. All judges are confirmed. Make sure your demo video is under 3 minutes and shows real integrations.',
      priority: 'nrm',
      is_read: true,
      received_at: minusHours(8),
    },
    {
      user_id: DEMO_USER_ID,
      gmail_id: 'demo_005',
      thread_id: 'demo_005',
      from_email: 'ananya.singh@krutrim.ai',
      from_name: 'Ananya Singh',
      subject: 'SDE-1 Interview — Thursday 4PM IST',
      snippet: 'Congratulations on clearing the OA round. We would like to schedule your technical interview for Thursday at 4PM IST. Please confirm your availability.',
      body: 'Congratulations on clearing the OA round. We would like to schedule your technical interview for Thursday at 4PM IST. Please confirm your availability.',
      priority: 'urg',
      is_read: false,
      received_at: minusHours(10),
    },
    {
      user_id: DEMO_USER_ID,
      gmail_id: 'demo_006',
      thread_id: 'demo_006',
      from_email: 'noreply@github.com',
      from_name: 'GitHub',
      subject: 'PR #142 — auth refactor waiting for your review',
      snippet: 'Pranav Gawai requested your review on pull request auth refactor. This PR has been waiting for 48 hours.',
      body: 'Pranav Gawai requested your review on pull request auth refactor. This PR has been waiting for 48 hours.',
      priority: 'nrm',
      is_read: false,
      received_at: minusDays(1),
    },
    {
      user_id: DEMO_USER_ID,
      gmail_id: 'demo_007',
      thread_id: 'demo_007',
      from_email: 'newsletter@producthunt.com',
      from_name: 'Product Hunt',
      subject: 'Top products this week — AI tools edition',
      snippet: 'This week on Product Hunt: 5 AI tools that are changing how developers work. Plus the most upvoted product of the month.',
      body: 'This week on Product Hunt: 5 AI tools that are changing how developers work. Plus the most upvoted product of the month.',
      priority: 'fyi',
      is_read: true,
      received_at: minusDays(2),
    },
    {
      user_id: DEMO_USER_ID,
      gmail_id: 'demo_008',
      thread_id: 'demo_008',
      from_email: 'noreply@vercel.com',
      from_name: 'Vercel',
      subject: 'Deployment successful — auren.vercel.app',
      snippet: 'Your deployment to auren.vercel.app was successful. Build time: 43 seconds. All checks passed.',
      body: 'Your deployment to auren.vercel.app was successful. Build time: 43 seconds. All checks passed.',
      priority: 'fyi',
      is_read: true,
      received_at: minusDays(3),
    }
  ];

  const { data, error } = await supabase
    .from('emails')
    .upsert(demoEmails, { onConflict: 'gmail_id' })
    .select();

  if (error) {
    console.error("Error seeding emails:", error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data.length} emails into Supabase.`);
}

seed();
