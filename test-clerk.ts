import { config } from "dotenv";
config();

async function run() {
  try {
    const res = await fetch("https://api.clerk.com/v1/users", {
      headers: { 
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
      }
    });
    const users = await res.json();
    console.log(JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
