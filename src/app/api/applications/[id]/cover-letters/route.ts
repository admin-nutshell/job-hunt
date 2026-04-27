import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  getCoverLettersByApplication,
  createCoverLetter,
} from "@/lib/db/cover_letters";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const letters = await getCoverLettersByApplication(env.JOB_HUNT_DB, Number(id));
    return NextResponse.json(letters);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const body: { content: string } = await request.json();
    const letter = await createCoverLetter(
      env.JOB_HUNT_DB,
      Number(id),
      body.content
    );
    return NextResponse.json(letter, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
