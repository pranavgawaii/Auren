import { config } from "dotenv";
config();
import { createClient as createApp } from "@corsair-dev/app";

async function run() {
  const devKey = process.env.CORSAIR_DEV_KEY as string;
  const instanceId = process.env.CORSAIR_INSTANCE_ID as string;
  const tenantId = "user_2hV6j1Uu3L49p9XN979W221Oov3";
  
  const app = createApp({ apiKey: devKey });
  const tenant = app.instance(instanceId).tenant(tenantId);
  
  try {
    const res = await tenant.run("github.api.rest.users.getAuthenticated", {});
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
