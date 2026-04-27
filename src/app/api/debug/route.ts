import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    return NextResponse.json({
      hasApiKey: !!env.GOOGLE_SEARCH_API_KEY,
      hasEngineId: !!env.GOOGLE_SEARCH_ENGINE_ID,
      hasSerpApi: !!env.SERPAPI_KEY,
      serpApiLength: env.SERPAPI_KEY?.length ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
