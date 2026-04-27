import type { CoverLetter } from "@/types";

// ── helpers ───────────────────────────────────────────────────────────────────

/** D1 stores approved as 0|1 INTEGER — coerce to boolean. */
function row(r: Record<string, unknown>): CoverLetter {
  return { ...r, approved: r.approved === 1 || r.approved === true } as unknown as CoverLetter;
}

// ── queries ───────────────────────────────────────────────────────────────────

/** Return all cover letters for a given application, newest first. */
export async function getCoverLettersByApplication(
  db: D1Database,
  applicationId: number
): Promise<CoverLetter[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM cover_letters
       WHERE application_id = ?
       ORDER BY created_at DESC`
    )
    .bind(applicationId)
    .all<Record<string, unknown>>();
  return results.map(row);
}

/** Insert a new cover letter and return the created row. */
export async function createCoverLetter(
  db: D1Database,
  applicationId: number,
  content: string
): Promise<CoverLetter> {
  const { meta } = await db
    .prepare(
      `INSERT INTO cover_letters (application_id, content, approved)
       VALUES (?, ?, 0)`
    )
    .bind(applicationId, content)
    .run();

  const created = await db
    .prepare("SELECT * FROM cover_letters WHERE id = ?")
    .bind(meta.last_row_id as number)
    .first<Record<string, unknown>>();

  if (!created) throw new Error("Failed to fetch newly created cover letter");
  return row(created);
}

/** Set the approved flag on a cover letter. */
export async function toggleCoverLetterApproved(
  db: D1Database,
  id: number,
  approved: boolean
): Promise<CoverLetter | null> {
  await db
    .prepare("UPDATE cover_letters SET approved = ? WHERE id = ?")
    .bind(approved ? 1 : 0, id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM cover_letters WHERE id = ?")
    .bind(id)
    .first<Record<string, unknown>>();

  return updated ? row(updated) : null;
}

/** Delete a cover letter by id. */
export async function deleteCoverLetter(
  db: D1Database,
  id: number
): Promise<void> {
  await db.prepare("DELETE FROM cover_letters WHERE id = ?").bind(id).run();
}
