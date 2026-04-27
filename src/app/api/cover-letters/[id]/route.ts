import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  toggleCoverLetterApproved,
  deleteCoverLetter,
} from "@/lib/db/cover_letters";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const body: { approved: boolean } = await request.json();
    const letter = await toggleCoverLetterApproved(
      env.JOB_HUNT_DB,
      Number(id),
      body.approved
    );
    if (!letter) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(letter);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    await deleteCoverLetter(env.JOB_HUNT_DB, Number(id));
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
