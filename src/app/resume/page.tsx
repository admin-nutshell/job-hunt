import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getResume } from "@/lib/db/resume";
import ResumeEditor from "@/components/ResumeEditor";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  let resume: { content: string; updated_at: string | null } = { content: "", updated_at: null };

  try {
    const { env } = getCloudflareContext();
    const data = await getResume(env.JOB_HUNT_DB);
    resume = { content: data.content, updated_at: data.updated_at };
  } catch (err) {
    // Fallback for local dev or missing row
    console.error("D1 Resume fetch failed:", err);
  }

  return <ResumeEditor initialContent={resume.content} updatedAt={resume.updated_at} />;
}
