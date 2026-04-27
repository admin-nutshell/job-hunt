import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    return NextResponse.json({
      hasApiKey: !!env.GOOGLE_SEARCH_API_KEY,
      hasEngineId: !!env.GOOGLE_SEARCH_ENGINE_ID,
      apiKeyLength: env.GOOGLE_SEARCH_API_KEY?.length ?? 0,
      engineIdLength: env.GOOGLE_SEARCH_ENGINE_ID?.length ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
