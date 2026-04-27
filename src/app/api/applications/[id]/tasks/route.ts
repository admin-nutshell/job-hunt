import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getTasksByApplication, createTask } from "@/lib/db/tasks";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const tasks = await getTasksByApplication(env.JOB_HUNT_DB, Number(id));
    return NextResponse.json(tasks);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const body: Omit<import("@/types").NewTask, "application_id"> = await request.json();
    const task = await createTask(env.JOB_HUNT_DB, {
      ...body,
      application_id: Number(id),
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
