import type { VoiceProfile } from "@/types";

// ── queries ───────────────────────────────────────────────────────────────────

/**
 * Fetch the singleton voice profile row (id = 1).
 * The row is guaranteed to exist — it's seeded in the migration.
 */
export async function getVoiceProfile(db: D1Database): Promise<VoiceProfile> {
  const result = await db
    .prepare("SELECT * FROM voice_profile WHERE id = 1")
    .first<VoiceProfile>();

  if (!result) throw new Error("Voice profile row missing — did you run the migration?");
  return result;
}

/**
 * Insert or replace the tone description and touch updated_at.
 * Uses ON CONFLICT upsert to respect the singleton constraint (id = 1).
 */
export async function upsertVoiceProfile(
  db: D1Database,
  toneDescription: string
): Promise<VoiceProfile> {
  await db
    .prepare(
      `INSERT INTO voice_profile (id, tone_description, updated_at)
       VALUES (1, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         tone_description = excluded.tone_description,
         updated_at       = CURRENT_TIMESTAMP`
    )
    .bind(toneDescription)
    .run();

  return getVoiceProfile(db);
}
