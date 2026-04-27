import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getVoiceProfile } from "@/lib/db/voice_profile";
import VoiceProfileEditor from "@/components/VoiceProfileEditor";

export const dynamic = "force-dynamic";

export default async function VoiceProfilePage() {
  let profile = null;

  try {
    const { env } = getCloudflareContext();
    profile = await getVoiceProfile(env.JOB_HUNT_DB);
  } catch (err) {
    console.error("D1 Voice Profile fetch failed:", err);
  }

  return <VoiceProfileEditor initialProfile={profile} />;
}
