import { createClient } from "@corsair-dev/app";

const CORSAIR_DEV_KEY = "ch_JZwAJblCDQPNTbljH_M1TEFY6_LnYeyD93RLxmr5sqw";
const CORSAIR_INSTANCE_ID = "722e594f105647d3ab721aff5e1b20fd";

async function copy() {
  const corsair = createClient({ apiKey: CORSAIR_DEV_KEY });
  const inst = corsair.instance(CORSAIR_INSTANCE_ID);

  console.log("Listing plugins...");
  const result = await inst.plugins.list();
  console.log("Plugins result:", JSON.stringify(result, null, 2));
}

copy().catch(error => {
  console.error("Failed:", error);
});
