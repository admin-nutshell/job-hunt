import type { Resume } from "@/types";

// ── queries ───────────────────────────────────────────────────────────────────

/**
 * Fetch the singleton resume row (id = 1).
 * The row is guaranteed to exist — it's seeded in the migration.
 */
export async function getResume(db: D1Database): Promise<Resume> {
  const result = await db
    .prepare("SELECT * FROM resume WHERE id = 1")
    .first<Resume>();

  if (!result) throw new Error("Resume row missing — did you run the migration?");
  return result;
}

/**
 * Insert or replace the resume content and touch updated_at.
 * Uses INSERT OR REPLACE to respect the singleton constraint (id = 1).
 */
export async function upsertResume(
  db: D1Database,
  content: string
): Promise<Resume> {
  await db
    .prepare(
      `INSERT INTO resume (id, content, updated_at)
       VALUES (1, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         content    = excluded.content,
         updated_at = CURRENT_TIMESTAMP`
    )
    .bind(content)
    .run();

  return getResume(db);
}
