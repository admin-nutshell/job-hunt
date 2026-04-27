import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getApplication } from "@/lib/db/applications";
import { getResume } from "@/lib/db/resume";
import { getAnswersByApplication } from "@/lib/db/answer_bank";
import { getVoiceProfile } from "@/lib/db/voice_profile";
import { createCoverLetter } from "@/lib/db/cover_letters";

interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AiResponse {
  response?: string;
}

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const { application_id }: { application_id: number } = await request.json();

    if (!application_id) {
      return NextResponse.json(
        { error: "application_id is required" },
        { status: 400 }
      );
    }

    // Fetch all context in parallel
    const [application, resume, answers, voiceProfile] = await Promise.all([
      getApplication(env.JOB_HUNT_DB, application_id),
      getResume(env.JOB_HUNT_DB),
      getAnswersByApplication(env.JOB_HUNT_DB, application_id),
      getVoiceProfile(env.JOB_HUNT_DB),
    ]);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const answerContext =
      answers.length > 0
        ? answers
            .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
            .join("\n\n")
        : "No specific Q&A on record for this application.";

    const messages: AiMessage[] = [
      {
        role: "system",
        content:
          "You are writing a cover letter for Haytham, a senior project manager with a civil engineering background and 15+ years in large-scale infrastructure, commercial, and industrial construction projects in Canada. His style is direct, confident, results-oriented, and human. Never use corporate filler phrases or AI-sounding language. Never start with 'I am writing to apply'. Write as if Haytham wrote it himself — specific, punchy, peer-to-peer.",
      },
      {
        role: "user",
        content: [
          `Role: ${application.role_title} at ${application.company}`,
          application.location ? `Location: ${application.location} (${application.work_type})` : "",
          "",
          "--- RESUME ---",
          resume.content || "No resume content on file yet.",
          "",
          "--- JOB DESCRIPTION ---",
          application.job_description || "No job description provided.",
          "",
          "--- EXPERIENCE GAP Q&A ---",
          answerContext,
          "",
          "--- TONE GUIDE ---",
          voiceProfile.tone_description || "Direct, confident, results-oriented, human.",
          "",
          "Write a compelling cover letter for this role. Output only the letter text, no subject line, no greeting instructions.",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ];

    const aiResponse = (await env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct-fast",
      { messages }
    )) as AiResponse;

    const coverLetterText = aiResponse.response ?? "";

    // Persist the generated cover letter to the DB
    const saved = await createCoverLetter(
      env.JOB_HUNT_DB,
      application_id,
      coverLetterText
    );

    return NextResponse.json({ cover_letter: coverLetterText, id: saved.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
