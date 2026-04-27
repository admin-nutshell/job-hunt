import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAnswers, createAnswer } from "@/lib/db/answer_bank";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const answers = await getAnswers(env.JOB_HUNT_DB);
    return NextResponse.json(answers);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const body: {
      question: string;
      answer: string;
      application_id?: number;
    } = await request.json();
    const entry = await createAnswer(
      env.JOB_HUNT_DB,
      body.question,
      body.answer,
      body.application_id
    );
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
