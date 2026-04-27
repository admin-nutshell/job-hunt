import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getApplications, createApplication } from "@/lib/db/applications";
import type { NewApplication } from "@/types";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const applications = await getApplications(env.JOB_HUNT_DB);
    return NextResponse.json(applications);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const body: NewApplication = await request.json();
    const application = await createApplication(env.JOB_HUNT_DB, body);
    return NextResponse.json(application, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
