import { NextResponse } from "next/server";
import { getTenant } from "@/lib/corsair";

export async function GET() {
  try {
    const tenant = getTenant();
    const results: any = {};
    
    // Attempt 1: insert WITH requestBody
    try {
      const runParams = {
        calendarId: "primary",
        requestBody: {
          summary: "Test Event API Insert",
          start: { dateTime: new Date().toISOString() },
          end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
        }
      };
      results.insertWithReqBody = await tenant.run("googlecalendar.api.events.insert", runParams);
    } catch(e: any) { results.insertWithReqBodyErr = e?.message || e?.details || e?.code || e; }

    // Attempt 2: insert WITHOUT requestBody (flat)
    try {
      const runParamsFlat = {
        calendarId: "primary",
        summary: "Test Event API Flat",
        start: { dateTime: new Date().toISOString() },
        end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
      };
      results.insertFlat = await tenant.run("googlecalendar.api.events.insert", runParamsFlat);
    } catch(e: any) { results.insertFlatErr = e?.message || e?.details || e?.code || e; }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
