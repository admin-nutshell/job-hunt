import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getResume, upsertResume } from "@/lib/db/resume";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const resume = await getResume(env.JOB_HUNT_DB);
    return NextResponse.json(resume);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const body: { content: string } = await request.json();
    const resume = await upsertResume(env.JOB_HUNT_DB, body.content);
    return NextResponse.json(resume);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
