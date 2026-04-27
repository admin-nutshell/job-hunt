import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAnswers } from "@/lib/db/answer_bank";
import AnswerBankList from "@/components/AnswerBankList";

export const dynamic = "force-dynamic";

export default async function AnswerBankPage() {
  let answers: import("@/types").AnswerBankEntry[] = [];

  try {
    const { env } = getCloudflareContext();
    answers = await getAnswers(env.JOB_HUNT_DB);
  } catch (err) {
    console.error("D1 Answer Bank fetch failed:", err);
  }

  return <AnswerBankList initialAnswers={answers} />;
}
