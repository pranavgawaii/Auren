import { Corsair } from "@corsair/sdk";

async function main() {
  const corsair = new Corsair({
    instanceId: "722e594f105647d3ab721aff5e1b20fd",
    devKey: "ch_JZwAJblCDQPNTbljH_M1TEFY6_LnYeyD93RLxmr5sqw"
  });
  
  const tenant = corsair.tenant("auren-default-tenant");
  const result = await tenant.plugins.credentials.list("github", "user_2lI6222bO8A1A28A8A8A8A8A8A8"); // Need actual user ID, let's just fetch all or we don't know it.
}
main();
