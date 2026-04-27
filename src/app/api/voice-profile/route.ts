import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getVoiceProfile, upsertVoiceProfile } from "@/lib/db/voice_profile";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const profile = await getVoiceProfile(env.JOB_HUNT_DB);
    return NextResponse.json(profile);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const body: { tone_description: string } = await request.json();
    const profile = await upsertVoiceProfile(env.JOB_HUNT_DB, body.tone_description);
    return NextResponse.json(profile);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
